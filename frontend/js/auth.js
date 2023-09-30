const accessToken = JSON.parse(localStorage.getItem("access_token"));
const userData = JSON.parse(localStorage.getItem("user_data"));

if (accessToken) {
} else {
  window.location.href = "login.html";
}
