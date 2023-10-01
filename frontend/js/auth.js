const accessToken = JSON.parse(localStorage.getItem("access_token"));
const userData = JSON.parse(localStorage.getItem("user_data"));

if (accessToken) {
  console.log("User is logged in");
} else if ("login.html" in window.location.href) {
  window.location.href = "login.html";
} else {
  console.log("User is not logged in");
}
