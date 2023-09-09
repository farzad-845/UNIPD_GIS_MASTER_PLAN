const menuList = document.querySelector(".menu__list");
const menuOpenBtn = document.querySelector("#menu-open-btn");
const menuCloseBtn = document.querySelector("#menu-close-btn");

menuOpenBtn.addEventListener("click", () => {
  menuList.classList.remove("menu__list--closed");
  menuOpenBtn.classList.add("menu__btn--hidden");
});

menuCloseBtn.addEventListener("click", () => {
  menuList.classList.add("menu__list--closed");
  menuOpenBtn.classList.remove("menu__btn--hidden");
});
