// وظيفة لتحميل الوحدات النمطية بشكل ديناميكي
if (!self.define) {
    const modules = {};
  
    const loadModule = (url, base) => {
      const moduleUrl = new URL(url + ".js", base).href;
      return modules[moduleUrl] || new Promise((resolve) => {
        if ("document" in self) {
          const script = document.createElement("script");
          script.src = moduleUrl;
          script.onload = resolve;
          document.head.appendChild(script);
        } else {
          importScripts(moduleUrl);
          resolve();
        }
      }).then(() => {
        const module = modules[moduleUrl];
        if (!module) throw new Error(`Module ${moduleUrl} didn’t register its module`);
        return module;
      });
    };
  
    self.define = (dependencies, factory) => {
      const currentUrl = document.currentScript ? document.currentScript.src : location.href;
      if (modules[currentUrl]) return;
  
      let exports = {};
      const require = (dep) => loadModule(dep, currentUrl);
      const module = { uri: currentUrl };
      const context = { module, exports, require };
  
      modules[currentUrl] = Promise.all(dependencies.map((dep) => context[dep] || require(dep)))
        .then((values) => {
          factory(...values);
          return exports;
        });
    };
  }
  
  // تسجيل الخدمة وتخصيص الموارد
  define(["./workbox"], (workbox) => {
    "use strict";
  
    self.addEventListener("message", (event) => {
      if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
      }
    });
  
    workbox.precacheAndRoute([
      { url: "./index.html", revision: "93d8ad7b8edd10a31803c7c03c663067" },
      { url: "main.js", revision: "9979c06e24d97f9ed74b5ae38a270722" }
    ]);
  });
  