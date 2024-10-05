const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector("#browseBtn");
const bgProgress = document.querySelector(".bg-progress");
const progressPercent = document.querySelector("#progressPercent");
const progressContainer = document.querySelector(".progress-container");
const progressBar = document.querySelector(".progress-bar");
const status = document.querySelector(".status");
const sharingContainer = document.querySelector(".sharing-container");
const copyURLBtn = document.querySelector("#copyURLBtn");
const fileURL = document.querySelector("#fileURL");
const emailForm = document.querySelector("#emailForm");
const toast = document.querySelector(".toast");

const baseURL = "https://inshare-1-o9b6.onrender.com";
const uploadURL = `${baseURL}/api/files`;
const emailURL = `${baseURL}/api/files/send`;
const maxAllowedSize = 100 * 1024 * 1024; // 100MB

const init = () => {
    attachEventListeners();
};

const attachEventListeners = () => {
    browseBtn.addEventListener("click", () => fileInput.click());
    dropZone.addEventListener("drop", handleFileDrop);
    dropZone.addEventListener("dragover", (e) => e.preventDefault());
    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragged"));
    fileInput.addEventListener("change", handleFileInputChange);
    copyURLBtn.addEventListener("click", copyToClipboard);
    fileURL.addEventListener("click", () => fileURL.select());
    emailForm.addEventListener("submit", handleEmailFormSubmit);
};

const handleFileDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length === 1) {
        validateAndUploadFile(files[0]);
    } else {
        showToast(files.length > 1 ? "You can't upload multiple files" : "");
    }
    dropZone.classList.remove("dragged");
};

const handleFileInputChange = () => {
    const file = fileInput.files[0];
    if (file) {
        validateAndUploadFile(file);
    }
};

const validateAndUploadFile = (file) => {
    if (file.size > maxAllowedSize) {
        showToast("Max file size is 100MB");
        fileInput.value = ""; // reset the input
        return;
    }
    uploadFile(file);
};

const copyToClipboard = () => {
    fileURL.select();
    document.execCommand("copy");
    showToast("Copied to clipboard");
};

const uploadFile = (file) => {
    const formData = new FormData();
    formData.append("myfile", file);

    // Show progress container
    progressContainer.style.display = "block";

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (event) => updateProgress(event);
    xhr.upload.onerror = () => handleUploadError(xhr);
    xhr.onreadystatechange = () => handleUploadResponse(xhr);

    // Send the request
    xhr.open("POST", uploadURL);
    xhr.send(formData);
};

const updateProgress = (event) => {
    const percent = Math.round((100 * event.loaded) / event.total);
    progressPercent.innerText = percent;
    const scaleX = `scaleX(${percent / 100})`;
    bgProgress.style.transform = scaleX;
    progressBar.style.transform = scaleX;
};

const handleUploadError = (xhr) => {
    console.error(`Upload error: ${xhr.status}.`);
    showToast(`Error in upload: ${xhr.status}.`);
    fileInput.value = ""; // reset the input
};

const handleUploadResponse = (xhr) => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
            onFileUploadSuccess(xhr.responseText);
        } else {
            console.error('Failed to upload file.', xhr.status, xhr.statusText, xhr.responseText);
            showToast('Failed to upload file.');
        }
    }
};

const onFileUploadSuccess = (res) => {
    fileInput.value = ""; // reset the input
    status.innerText = "Uploaded";
    emailForm[2].removeAttribute("disabled");
    emailForm[2].innerText = "Send";
    progressContainer.style.display = "none"; // hide the box

    try {
        const { file: url } = JSON.parse(res);
        sharingContainer.style.display = "block";
        fileURL.value = url;
    } catch (error) {
        showToast('Error parsing response.');
    }
};

const handleEmailFormSubmit = (e) => {
    e.preventDefault();
    const submitButton = emailForm[2];
    submitButton.setAttribute("disabled", "true");
    submitButton.innerText = "Sending";

    const url = fileURL.value;
    const uuid = url.split("/").pop();
    const emailData = {
        uuid: uuid,
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value,
    };

    sendEmail(emailData, submitButton);
};

const sendEmail = (emailData, submitButton) => {
    fetch(emailURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                showToast("Email Sent");
                sharingContainer.style.display = "none"; // hide the box
            }
        })
        .finally(() => {
            submitButton.removeAttribute("disabled");
            submitButton.innerText = "Send"; // reset button
        });
};

let toastTimer;
const showToast = (msg) => {
    clearTimeout(toastTimer);
    toast.innerText = msg;
    toast.classList.add("show");
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
};

// Initialize event listeners
init();
