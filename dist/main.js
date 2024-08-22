
(() => {
    "use strict";
  
    // دعم الأساليب
    const applyStyles = (styles) => {
      const styleElement = document.createElement('style');
      styleElement.textContent = styles;
      document.head.appendChild(styleElement);
    };
  
    // وظائف التحقق
    const checkForName = (name) => {
      console.log("::: Running checkForName :::", name);
      const validNames = ["Picard", "Janeway", "Kirk", "Archer", "Georgiou"];
      alert(validNames.includes(name) ? "Welcome, Captain!" : "Enter a valid captain name");
    };
  
    // التعامل مع إرسال النموذج
    const handleSubmit = (event) => {
      event.preventDefault();
      const name = document.getElementById("name").value;
      checkForName(name);
      fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: name })
      })
      .then(response => response.json())
      .then(data => {
        document.getElementById("results").innerText = JSON.stringify(data);
      })
      .catch(error => console.error("Error:", error));
    };
  
    // إعداد الاستماع للحدث
    const form = document.getElementById("urlForm");
    if (form) {
      form.addEventListener("submit", handleSubmit);
      window.handleSubmit = handleSubmit;
    }
  
    // تطبيق الأنماط
    const styleElements = [
      { id: 561, styles: `* { box-sizing: border-box; } ... /* Other global styles */` },
      { id: 348, styles: `body { display: flex; flex-direction: column; min-height: 100vh; } ...` },
      { id: 306, styles: `` },
      { id: 923, styles: `form { border: 1px solid #545454; border-radius: 3px; padding: 40px; } ...` },
      { id: 752, styles: `header { display: flex; justify-content: space-between; padding: 10px 40px; }` }
    ];
  
    styleElements.forEach(({ styles }) => applyStyles(styles));
  
    // رسائل التحقق
    console.log("Check function initialized");
    alert("I EXIST");
    console.log("CHANGE!!");
  })();
  