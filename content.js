// Function to extract job description text from the page
function extractJobDescription() {
    console.log("Starting job description extraction...");
    let jobTextSet = new Set(); // Store unique job descriptions

    // Extract job description based on the website
    const hostname = window.location.hostname;

    if (hostname.includes("indeed.com")) {
        console.log("Extracting from Indeed...");
        extractIndeedJobDescription(jobTextSet);
    } else if (hostname.includes("workday.com")) {
        console.log("Extracting from Workday...");
        extractWorkdayJobDescription(jobTextSet);
    } else if (hostname.includes("linkedin.com")) {
        console.log("Extracting from LinkedIn...");
        extractLinkedInJobDescription(jobTextSet);
    } else {
        console.log("Extracting from a generic site...");
        extractGenericJobDescription(jobTextSet);
    }

    // Convert set to array, sort by length (longest first), and return the best one
    let jobDescriptions = [...jobTextSet].sort((a, b) => b.length - a.length);
    console.log("Job descriptions found:", jobDescriptions);

    let finalJobText = jobDescriptions.length ? cleanJobDescription(jobDescriptions[0]) : "Job description not found.";
    console.log("Final job description text:", finalJobText);

    // Send extracted job description to the popup or background script
    chrome.runtime.sendMessage({
        action: "sendJobDescription",
        text: finalJobText
    });
}

function extractIndeedJobDescription(jobTextSet) {
    const indeedDescElement = document.querySelector("div#jobDescriptionText");

    if (indeedDescElement) {
        const jobDescriptionText = indeedDescElement.innerText.trim();

        const startKeyword = "Full job description";
        const startIndex = jobDescriptionText.indexOf(startKeyword);

        if (startIndex !== -1) {
            // Extract text after the keyword
            const filteredText = jobDescriptionText.slice(startIndex + startKeyword.length).trim();

            // Clean the extracted text to remove unnecessary intro/ending phrases
            const cleanedText = cleanJobDescription(filteredText);

            // Add the cleaned text to the set
            jobTextSet.add(cleanedText);
        } else {
            const jobDescParagraphs = indeedDescElement.querySelectorAll("p, ul, ol");
            let jobDescText = "";

            jobDescParagraphs.forEach(el => {
                if (el.offsetParent !== null) {
                    jobDescText += el.innerText.trim() + "\n\n";
                }
            });

            if (jobDescText) {
                jobTextSet.add(jobDescText.trim());
            } else {
                jobTextSet.add(jobDescriptionText);
            }
        }
    } else {
        console.warn("Indeed job description element not found.");
    }
}

// Function to extract job description from Workday
function extractWorkdayJobDescription(jobTextSet) {
    console.log("Extracting job description from Workday...");
    const workdayDescElement = document.querySelector("div[class*='job-description'], div[id*='job-description']");

    if (workdayDescElement) {
        console.log("Found job description element on Workday.");
        jobTextSet.add(workdayDescElement.innerText.trim());
    } else {
        console.log("Checking for shadow DOM...");
        document.querySelectorAll("*").forEach(el => {
            if (el.shadowRoot) {
                const shadowDescElement = el.shadowRoot.querySelector("div[class*='job-description'], div[id*='job-description']");
                if (shadowDescElement) {
                    console.log("Found job description in shadow DOM.");
                    jobTextSet.add(shadowDescElement.innerText.trim());
                }
            }
        });
    }
}

// Function to extract job description from LinkedIn
function extractLinkedInJobDescription(jobTextSet) {
    console.log("Extracting job description from LinkedIn...");
    let jobText = "";
    let jobDescElement = document.querySelector(".jobs-description__container");
    
    if (jobDescElement) {
        jobText = jobDescElement.innerText.trim();
        jobTextSet.add(jobText);
    } else {
        console.warn("No LinkedIn job description found.");
    }

}

// Function to extract job description from generic sites
function extractGenericJobDescription(jobTextSet) {
    console.log("Extracting job description from a generic site...");
    const selectors = [
        "div[class*='jobDescription']",
        "div[class*='description']",
        "div[class*='posting']",
        "div[id*='jobDescription']",
        "section[class*='description']",
        "article[class*='description']",
        "div[id*='job-description']",
        "p"
    ];

    selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            if (el.offsetParent !== null) {
                console.log(`Found element with selector "${selector}":`, el.innerText.trim());
                jobTextSet.add(el.innerText.trim());
            }
        });
    });

    console.log("Checking for iframes...");
    document.querySelectorAll("iframe").forEach((iframe) => {
        try {
            let iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (iframeDoc) {
                selectors.forEach(selector => {
                    iframeDoc.querySelectorAll(selector).forEach(el => {
                        if (el.offsetParent !== null) {
                            console.log(`Found element in iframe with selector "${selector}":`, el.innerText.trim());
                            jobTextSet.add(el.innerText.trim());
                        }
                    });
                });
            }
        } catch (error) {
            console.warn("Cannot access iframe content due to cross-origin restrictions.");
        }
    });
}

// Function to clean up job description (removes filler text & trims properly)
function cleanJobDescription(text) {
    const introFillers = [
        "&nbsp",
        "Full job description",
        "we are looking for", 
        "about the company", 
        "company overview",
        "job overview",
        "role summary"
    ];

    const endingPhrases = [
        "apply now",
        "if you’re interested",
        "equal opportunity employer",
        "diversity and inclusion",
        "benefits"
    ];

    let lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);

    // Remove unnecessary intro lines
    while (lines.length > 0 && introFillers.some(filler => lines[0].toLowerCase().includes(filler))) {
        lines.shift();
    }

    // Find where job description should end
    let endIndex = lines.length;
    for (let i = 0; i < lines.length; i++) {
        if (endingPhrases.some(phrase => lines[i].toLowerCase().includes(phrase))) {
            endIndex = i;
            break;
        }
    }

    const cleanedText = lines.slice(0, endIndex).join("\n\n");
    return cleanedText;
}

// Run extraction function
extractJobDescription();