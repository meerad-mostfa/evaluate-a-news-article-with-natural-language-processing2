define(["exports"], (function(exports) {
    "use strict";
  
    // Helper function for creating error messages
    const formatMessage = (msg, ...args) => {
      let formattedMsg = msg;
      if (args.length > 0) {
        formattedMsg += ` :: ${JSON.stringify(args)}`;
      }
      return formattedMsg;
    };
  
    // Custom error class
    class CustomError extends Error {
      constructor(name, details) {
        super(formatMessage(name, details));
        this.name = name;
        this.details = details;
      }
    }
  
    // Route handler base class
    class RouteHandler {
      constructor(match, handler, method = "GET") {
        this.handler = this._normalizeHandler(handler);
        this.match = match;
        this.method = method;
      }
  
      _normalizeHandler(handler) {
        return handler && typeof handler === "object" ? handler : { handle: handler };
      }
  
      setCatchHandler(handler) {
        this.catchHandler = this._normalizeHandler(handler);
      }
    }
  
    // Fetch handler class
    class FetchHandler extends RouteHandler {
      constructor(match, handler, method) {
        super(({ url }) => {
          const result = match.exec(url.href);
          if (result && (url.origin === location.origin || result.index === 0)) {
            return result.slice(1);
          }
        }, handler, method);
      }
    }
  
    // Main router class
    class Router {
      constructor() {
        this.routes = new Map();
        this.defaultHandlers = new Map();
      }
  
      addFetchListener() {
        self.addEventListener("fetch", (event) => {
          const { request } = event;
          const responsePromise = this._handleRequest({ request, event });
          if (responsePromise) {
            event.respondWith(responsePromise);
          }
        });
      }
  
      addCacheListener() {
        self.addEventListener("message", (event) => {
          if (event.data && event.data.type === "CACHE_URLS") {
            const { payload } = event.data;
            const cachePromises = payload.urlsToCache.map(url => {
              if (typeof url === "string") {
                url = [url];
              }
              const request = new Request(...url);
              return this._handleRequest({ request, event });
            });
            event.waitUntil(Promise.all(cachePromises));
            if (event.ports && event.ports[0]) {
              event.waitUntil(Promise.all(cachePromises).then(() => event.ports[0].postMessage(true)));
            }
          }
        });
      }
  
      _handleRequest({ request, event }) {
        const url = new URL(request.url, location.href);
        if (!url.protocol.startsWith("http")) return;
  
        const sameOrigin = url.origin === location.origin;
        const { params, route } = this._findMatchingRoute({ event, request, sameOrigin, url });
        let handler = route && route.handler;
        if (!handler && this.defaultHandlers.has(request.method)) {
          handler = this.defaultHandlers.get(request.method);
        }
        if (!handler) return;
  
        let responsePromise;
        try {
          responsePromise = handler.handle({ url, request, event, params });
        } catch (error) {
          responsePromise = Promise.reject(error);
        }
  
        const catchHandler = route && route.catchHandler;
        return responsePromise instanceof Promise && (this.catchHandler || catchHandler)
          ? responsePromise.catch(async (error) => {
              if (catchHandler) {
                try {
                  return await catchHandler.handle({ url, request, event, params });
                } catch (err) {
                  if (err instanceof Error) {
                    error = err;
                  }
                }
              }
              if (this.catchHandler) {
                return this.catchHandler.handle({ url, request, event });
              }
              throw error;
            })
          : responsePromise;
      }
  
      _findMatchingRoute({ url, sameOrigin, request, event }) {
        const handlers = this.routes.get(request.method) || [];
        for (const route of handlers) {
          const params = route.match({ url, sameOrigin, request, event });
          if (params) {
            if ((Array.isArray(params) && params.length === 0) || (params.constructor === Object && Object.keys(params).length === 0) || typeof params === "boolean") {
              params = undefined;
            }
            return { route, params };
          }
        }
        return {};
      }
  
      setDefaultHandler(handler, method = "GET") {
        this.defaultHandlers.set(method, this._normalizeHandler(handler));
      }
  
      setCatchHandler(handler) {
        this.catchHandler = this._normalizeHandler(handler);
      }
  
      registerRoute(route) {
        if (!this.routes.has(route.method)) {
          this.routes.set(route.method, []);
        }
        this.routes.get(route.method).push(route);
      }
  
      unregisterRoute(route) {
        if (!this.routes.has(route.method)) {
          throw new CustomError("unregister-route-but-not-found-with-method", { method: route.method });
        }
        const index = this.routes.get(route.method).indexOf(route);
        if (index === -1) {
          throw new CustomError("unregister-route-route-not-registered");
        }
        this.routes.get(route.method).splice(index, 1);
      }
    }
  
    // Create and configure the router instance
    let routerInstance;
    const getRouterInstance = () => {
      if (!routerInstance) {
        routerInstance = new Router();
        routerInstance.addFetchListener();
        routerInstance.addCacheListener();
      }
      return routerInstance;
    };
  
    // Configuration constants
    const config = {
      googleAnalytics: "googleAnalytics",
      precache: "precache-v2",
      prefix: "workbox",
      runtime: "runtime",
      suffix: typeof registration !== "undefined" ? registration.scope : ""
    };
  
    const generateCacheName = (suffix) => [config.prefix, suffix, config.suffix].filter(Boolean).join("-");
    const getPrecacheName = (name) => name || generateCacheName(config.precache);
    const getRuntimeName = (name) => name || generateCacheName(config.runtime);
  
    function waitUntil(event, promiseFunction) {
      const promise = promiseFunction();
      event.waitUntil(promise);
      return promise;
    }
  
    // Precaching and route handling functions
    function precacheEntries(entries) {
      getRouterInstance().precache(entries);
    }
  
    function registerRoute(strategy) {
      const route = new RouteHandler(strategy);
      getRouterInstance().registerRoute(route);
    }
  
    // Expose API functions
    exports.precacheAndRoute = function(entries, strategy) {
      precacheEntries(entries);
      registerRoute(strategy);
    };
  
    // Export classes and functions if needed
    exports.RouteHandler = RouteHandler;
    exports.FetchHandler = FetchHandler;
    exports.Router = Router;
  }));
  