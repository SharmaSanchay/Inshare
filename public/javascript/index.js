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

const maxAllowedSize = 100 * 1024 * 1024; //100MB

browseBtn.addEventListener("click", () => {
    fileInput.click();
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length === 1) {
        if (files[0].size < maxAllowedSize) {
            fileInput.files = files;
            uploadFile();
        } else {
            showToast("Max file size is 100MB");
        }
    } else if (files.length > 1) {
        showToast("You can't upload multiple files");
    }
    dropZone.classList.remove("dragged");
});

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragged");
});

dropZone.addEventListener("dragleave", (e) => {
    dropZone.classList.remove("dragged");
});

fileInput.addEventListener("change", () => {
    if (fileInput.files[0].size > maxAllowedSize) {
        showToast("Max file size is 100MB");
        fileInput.value = ""; // reset the input
        return;
    }
    uploadFile();
});

copyURLBtn.addEventListener("click", () => {
    fileURL.select();
    document.execCommand("copy");
    showToast("Copied to clipboard");
});

fileURL.addEventListener("click", () => {
    fileURL.select();
});
const uploadFile = () => {
    const files = fileInput.files;
    const formData = new FormData();
    formData.append("myfile", files[0]);

    // Show progress container
    progressContainer.style.display = "block";

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = function (event) {
        // Calculate and display the upload percentage
        let percent = Math.round((100 * event.loaded) / event.total);
        progressPercent.innerText = percent;
        const scaleX = `scaleX(${percent / 100})`;
        bgProgress.style.transform = scaleX;
        progressBar.style.transform = scaleX;
    };

    xhr.upload.onerror = function () {
        // Log error and show error message
        console.error(`Upload error: ${xhr.status}.`);
        showToast(`Error in upload: ${xhr.status}.`);
        fileInput.value = ""; // reset the input
    };

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // Handle successful upload
                onFileUploadSuccess(xhr.responseText);
            } else {
                // Log error details and show error message
                // console.error('Failed to upload file.', xhr.status, xhr.statusText);
                showToast('Failed to upload file.');
            }
        }
    };

    // Send the request
    xhr.open("POST", uploadURL);
    xhr.send(formData);
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

emailForm.addEventListener("submit", (e) => {
    e.preventDefault();
    emailForm[2].setAttribute("disabled", "true");
    emailForm[2].innerText = "Sending";
    const url = fileURL.value;
    const formData = {
        uuid: url.split("/").splice(-1, 1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value,
    };
    fetch(emailURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                showToast("Email Sent");
                sharingContainer.style.display = "none"; // hide the box
            }
        });
});

let toastTimer;
// the toast function
const showToast = (msg) => {
    clearTimeout(toastTimer);
    toast.innerText = msg;
    toast.classList.add("show");
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
};