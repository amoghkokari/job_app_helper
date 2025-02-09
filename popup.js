document.addEventListener("DOMContentLoaded", () => {
    // Restore previous values from localStorage
    document.getElementById("resumeText").value = localStorage.getItem("resumeText") || "";
    document.getElementById("extraKnowledge").value = localStorage.getItem("extraKnowledge") || "";
    document.getElementById("coverLetterTemplate").value = localStorage.getItem("coverLetterTemplate") || "";
    document.getElementById("apiKey").value = localStorage.getItem("apiKey") || "";
    
    // Add event listeners to save changes automatically
    document.getElementById("resumeText").addEventListener("input", saveData);
    document.getElementById("extraKnowledge").addEventListener("input", saveData);
    document.getElementById("coverLetterTemplate").addEventListener("input", saveData);
    document.getElementById("apiKey").addEventListener("input", saveData);

    // Toggle API key visibility
    document.getElementById("toggleApiKey").addEventListener("click", () => {
        const apiKeyField = document.getElementById("apiKey");
        if (apiKeyField.type === "password") {
            apiKeyField.type = "text";
            document.getElementById("toggleApiKey").textContent = "Hide";
        } else {
            apiKeyField.type = "password";
            document.getElementById("toggleApiKey").textContent = "Show";
        }
    });
});

// Function to save inputs
function saveData() {
    localStorage.setItem("resumeText", document.getElementById("resumeText").value);
    localStorage.setItem("extraKnowledge", document.getElementById("extraKnowledge").value);
    localStorage.setItem("coverLetterTemplate", document.getElementById("coverLetterTemplate").value);
    localStorage.setItem("apiKey", document.getElementById("apiKey").value);
}

// Scan Job Description
document.getElementById("scanBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['content.js'] // Inject content.js into the active tab
        });
    });
});

// Listen for the result from content.js and only update job description
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "sendJobDescription") {
        document.getElementById("jobDescription").value = message.text;
    }
});
