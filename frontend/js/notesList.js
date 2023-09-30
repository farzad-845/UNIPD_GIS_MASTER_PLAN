const notesOpenBtn = document.querySelector(".notes__button--open");
const notesListContainer = document.querySelector(".list__container--notes");
const notesCloseBtn = notesListContainer.querySelector(".side__button--close");
const notesList = notesListContainer.querySelector("#notes-list");
const notesCount = notesListContainer.querySelector(".count__number");

notesOpenBtn.addEventListener("click", () => {
  [...document.querySelectorAll(".list__container")].map(
    (item) =>
      item !== notesListContainer &&
      item.classList.add("list__container--hidden")
  );
  notesListContainer.classList.toggle("list__container--hidden");
  getUserInputs();
});

notesCloseBtn.addEventListener("click", () => {
  notesListContainer.classList.add("list__container--hidden");
});

// const citizenInputs = [
//   {
//     user: "John",
//     type: "comment",
//     id: "1694095320656",
//     content: `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ullam
//         dolorem explicabo cum non quia incidunt quae delectus praesentium
//         cupiditate dicta!`,
//   },
//   {
//     user: "Sarah",
//     type: "comment",
//     id: "1694095329368",
//     content: `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ullam
//         dolorem explicabo cum non quia incidunt quae delectus praesentium
//         cupiditate dicta!`,
//     attachment: "../assets/images/attachment.jpg",
//   },
//   {
//     user: "Mike",
//     type: "report",
//     id: "1694095339680",
//     content: `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ullam
//         dolorem explicabo cum non quia incidunt quae delectus praesentium
//         cupiditate dicta!`,
//   },
//   {
//     user: "Marco",
//     type: "tip",
//     id: "1694095345360",
//     content: `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ullam
//         dolorem explicabo cum non quia incidunt quae delectus praesentium
//         cupiditate dicta!`,
//   },
//   {
//     user: "Maria",
//     type: "comment",
//     id: "1694095354385",
//     content: `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ullam
//         dolorem explicabo cum non quia incidunt quae delectus praesentium
//         cupiditate dicta!`,
//   },
//   {
//     user: "felani",
//     type: "tip",
//     id: "1694095373345",
//     content: `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ullam
//         dolorem explicabo cum non quia incidunt quae delectus praesentium
//         cupiditate dicta!`,
//   },
//   {
//     user: "felani",
//     type: "report",
//     id: "1694095383033",
//     content: `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ullam
//         dolorem explicabo cum non quia incidunt quae delectus praesentium
//         cupiditate dicta!`,
//   },
// ];

const getUserInputs = async () => {
  console.log("Hi");
  try {
    const response = await axios.get(`${APIpath}/note/?page=1&size=50`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log(response);

    const notes = response.data;

    displayInputs(notes);
    notesCount.innerHTML = `${notes.length}`;
  } catch (error) {
    console.error(error);
    console.log(error.response.status);

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
};

const createInputItem = (itemInfo) => {
  const { user_id, type, id, description, path } = itemInfo;
  const noteType = type || "comment";

  const user = users.find((u) => u.id === user_id);
  console.log(user);

  const newItem = document.createElement("div");

  newItem.classList.add("note__item", `note__item--${noteType}`);

  newItem.innerHTML = `<header class="item__header">
      <h4 class="item__type"><span>&#11044;</span> ${noteType}</h4>
      <p class="item__user">By: <span id="input-user">@${
        user?.first_name || ""
      } ${user?.last_name || ""}</span></p>
    </header>
    ${
      path
        ? `<img src="${path}" alt="user attachment" class="item__img" />`
        : ""
    } 
    <p class="item__text">${description || ""}</p>
    <footer>
      <button class="item__btn item__btn--discard">discard</button>
      <button class="item__btn item__btn--approve">approve</button>
    </footer>`;

  newItem.addEventListener("click", () => {
    const isPolygonVisible = newItem.classList.contains("note__item--visible");

    if (isPolygonVisible) {
      newItem.classList.remove("note__item--visible");
      // displayPolygons(polygonsData);
    } else {
      [...document.querySelectorAll(".note__item")].map((item) =>
        item.classList.remove("note__item--visible")
      );
      newItem.classList.add("note__item--visible");
      displaySpecificPolygon(id);
    }
  });

  const itemImg = newItem.querySelector(".item__img");

  itemImg?.addEventListener("error", () => {
    itemImg.classList.add("item__img--hidden");
  });

  notesList.append(newItem);
};

const displayInputs = (citizenInputs) =>
  citizenInputs.map((item) => createInputItem(item));
