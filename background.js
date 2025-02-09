chrome.runtime.onInstalled.addListener(() => {
    console.log("Job Application Assistant extension installed.");
  });
  
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background received message:");
  if (message.action === "generateCoverLetter") {
    var data = message.data;

    // Construct prompt using custom template
    prompt_all = `
    Generate a professional cover letter for the following job description and resume using additional information (if any) according to over Letter Template:

    **Job Description:**
    ${data.jobDescription}

    **Resume:**
    ${data.resumeText}

    **Extra Knowledge (if any):**
    ${data.extraKnowledge || "N/A"}

    **Cover Letter Template:**
    ${data.coverLetterTemplate}
    `;

      // Perform API request in the background
      fetch("https://rest-llm-api-calls.onrender.com/get_fields", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: prompt_all,
                model: data.llmSelect,
                api_key: data.apiKey
            })
      })
      .then(response => response.json())
      .then(responseData => {
        // Log the entire responseData to see the raw response
        console.log("Recieved response from llm")
          if (responseData) {
            // console.log("Recieved Response:", responseData);
            chrome.storage.local.set({ 'generatedCoverLetter': responseData}, () => {
              console.log('Cover letter saved to storage');
          });
            sendResponse(responseData);
          } else {
              console.warn("No valid response received.");
              sendResponse({});
          }
      })
      .catch(error => {
          console.error("Error:", error);
          sendResponse({});
      });

      // Return true to indicate we will send a response asynchronously
      return true;
  }
});