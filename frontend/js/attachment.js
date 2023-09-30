const attachmentInput = document.querySelector("#attachment");
const attachmentBtn = document.querySelector("#attachment-btn");

attachmentBtn.addEventListener("click", () => attachmentInput.click());

attachmentInput.addEventListener("change", (event) => {
  const selectedFile = event.target.files[0];

  if (selectedFile) {
    console.log("Selected file:", selectedFile);
  } else {
    console.log("No file selected");
  }
});
