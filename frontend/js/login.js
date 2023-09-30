const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
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

const loginUser = async ({ email, password }) => {
  try {
    const response = await axios.post(`${APIpath}/login`, { email, password });
    const currentUser = response.data;

    displayAlert("Login Successful!", "success");

    localStorage.setItem("user_data", JSON.stringify(currentUser.data.user));

    localStorage.setItem(
      "access_token",
      JSON.stringify(currentUser.data.access_token)
    );

    redirectUser(currentUser.data.user);
  } catch (error) {
    console.error(error);

    if (error.response) {
      displayAlert(error.response?.data.detail, "error");
    } else {
      displayAlert(
        "There seems to be a problem with your network connection.",
        "error"
      );
    }
  }
};

const registerUser = async ({ firstName, lastName, email, password }) => {
  console.log({ firstName, lastName, email, password });
  try {
    const response = await axios.post(`${APIpath}/user/register`, {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      role_id: roles.user.id,
    });
    const currentUser = response.data;

    console.log(currentUser);

    displayAlert("Sign up Successful!", "success");

    redirectUser(currentUser.data);
  } catch (error) {
    console.error(error);

    if (error.response) {
      displayAlert(error.response?.data.detail, "error");
    } else {
      displayAlert(
        "There seems to be a problem with your network connection.",
        "error"
      );
    }
  }
};

const redirectUser = (userData) => {
  const role = userData.role.name;

  role === "manager" || role === "admin"
    ? (window.location.href = "admin.html")
    : role === "user"
    ? (window.location.href = "user.html")
    : null;
};

loginForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(loginForm);
  loginUser(Object.fromEntries(formData));
});

registerForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  console.log("submitted");

  const formData = new FormData(registerForm);
  registerUser(Object.fromEntries(formData));
});
