const notesOpenBtn = document.querySelector(".notes__button--open");
const notesListContainer = document.querySelector(".list__container--notes");
const notesCloseBtn = notesListContainer.querySelector(".side__button--close");
const notesList = notesListContainer.querySelector("#notes-list");
const notesCount = notesListContainer.querySelector(".count__number");

const sideTabs = notesListContainer.querySelectorAll(".side__tab");

const convertDateToString = (date) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  return new Date(date).toLocaleDateString("en-US", options);
};

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

const getUserInputs = async (isPRG = false) => {
  try {
    const response = await axios.get(
      `${APIpath}/note/${isPRG ? "prg" : ""}?page=1&size=50`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log(response);

    const notes = isPRG ? response.data.data.items : response.data;

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
  const {
    user_id,
    type,
    id,
    prg_id,
    description,
    path,
    image,
    created_at,
    is_public,
  } = itemInfo;
  const noteType = type || "comment";

  const user = users?.find((u) => u.id === user_id) || {
    first_name: "User",
    last_name: "",
  };

  const newItem = document.createElement("div");
  newItem.tabIndex = "0";

  newItem.classList.add("note__item", `note__item--${noteType}`);

  newItem.innerHTML = `<header class="item__header">
      <h4 class="item__type"><span>&#11044;</span> ${noteType}</h4>
      <p class="item__user">By: <span id="input-user">${
        user?.first_name || ""
      } ${user?.last_name || ""}</span></p>
      ${
        created_at
          ? `<p class="item__date">${convertDateToString(created_at)}</p>`
          : ""
      }
    </header>
    ${
      path || image?.link
        ? `<img src="${
            path || image.link
          }" alt="user attachment" class="item__img" />`
        : ""
    } 
    <p class="item__text">${description || ""}</p>
    ${
      userData?.role.name !== "user"
        ? !is_public
          ? // <button class="item__btn item__btn--discard">discard</button>
            `<footer>
        <button class="item__btn item__btn--approve">approve</button>
      </footer>`
          : '<p class="item__status"><i class="ti ti-checks"></i> Approved</p>'
        : ""
    }`;

  newItem.addEventListener("click", () => {
    const noteItems = [...notesListContainer.querySelectorAll(".note__item")];
    const isPolygonVisible = newItem.classList.contains("note__item--visible");

    noteItems.map((i) => {
      i.classList.remove("note__item--invisible");
      i.classList.remove("note__item--visible");
    });

    if (isPolygonVisible) {
      isHSRBtnToggled && displayPolygons(polygonsData, true);
    } else {
      noteItems.map((item) => {
        item !== newItem && item.classList.add("note__item--invisible");
      });
      newItem.classList.add("note__item--visible");
      displaySpecificPolygon(prg_id);
    }
  });

  const itemImg = newItem.querySelector(".item__img");

  itemImg?.addEventListener("error", () => {
    itemImg.classList.add("item__img--hidden");
  });

  const approveBtn = newItem.querySelector(".item__btn--approve");

  approveBtn?.addEventListener("click", () => approveNote(id));

  notesList.append(newItem);
};

const approveNote = async (id) => {
  try {
    const response = await axios.put(
      `http://64.226.84.10/api/v1/note/${id}`,
      { is_public: true },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    displayAlert("Note was approved!", "success");
  } catch (error) {
    console.error("Error:", error);

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

const displayInputs = (citizenInputs) => {
  notesList.innerHTML = "";
  citizenInputs.map((item) => createInputItem(item));
};

[...sideTabs].map((tab) =>
  tab.addEventListener("click", () => {
    [...sideTabs].map((t) => t.classList.remove("side__tab--active"));
    tab.classList.add("side__tab--active");
  })
);
