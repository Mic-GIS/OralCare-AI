// // 1. UPDATED: Removed '-test' to use the active production webhook.
// // Make sure your workflow is toggled to "Active" in the n8n top right corner!
// const N8N_URL = "https://dexterity.app.n8n.cloud/webhook-test/oralcare-chat";

// const input = document.getElementById("messageInput");
// const sendButton = document.getElementById("sendButton");
// const chatArea = document.getElementById("chatArea");
// const welcome = document.getElementById("welcome");

// let sessionId = localStorage.getItem("oralcare_session");

// if (!sessionId) {
//     sessionId = crypto.randomUUID();
//     localStorage.setItem("oralcare_session", sessionId);
// }

// function addMessage(text, sender) {
//     if (welcome) {
//         welcome.style.display = "none";
//     }

//     const message = document.createElement("div");
//     message.classList.add("message", sender);
//     message.textContent = text;
//     chatArea.appendChild(message);
    
//     window.scrollTo(0, document.body.scrollHeight);
// }

// async function sendMessage(text) {
//     if (!text.trim()) {
//         return;
//     }

//     addMessage(text, "user");
//     input.value = "";
//     addMessage("Thinking...", "bot");

//     try {
//         const response = await fetch(N8N_URL, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//                 message: text,
//                 sessionId: sessionId
//             })
//         });

//         const data = await response.json();
//         console.log("n8n response data:", data);

//         const messages = document.querySelectorAll(".message.bot");
//         const thinkingMessage = messages[messages.length - 1];

//         if (thinkingMessage) {
//             let botReply = "";

//             // NEW FIX: Check if n8n returned an Array instead of an Object
//             if (Array.isArray(data) && data.length > 0) {
//                 // Look inside the first item of the array for 'output'
//                 botReply = data[0].output || data[0].reply || data[0].message || JSON.stringify(data[0]);
//             } else {
//                 // Standard object fallback
//                 botReply = data.output || data.reply || data.message || JSON.stringify(data);
//             }

//             // Apply the text to the chat bubble
//             thinkingMessage.textContent = botReply;
//         }

//     } catch (error) {
//         console.error("Fetch error:", error);

//         const messages = document.querySelectorAll(".message.bot");
//         const thinkingMessage = messages[messages.length - 1];

//         if (thinkingMessage) {
//             thinkingMessage.textContent = "Sorry, I couldn't connect to OralCare AI. Please try again.";
//         }
//     }
// }

// sendButton.addEventListener("click", () => {
//     sendMessage(input.value);
// });

// input.addEventListener("keydown", (event) => {
//     if (event.key === "Enter") {
//         sendMessage(input.value);
//     }
// });

// document.querySelectorAll(".quick-buttons button").forEach(button => {
//     button.addEventListener("click", () => {
//         sendMessage(button.dataset.message);
//     });
// });




// 1. Production URL (Ensure your workflow is activated in n8n)
const N8N_URL = "https://dexterity.app.n8n.cloud/webhook-test/oralcare-chat";

const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const chatArea = document.getElementById("chatArea");
const welcome = document.getElementById("welcome");

let sessionId = localStorage.getItem("oralcare_session");

if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("oralcare_session", sessionId);
}

function addMessage(text, sender) {
    if (welcome) {
        welcome.style.display = "none";
    }

    const message = document.createElement("div");
    message.classList.add("message", sender);

    // Render plain text for user, HTML/Markdown for bot
    if (sender === "user") {
        message.textContent = text;
    } else {
        message.innerHTML = typeof marked !== "undefined" ? marked.parse(text) : text;
    }

    chatArea.appendChild(message);
    window.scrollTo(0, document.body.scrollHeight);
}

async function sendMessage(text) {
    if (!text.trim()) return;

    addMessage(text, "user");
    input.value = "";
    addMessage("Thinking...", "bot");

    try {
        const response = await fetch(N8N_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: text,
                sessionId: sessionId
            })
        });

        const data = await response.json();
        console.log("n8n response data:", data);

        const messages = document.querySelectorAll(".message.bot");
        const thinkingMessage = messages[messages.length - 1];

        if (thinkingMessage) {
            let botReply = "";

            if (Array.isArray(data) && data.length > 0) {
                botReply = data[0].output || data[0].reply || data[0].message || JSON.stringify(data[0]);
            } else {
                botReply = data.output || data.reply || data.message || JSON.stringify(data);
            }

            // Convert Markdown from n8n into styled HTML
            if (typeof marked !== "undefined") {
                thinkingMessage.innerHTML = marked.parse(botReply);
            } else {
                thinkingMessage.textContent = botReply;
            }

            window.scrollTo(0, document.body.scrollHeight);
        }

    } catch (error) {
        console.error("Fetch error:", error);

        const messages = document.querySelectorAll(".message.bot");
        const thinkingMessage = messages[messages.length - 1];

        if (thinkingMessage) {
            thinkingMessage.textContent = "Sorry, I couldn't connect to OralCare AI. Please try again.";
        }
    }
}

sendButton.addEventListener("click", () => {
    sendMessage(input.value);
});

input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendMessage(input.value);
    }
});

document.querySelectorAll(".quick-buttons button").forEach(button => {
    button.addEventListener("click", () => {
        sendMessage(button.dataset.message);
    });
});