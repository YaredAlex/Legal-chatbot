// Voice recording variables
let mediaRecorder;

// Handling text message submission
document.getElementById("chat-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const inputField = document.getElementById("chat-input");
  const loading_container = document.getElementById("loading_container");
  const message = inputField.value.trim();
  if (message === "") return;

  // Append user's message to chat display
  appendMessage("user", message);
  inputField.value = "";
  //show loading
  loading_container.style.visibility = "visible";
  loading_container.style.opacity = "1";
  console.log(loading_container.style.display);
  // Send the text message to Flask endpoint using JSON
  fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: message }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Append the assistant's reply (text & optional audio) to the chat-box
      console.log(data);
      appendMessage("assistant", data.response, data.audio_url);
    })
    .catch((error) => console.error("Error:", error))
    .finally(() => {
      loading_container.style.visibility = "hidden";
      loading_container.style.opacity = "0";
    });
});

// Function to append a message to the chat box
function appendMessage(sender, text, audio_url = null) {
  const chatBox = document.getElementById("chat-box");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  if (sender === "assistant") {
    messageDiv.classList.add("assistant-message");
    messageDiv.innerHTML = `
        <div class="msg-content">
          <p class="mb-1">${text}</p>
          ${
            audio_url
              ? `<audio controls src="${audio_url}" autoplay ></audio>`
              : ""
          }
        </div>
      `;
  } else {
    messageDiv.classList.add("user-message");
    messageDiv.innerHTML = `
        <div class="msg-content">
          <p class="mb-1">${text}</p>
        </div>
      `;
  }
  chatBox.appendChild(messageDiv);
  // Auto-scroll to the bottom of the chat box
  chatBox.scrollTop = chatBox.scrollHeight;
}
