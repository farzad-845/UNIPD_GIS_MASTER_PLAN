const notesOpenBtn = document.querySelector(".notes__button--open");
const notesCloseBtn = document.querySelector(".notes__button--close");
const notesListContainer = document.querySelector(".list__container");
const notesList = document.querySelector("#notes-list");
const notesCount = document.querySelector(".count__number");

notesOpenBtn.addEventListener("click", () => {
  notesListContainer.classList.remove("list__container--hidden");
});

notesCloseBtn.addEventListener("click", () => {
  notesListContainer.classList.add("list__container--hidden");
});

const citizenInputs = [
  {
    user: "John",
    type: "comment",
    id: "1694095320656",
    content: `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ullam
        dolorem explicabo cum non quia incidunt quae delectus praesentium
        cupiditate dicta!`,
  },
  {
    user: "Sarah",
    type: "comment",
    id: "1694095329368",
    content: `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ullam
        dolorem explicabo cum non quia incidunt quae delectus praesentium
        cupiditate dicta!`,
    attachment: "../assets/images/attachment.jpg",
  },
  {
    user: "Mike",
    type: "report",
    id: "1694095339680",
    content: `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ullam
        dolorem explicabo cum non quia incidunt quae delectus praesentium
        cupiditate dicta!`,
  },
  {
    user: "Marco",
    type: "tip",
    id: "1694095345360",
    content: `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ullam
        dolorem explicabo cum non quia incidunt quae delectus praesentium
        cupiditate dicta!`,
  },
  {
    user: "Maria",
    type: "comment",
    id: "1694095354385",
    content: `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ullam
        dolorem explicabo cum non quia incidunt quae delectus praesentium
        cupiditate dicta!`,
  },
  {
    user: "felani",
    type: "tip",
    id: "1694095373345",
    content: `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ullam
        dolorem explicabo cum non quia incidunt quae delectus praesentium
        cupiditate dicta!`,
  },
  {
    user: "felani",
    type: "report",
    id: "1694095383033",
    content: `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ullam
        dolorem explicabo cum non quia incidunt quae delectus praesentium
        cupiditate dicta!`,
  },
];

const createInputItem = (itemInfo) => {
  const { user, type, id, content, attachment } = itemInfo;

  const newItem = document.createElement("div");

  newItem.classList.add("note__item", `note__item--${type}`);

  newItem.innerHTML = `<header class="item__header">
      <h4 class="item__type"><span>&#11044;</span> ${type}</h4>
      <p class="item__user">By: <span id="input-user">@${user}</span></p>
    </header>
    ${
      attachment
        ? `<img src="${attachment}" alt="user attachment" class="item__img" />`
        : ""
    } 
    <p class="item__text">${content}</p>
    <footer>
      <button class="item__btn item__btn--discard">discard</button>
      <button class="item__btn item__btn--approve">approve</button>
    </footer>`;

  newItem.addEventListener("click", () => {
    const isPolygonVisible = newItem.classList.contains("note__item--visible");

    if (isPolygonVisible) {
      newItem.classList.remove("note__item--visible");
      displayPolygons(polygonsData);
    } else {
      [...document.querySelectorAll(".note__item")].map((item) =>
        item.classList.remove("note__item--visible")
      );
      newItem.classList.add("note__item--visible");
      displaySpecificPolygon(id);
    }
  });

  notesList.append(newItem);
};

citizenInputs.map((item) => createInputItem(item));

notesCount.innerHTML = `${citizenInputs.length}`;
