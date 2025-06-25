// Test vulnerable JavaScript code
const apiKey = "sk-1234567890abcdef";
const password = "hardcoded_password_123";

function displayUserContent(userInput) {
    document.getElementById('content').innerHTML = userInput;
}

function executeUserCode(code) {
    return eval(code);
}

function processData(data) {
    // Potential XSS vulnerability
    document.body.innerHTML = "<div>" + data + "</div>";
}

