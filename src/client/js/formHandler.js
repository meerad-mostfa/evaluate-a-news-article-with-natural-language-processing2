import { checkForName } from './nameChecker';

// تأكد من تحميل العنصر form قبل إضافة حدث submit
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('urlForm');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
});

async function handleSubmit(event) {
    event.preventDefault();

    const formText = document.getElementById('name').value;

    checkForName(formText);

    try {
        const response = await fetch('http://localhost:8000/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: formText })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        document.getElementById('results').innerText = JSON.stringify(data);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('results').innerText = 'An error occurred while processing your request.';
    }
}

// لا حاجة لتعيين handleSubmit على window إذا كنت تستخدمه مباشرة في addEventListener
