const attachmentInput = document.querySelector("#attachment");
const attachmentBtn = document.querySelector("#attachment-btn");
const attachmentDisplay = document.querySelector(".file__display");
const displayedImg = attachmentDisplay.querySelector(".display__img");

let uploadedImg;

attachmentBtn.addEventListener("click", () => attachmentInput.click());

attachmentInput.addEventListener("change", (e) => {
  uploadedImg = e.target.files[0];

  if (uploadedImg) {
    const reader = new FileReader();

    reader.onload = (e) => {
      displayedImg.src = e.target.result;
    };

    reader.readAsDataURL(attachmentInput.files[0]);

    attachmentBtn.classList.add("file__btn--hidden");
    attachmentDisplay.classList.remove("file__display--hidden");
    console.log("Selected File: ", uploadedImg);
  } else {
    console.log("No file selected");
  }
});

attachmentDisplay.addEventListener("click", () => {
  uploadedImg = null;
  attachmentBtn.classList.remove("file__btn--hidden");
  attachmentDisplay.classList.add("file__display--hidden");
});
