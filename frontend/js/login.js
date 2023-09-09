const formInputs = document.querySelectorAll(".input");
const passwordContainers = document.querySelectorAll(".password__container");
const passwordInput = document.querySelector("#password");
const repeatPasswordInput = document.querySelector("#repeat-password");
const submitBtn = document.querySelector("#submit-btn");

[...passwordContainers].map((container) => {
  const passwordInput = container.querySelector(".password__input");
  const togglePasswordBtn = container.querySelector(".toggle__password");

  togglePasswordBtn.addEventListener("click", () => {
    passwordInput.type =
      passwordInput.type === "password" ? "text" : "password";

    const btnIcon =
      passwordInput.type === "password"
        ? '<i class="ti ti-eye"></i>'
        : '<i class="ti ti-eye-closed"></i>';

    togglePasswordBtn.innerHTML = btnIcon;
  });
});

const checkRepeatPassword = () => {
  return passwordInput.value === repeatPasswordInput.value;
};

const disbaleSubmitBtn = () => submitBtn.classList.add("btn--disabled");

const enableSubmitBtn = () => submitBtn.classList.remove("btn--disabled");

const checkIfInputsAreFilled = () => {
  for (let i = 0; i < formInputs.length; i++) {
    if (
      !formInputs[i].value ||
      (repeatPasswordInput && !checkRepeatPassword())
    ) {
      disbaleSubmitBtn();
      return;
    }
  }

  enableSubmitBtn();
};

[...formInputs].map((input) => {
  input.addEventListener("input", () => checkIfInputsAreFilled());
  input.addEventListener("propertychange", () => checkIfInputsAreFilled());
});
