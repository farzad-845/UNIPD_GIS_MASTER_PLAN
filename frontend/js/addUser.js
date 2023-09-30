const userFormBtn = document.querySelector("#add-user-btn");
const userFormContainer = document.querySelector(".form__container");
const userForm = document.querySelector("#user-form");
const userFormInputs = userFormContainer.querySelectorAll(".form__input");
const userFormCanceleBtns = userFormContainer.querySelectorAll(".cancel__btn");
const userSubmitBtn = userFormContainer.querySelector("#user-submit-btn");
const passwordContainers = userFormContainer.querySelectorAll(
  ".password__container"
);
const passwordInput = userFormContainer.querySelector("#password");
const repeatPasswordInput = userFormContainer.querySelector("#repeat-password");

userFormBtn.addEventListener("click", () =>
  userFormContainer.classList.toggle("form__container--hidden")
);

[...userFormInputs].map((input) => {
  input.addEventListener("input", () =>
    [...userFormInputs].every((i) => Boolean(i.value) && checkRepeatPassword())
      ? enableSubmitBtn(userSubmitBtn)
      : disbaleSubmitBtn(userSubmitBtn)
  );
  input.addEventListener("propertychange", () =>
    [...userFormInputs].every((i) => Boolean(i.value) && checkRepeatPassword())
      ? enableSubmitBtn(userSubmitBtn)
      : disbaleSubmitBtn(userSubmitBtn)
  );
});

[...userFormCanceleBtns].map((btn) =>
  btn.addEventListener("click", () =>
    userFormContainer.classList.add("form__container--hidden")
  )
);

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

userForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const formData = new FormData(userForm);
    let newUser = Object.fromEntries(formData);

    newUser = { ...newUser, role_id: roles[newUser.role].id };

    delete newUser.role;

    console.log(newUser);

    const response = await axios.post(`${APIpath}/user`, newUser, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    displayAlert("User was successfuly added!", "success");
    userFormContainer.classList.add("form__container--hidden");
    console.log(response.data);
  } catch (error) {
    console.error(error);

    if (error.response) {
      displayAlert(error.response?.data.detail, "error");

      if (error.response.status === 401 || error.response.status === 403) {
        window.location.href = "login.html";
      }
    } else {
      displayAlert(
        "There seems to be a problem with your network connection.",
        "error"
      );
    }
  }
});
