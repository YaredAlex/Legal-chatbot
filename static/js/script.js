// Handling text message submission
let chatBoxContainer = document.getElementById("chat-box-container");
if (chatBoxContainer)
  chatBoxContainer.scrollTop = chatBoxContainer?.scrollHeight;
console.log("loaded");
document.getElementById("chat-form").addEventListener("submit", function (e) {
  e.preventDefault();
  chatBoxContainer = document.getElementById("chat-box-container");
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
  if (chatBoxContainer)
    chatBoxContainer.scrollTop = chatBoxContainer.scrollHeight;
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
      appendMessage("assistant", data.response, data.file_url);
    })
    .catch((error) => console.error("Error:", error))
    .finally(() => {
      loading_container.style.visibility = "hidden";
      loading_container.style.opacity = "0";
      if (chatBoxContainer)
        chatBoxContainer.scrollTop = chatBoxContainer.scrollHeight;
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
}
