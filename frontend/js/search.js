const searchOpenBtn = document.querySelector("#search-btn");
const searchListContainer = document.querySelector(".list__container--search");
const searchCloseBtn = searchListContainer.querySelector(
  ".side__button--close"
);
const searchListList = searchListContainer.querySelector("#notes-list");

searchOpenBtn.addEventListener("click", () => {
  [...document.querySelectorAll(".list__container")].map(
    (item) =>
      item !== searchListContainer &&
      item.classList.add("list__container--hidden")
  );
  searchListContainer.classList.toggle("list__container--hidden");
});

searchCloseBtn.addEventListener("click", () => {
  searchListContainer.classList.add("list__container--hidden");
});
