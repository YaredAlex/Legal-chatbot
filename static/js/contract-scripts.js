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

  // fetch("/api/chat", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({ message: message }),
  // })
  //   .then((response) => response.json())
  //   .then((data) => {
  //     // Append the assistant's reply (text & optional audio) to the chat-box
  //     console.log(data);
  //     appendMessage("assistant", data.response, data.audio_url);
  //   })
  //   .catch((error) => console.error("Error:", error))
  //   .finally(() => {
  //     loading_container.style.visibility = "hidden";
  //     loading_container.style.opacity = "0";
  //   });
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

// Store default templates in localStorage if not already present
document.addEventListener("DOMContentLoaded", function () {
  // Check if we're on a specific contract page
  const employmentForm = document.getElementById("employmentContractForm");
  const salesForm = document.getElementById("salesContractForm");
  const serviceForm = document.getElementById("serviceContractForm");

  // Initialize default templates if they don't exist
  if (
    !localStorage.getItem("employmentTemplate") &&
    document.querySelector(".employee-contract")
  ) {
    localStorage.setItem(
      "employmentTemplate",
      document.querySelector(".employee-contract").outerHTML
    );
  }

  if (
    !localStorage.getItem("salesTemplate") &&
    document.querySelector(".sales-contract")
  ) {
    localStorage.setItem(
      "salesTemplate",
      document.querySelector(".sales-contract").outerHTML
    );
  }

  if (
    !localStorage.getItem("serviceTemplate") &&
    document.querySelector(".service-contract")
  ) {
    localStorage.setItem(
      "serviceTemplate",
      document.querySelector(".service-contract").outerHTML
    );
  }

  // Set up automatic calculation for total price in sales contract
  const quantityInput = document.getElementById("product_quantity");
  const unitPriceInput = document.getElementById("unit_price");

  if (quantityInput && unitPriceInput) {
    quantityInput.addEventListener("input", calculateTotal);
    unitPriceInput.addEventListener("input", calculateTotal);
  }

  // Setup signature name updates
  setupSignatureUpdates();

  // Tab switching functionality
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabGroup = this.closest(".tabs");
      const container = this.closest(".container");

      // Deactivate all tabs in this group
      tabGroup.querySelectorAll(".tab").forEach((t) => {
        t.classList.remove("active");
      });

      // Deactivate all tab contents
      container.querySelectorAll(".tab-content").forEach((content) => {
        content.classList.remove("active");
      });

      // Activate clicked tab
      this.classList.add("active");

      // Activate corresponding tab content
      const tabId = this.getAttribute("data-tab") + "Tab";
      container.querySelector("#" + tabId).classList.add("active");
    });
  });

  // Preview contract buttons
  document.querySelectorAll(".preview-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const contractType = this.getAttribute("data-contract");
      generatePreview(contractType);

      // Switch to preview tab
      const previewTabSelector = `.tab[data-tab="${contractType}-preview"]`;
      document.querySelector(previewTabSelector).click();
    });
  });

  // Edit contract buttons
  document.querySelectorAll(".edit-contract-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const contractType = this.getAttribute("data-contract");
      const editorTabSelector = `.tab[data-tab="${contractType}-editor"]`;
      document.querySelector(editorTabSelector).click();
    });
  });

  // Reset template buttons
  document.querySelectorAll(".reset-template-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const contractType = this.getAttribute("data-contract");

      if (
        confirm(
          "Are you sure you want to reset to the default template? Any customizations will be lost."
        )
      ) {
        // Reset from localStorage or fetch from server
        const defaultTemplate = localStorage.getItem(
          `${contractType}DefaultTemplate`
        );
        if (defaultTemplate) {
          document.getElementById(`${contractType}CustomTemplate`).value =
            defaultTemplate;
        } else {
          // Fetch default from server as fallback
          fetch(`/api/default-template/${contractType}`)
            .then((response) => response.text())
            .then((template) => {
              document.getElementById(`${contractType}CustomTemplate`).value =
                template;
            });
        }
      }
    });
  });

  // Form submission from preview
  const previewForm = document.getElementById("previewSubmitForm");
  if (previewForm) {
    const previewDataField = document.getElementById("preview_data_field");
    const previewContainer = document.querySelector(".preview-container");

    if (previewDataField && previewContainer) {
      previewForm.addEventListener("submit", function (e) {
        previewDataField.value = previewContainer.innerHTML;
      });
    }
  }
});

