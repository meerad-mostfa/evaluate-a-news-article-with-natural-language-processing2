function checkForName(inputText) {
    console.log("::: Running checkForName :::", inputText);

    // قائمة بأسماء القادة
    const names = [
        "Picard",
        "Janeway",
        "Kirk",
        "Archer",
        "Georgiou"
    ];

    // التحقق من وجود الاسم في القائمة
    const message = names.includes(inputText) 
        ? "Welcome, Captain!" 
        : "Enter a valid captain name";

    // عرض رسالة للمستخدم
    alert(message);
}

export { checkForName };
