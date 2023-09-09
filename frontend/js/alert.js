const alertContainer = document.querySelector(".alert__container");
const alert = document.querySelector(".alert");

let timeout;

const displayAlert = (msg, type = "warning") => {
  timeout = null;

  alertContainer.classList.remove("alert__container--hidden");
  alert.querySelector(".alert__text").innerText = msg;

  timeout = setTimeout(() => {
    alertContainer.classList.add("alert__container--hidden");
  }, 5000);
};