function calculateTotal() {
  const quantity = document.getElementById("product_quantity").value;
  const unitPrice = document
    .getElementById("unit_price")
    .value.replace(/[^0-9.]/g, "");

  if (quantity && unitPrice) {
    const total = (parseFloat(quantity) * parseFloat(unitPrice)).toFixed(2);
    document.getElementById("total_price").value = "$" + total;
  }
}

function setupSignatureUpdates() {
  // Employment contract signatures
  const employeeName = document.getElementById("employee_name");
  const employerName = document.getElementById("employer_name");

  if (employeeName) {
    employeeName.addEventListener("input", updateSignatureNames);
  }

  if (employerName) {
    employerName.addEventListener("input", updateSignatureNames);
  }

  // Sales contract signatures
  const buyerName = document.getElementById("buyer_name");
  const sellerName = document.getElementById("seller_name");

  if (buyerName) {
    buyerName.addEventListener("input", updateSignatureNames);
  }

  if (sellerName) {
    sellerName.addEventListener("input", updateSignatureNames);
  }

  // Service contract signatures
  const clientName = document.getElementById("client_name");
  const providerName = document.getElementById("provider_name");

  if (clientName) {
    clientName.addEventListener("input", updateSignatureNames);
  }

  if (providerName) {
    providerName.addEventListener("input", updateSignatureNames);
  }

  // Initialize signatures
  updateSignatureNames();
}

function updateSignatureNames() {
  // Employment contract signatures
  updateSignature("employee_name", "employee_signature_name");
  updateSignature("employer_name", "employer_signature_name");

  // Sales contract signatures
  updateSignature("buyer_name", "buyer_signature_name");
  updateSignature("seller_name", "seller_signature_name");

  // Service contract signatures
  updateSignature("client_name", "client_signature_name");
  updateSignature("provider_name", "provider_signature_name");
}

function updateSignature(inputId, signatureId) {
  const inputElement = document.getElementById(inputId);
  const signatureElement = document.getElementById(signatureId);

  if (inputElement && signatureElement) {
    const value = inputElement.value || "____________________";
    signatureElement.textContent = value;
  }
}

function generatePreview(contractType) {
  // Get the form data
  const form = document.getElementById(`${contractType}ContractForm`);
  const formData = new FormData(form);
  const data = {};

  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }

  // Get the template from the textarea or use the default
  let template;
  const customTemplateTextarea = document.getElementById(
    `${contractType}CustomTemplate`
  );

  if (customTemplateTextarea && customTemplateTextarea.value.trim() !== "") {
    template = customTemplateTextarea.value;
  } else {
    // Use the current form layout as template
    template = document.querySelector(
      `.contract-container.${contractType}-contract`
    ).outerHTML;
  }

  // Replace input fields with their values
  let previewHTML = template;

  // Replace all input fields with their values
  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`<input[^>]*name=["']${key}["'][^>]*>`, "g");
    previewHTML = previewHTML.replace(regex, data[key]);
  });

  // Replace select fields with their selected values
  form.querySelectorAll("select").forEach((select) => {
    const key = select.name;
    const value = select.options[select.selectedIndex].text;
    const regex = new RegExp(
      `<select[^>]*name=["']${key}["'][^>]*>.*?</select>`,
      "gs"
    );
    previewHTML = previewHTML.replace(regex, value);
  });

  // Replace textarea fields with their values
  form.querySelectorAll("textarea").forEach((textarea) => {
    const key = textarea.name;
    const value = textarea.value.replace(/\n/g, "<br>");
    const regex = new RegExp(
      `<textarea[^>]*name=["']${key}["'][^>]*>.*?</textarea>`,
      "gs"
    );
    previewHTML = previewHTML.replace(regex, value);
  });

  // Update the preview container
  const previewContainer = document.getElementById(
    `${contractType}ContractPreview`
  );
  if (previewContainer) {
    previewContainer.innerHTML = previewHTML;
  }
}
