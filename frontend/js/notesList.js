const notesOpenBtn = document.querySelector(".notes__button--open");
const notesListContainer = document.querySelector(".list__container--notes");
const notesCloseBtn = notesListContainer.querySelector(".side__button--close");
const notesList = notesListContainer.querySelector("#notes-list");
const notesCount = notesListContainer.querySelector(".count__number");
const yearDropdownContainer =
  notesListContainer.querySelector(".year__drpodown");
const yearDropdown = notesListContainer.querySelector(".form__dropdown");

const sideTabs = notesListContainer.querySelectorAll(".side__tab");

let isSelectedZoneToggled = false;
let selectedPolygonForNotes = null;
let selectedFilterYear = null;

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

  if (notesListContainer.classList.contains("list__container--hidden")) {
    getUserInputs();
    notesListContainer.classList.remove("list__container--hidden");
    [...sideTabs].map((t) => t.classList.remove("side__tab--active"));
    sideTabs[0].classList.add("side__tab--active");
    isSelectedZoneToggled = false;
  } else {
    notesListContainer.classList.add("list__container--hidden");
  }
});

notesCloseBtn.addEventListener("click", () => {
  notesListContainer.classList.add("list__container--hidden");
});

let notes = [];

const getUserInputs = async (isPRG = false) => {
  try {
    const response = await axios.get(
      `${APIpath}/note/${isPRG ? "prg" : ""}?page=1&size=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log(response);

    notes = isPRG ? response.data.data.items : response.data;

    if (selectedFilterYear) {
      filterByDate(selectedFilterYear);
    } else {
      displayInputs(notes);
    }
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
      if (itemInfo.geom) {
        displayPolygon(convertMultipolygonToCoordinates(itemInfo.wkt));
      } else {
        displaySpecificPolygon(prg_id);
      }
    }
  });

  const itemImg = newItem.querySelector(".item__img");

  itemImg?.addEventListener("error", () => {
    itemImg.classList.add("item__img--hidden");
  });

  const approveBtn = newItem.querySelector(".item__btn--approve");

  let note_id = id || itemInfo.note_id;
  approveBtn?.addEventListener("click", () => approveNote(note_id));

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
  console.log("ccc", citizenInputs);
  notesList.innerHTML = "";
  citizenInputs.map((item) => createInputItem(item));

  notesCount.innerHTML = citizenInputs.length;
};

[...sideTabs].map((tab, index) =>
  tab.addEventListener("click", () => {
    [...sideTabs].map((t) => t.classList.remove("side__tab--active"));
    tab.classList.add("side__tab--active");

    isSelectedZoneToggled = index === 2;
    selectedPolygonForNotes = index !== 2 && null;
  })
);

const getPolyNotes = async (id) => {
  selectedPolygonForNotes = id.replace("prg_pg.", "");
  notesListContainer.classList.remove("list__container--hidden");
  changeNotesTab("polygon");
};

const changeNotesTab = async (tab) => {
  switch (tab) {
    case "polygon":
      [...sideTabs].map((t) => t.classList.remove("side__tab--active"));
      sideTabs[2].classList.add("side__tab--active");

      if (selectedPolygonForNotes) {
        try {
          const response = await axios.get(
            `http://64.226.84.10/api/v1/note/zone/${selectedPolygonForNotes}`,
            {
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          notes = [...response.data.data.items];

          if (notes.length) {
            if (selectedFilterYear) {
              const filteredNotes = notes.filter(
                (note) =>
                  selectedFilterYear == new Date(note.created_at).getFullYear()
              );

              filteredNotes.length
                ? displayInputs(filteredNotes)
                : (notesList.innerHTML = `<span class="list--empty">
                There have been no submissions for the year  ${selectedFilterYear}.
                </span>`);
            } else {
              displayInputs(notes);
            }

            displaySpecificPolygon(notes[0]?.prg_id);

            const currentNotes = notesList.innerHTML;

            notesList.innerHTML =
              `<header class="list__header"><p>Submitted notes for <span>Zone "${selectedPolygonForNotes}"</span></p>
              <button id="polygon-notes-cancel" class="notes__btn--cancel">
                <i class="ti ti-x"></i>
                <span>Cancel</span>
              </button>
              </header>` + currentNotes;
          } else {
            notesList.innerHTML = `<span class="list--empty">
              No notes have been submitted for this zone yet.<br />Feel free to add your own!
            </span>`;
          }

          notesListContainer
            .querySelector("#polygon-notes-cancel")
            ?.addEventListener("click", () => {
              selectedPolygonForNotes = null;
              changeNotesTab("polygon");
              displayPolygons(polygonsData, true);
            });
        } catch (error) {
          console.error("Error:", error);

          if (error.response) {
            displayAlert(error.response?.data.detail, "error");

            if (
              error.response.status === 401 ||
              error.response.status === 403
            ) {
              window.location.href = "login.html";
            }
          } else {
            displayAlert(
              "There seems to be a problem with your network connection.",
              "error"
            );
          }
        }
      } else {
        notes = [];
        displayInputs(notes);
        notesList.innerHTML = `<span class="list--empty"
        >Nothing to display at the moment.<br />Please choose a Zone to view its notes.</span
      >`;
      }

      break;

    default:
      break;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const startYear = 1950;
  const endYear = new Date().getFullYear();

  const yearsArray = Array.from(
    { length: endYear - startYear + 1 },
    (_, index) => startYear + index
  ).reverse();

  yearsArray.map((year) => {
    const yearOption = document.createElement("option");
    yearOption.value = year;
    yearOption.innerHTML = year;

    yearDropdown.appendChild(yearOption);
  });
});

yearDropdown.addEventListener("change", () => {
  filterByDate(yearDropdown.value);
});

const filterByDate = (year) => {
  selectedFilterYear = year;

  let filteredNotes;

  if (isSelectedZoneToggled && !selectedPolygonForNotes) return;

  if (year) {
    if (selectedPolygonForNotes) {
      changeNotesTab("polygon");
      return;
    }
    filteredNotes = notes.filter(
      (note) => year == new Date(note.created_at).getFullYear()
    );

    if (filteredNotes.length) {
      displayInputs(filteredNotes);
    } else {
      notesList.innerHTML = `<span class="list--empty">
      There have been no submissions for the year  ${year}.
      </span>`;
    }

    notesCount.innerHTML = filteredNotes.length;
  }
};
