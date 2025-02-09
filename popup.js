document.addEventListener("DOMContentLoaded", () => {
    // Restore previous values from localStorage
    document.getElementById("resumeText").value = localStorage.getItem("resumeText") || "";
    document.getElementById("extraKnowledge").value = localStorage.getItem("extraKnowledge") || "";
    document.getElementById("coverLetterTemplate").value = localStorage.getItem("coverLetterTemplate") || "";
    document.getElementById("apiKey").value = localStorage.getItem("apiKey") || "";

    chrome.storage.local.get('generatedCoverLetter', (data) => {
        savedCoverLetter = data.generatedCoverLetter;
        
        if (savedCoverLetter) {
            document.getElementById("coverLetterOutput").value = savedCoverLetter;
            document.getElementById("coverLetterContainer").style.display = "block"; // Show the output container
        } else {
            document.getElementById("coverLetterContainer").style.display = "none"; // Hide if no saved cover letter
        }
    });
    
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


document.getElementById("coverLetterBtn").addEventListener("click", async () => {
    // Collect user inputs from the popup
    var jobDescription = document.getElementById("jobDescription").value.trim();
    var resumeText = document.getElementById("resumeText").value.trim();
    var extraKnowledge = document.getElementById("extraKnowledge").value.trim();
    var coverLetterTemplate = document.getElementById("coverLetterTemplate").value.trim();
    var apiKey = document.getElementById("apiKey").value.trim();
    var llmSelect = document.getElementById("llmSelect").value;

    // Validate inputs
    if (!jobDescription || !resumeText || !coverLetterTemplate || !apiKey) {
        alert("Please fill in the required fields: Job Description, Resume, Cover Letter Template, and API Key.");
        return;
    }

    var requestData = {
        action: "generateCoverLetter",
        data: {
            jobDescription,
            resumeText,
            extraKnowledge,
            coverLetterTemplate,
            apiKey,
            llmSelect
        }
    };

    // Send message to background.js
    chrome.runtime.sendMessage(requestData, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Error:", chrome.runtime.lastError);
            alert("Failed to send request. Please try again.");
            return;
        }
        if (response) {
            document.getElementById("coverLetterOutput").value = response;
            document.getElementById("coverLetterContainer").style.display = "block";
        } else {
            console.warn("No cover letter generated.");
        }
    });
});

document.getElementById("copyCoverLetter").addEventListener("click", () => {
    coverLetterText = document.getElementById("coverLetterOutput").value;

    if (coverLetterText) {
        // Use the Clipboard API to copy the text
        navigator.clipboard.writeText(coverLetterText)
            .then(() => {
                alert("Cover letter copied to clipboard!");
            })
            .catch((error) => {
                console.error("Failed to copy text: ", error);
                alert("Failed to copy cover letter. Please try again.");
            });
    } else {
        alert("No cover letter to copy.");
    }
});

    