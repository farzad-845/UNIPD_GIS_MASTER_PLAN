const attachmentInput = document.querySelector("#attachment");
const attachmentBtn = document.querySelector("#attachment-btn");

let uploadedImg;

attachmentBtn.addEventListener("click", () => attachmentInput.click());

attachmentInput.addEventListener("change", (e) => {
  uploadedImg = e.target.files[0];

  if (uploadedImg) {
    console.log("Selected File: ", uploadedImg);
  } else {
    console.log("No file selected");
  }
});
