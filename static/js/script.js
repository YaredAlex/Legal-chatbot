let file = null;
const chatBoxContainerScrollTop = () => {
  let chatBoxContainer = document.getElementById("chat-box-container");
  if (chatBoxContainer)
    chatBoxContainer.scrollTop = chatBoxContainer?.scrollHeight;
};
const changeChatLayout = () => {
  //hide card
  let templateContainer = document.querySelector(".template-cards-container");
  if (templateContainer && !templateContainer.classList.contains("d-none")) {
    templateContainer.classList.add(["d-none"]);
  }

  let inputArea = document.getElementById("input-area");
  if (inputArea && !inputArea.classList.contains("fixed-bottom"))
    inputArea.classList.add(["fixed-bottom"]);

  let chatBoxContainer = document.getElementById("chat-box-container");
  if (chatBoxContainer && chatBoxContainer.classList.contains("shrink"))
    chatBoxContainer.classList.remove("shrink");
};
chatBoxContainerScrollTop();
document.getElementById("chat-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const inputField = document.getElementById("chat-input");
  const loading_container = document.getElementById("loading_container");
  const message = inputField.value.trim();
  if (message === "") return;
  changeChatLayout();
  //clearning inputs
  appendMessage("user", message);
  inputField.value = "";
  document.getElementById("attached-files").innerHTML = ``;
  //show loading
  loading_container.style.visibility = "visible";
  loading_container.style.opacity = "1";
  chatBoxContainerScrollTop();
  const formData = new FormData();
  formData.append("message", message);
  formData.append("file", file);
  fetch("/api/chat", {
    method: "POST",
    // headers: {
    //   "Content-Type": "multipart/form-data",
    // },
    body: formData,
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
      chatBoxContainerScrollTop();
    });
});
// Function to append a message to the chat box
function appendMessage(sender, text, audio_url = null) {
  const chatBox = document.getElementById("chat-box");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  if (sender === "assistant") {
    messageDiv.classList.add("assistant-message");
    const messageContent = document.createElement("div");
    messageContent.classList.add(["msg-content"]);
    console.log(text);
    messageContent.innerHTML = marked.parse(text);
    messageDiv.appendChild(messageContent);
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
//attach file to file
document.getElementById("file-upload").addEventListener("input", function (e) {
  const f = e.target.files[0];
  if (f) {
    file = f;

    const attachedFiles = document.getElementById("attached-files");
    attachedFiles.innerHTML = ""; // Clear existing files

    const fileHolder = document.createElement("div");
    fileHolder.classList.add(
      "border",
      "rounded",
      "px-2",
      "py-1",
      "d-flex",
      "align-items-center",
      "justify-content-between",
      "mb-2"
    );

    // File name span
    const fileName = document.createElement("span");
    fileName.innerText = f.name;

    // Remove icon
    const removeIcon = document.createElement("i");
    removeIcon.classList.add(
      "fas",
      "fa-times",
      "text-danger",
      "cursor-pointer"
    );
    removeIcon.style.marginLeft = "10px";
    removeIcon.style.cursor = "pointer";

    // Remove on click
    removeIcon.addEventListener("click", () => {
      attachedFiles.removeChild(fileHolder);
      file = null;
    });

    fileHolder.appendChild(fileName);
    fileHolder.appendChild(removeIcon);
    attachedFiles.appendChild(fileHolder);
    document.getElementById("file-count").innerText = "";
  }
});

//format message when loading history
const formatMessages = () => {
  const messageContent = document.querySelectorAll(".msg-content");
  if (messageContent) {
    messageContent.forEach(function (element) {
      const content = element.textContent || element.innerText;
      element.innerHTML = marked.parse(content);
    });
  }
};
//trim history title
const trimHistoryTitle = () => {
  const historyTitles = document.querySelectorAll(".conversation-title");
  if (historyTitles) {
    historyTitles.forEach(function (history) {
      let text = history.innerHTML;
      if (text.length > 12) {
        history.innerText = text.substring(0, 12) + "...";
      }
    });
  }
};
document.addEventListener("DOMContentLoaded", () => {
  formatMessages();
  trimHistoryTitle();
});
