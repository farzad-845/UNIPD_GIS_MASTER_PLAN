const categoryList = [
  "residential",
  "agricultural",
  "public green",
  "commercial",
  "industrial",
];
const statusList = ["in_progress", "planned", "approved"];

const createAdminPolyPopup = (id, activeCategory, activeStatus) => `
    <ul class="dropdown__list polygon__popup">
      <li
        class="dropdown__item dropdown__item--sublist popup__item popup__item--category"
      >
        <button
          class="dropdown__btn popup__btn popup__btn--category"
          onclick=""
        >
          <span>Category </span>
          <i class="ti ti-chevron-right"></i>
        </button>
        <ul class="dropdown__sublist category__list">
        ${categoryList
          .map((cat) => {
            return `
            <li class="category__item ${
              cat === activeCategory ? "category__item--active" : ""
            }">
                <button class="category__btn" onclick="updatePolygon('${id}', ${`{
              zona: '${cat}',
            }`})">
                ${cat === activeCategory ? '<i class="ti ti-pin"></i>' : ""}
                ${cat}
                </button>
            </li>
        `;
          })
          .join("")}
        </ul>
      </li>
      <li
        class="dropdown__item dropdown__item--sublist popup__item popup__item--status"
      >
        <button
          class="dropdown__btn popup__btn popup__btn--status"
          onclick=""
        >
          <span>Status </span>
          <i class="ti ti-chevron-right"></i>
        </button>
        <ul class="dropdown__sublist status__list">
            ${statusList
              .map((status) => {
                return `
                <li class="status__item ${
                  status === activeStatus ? "status__item--active" : ""
                }">
                    <button class="status__btn" onclick="updatePolygon('${id}', ${`{
                        status: '${status}',
                      }`})"> 
                        ${
                          status === activeStatus
                            ? '<i class="ti ti-checks"></i>'
                            : ""
                        }
                        ${status.split("_").join(" ")}
                    </button>
                </li>
            `;
              })
              .join("")}
        </ul>
      </li>
      <li class="dropdown__item popup__item">
        <button class="dropdown__btn popup__btn popup__btn--edit" onclick="getPolyNotes('${id}')">
            <i class="ti ti-notes"></i><span>Show Notes</span>
        </button>
        </li>
      <li class="dropdown__item popup__item">
        <button class="dropdown__btn popup__btn popup__btn--edit" onclick="updatePolygon('${id}')">
          <i class="ti ti-edit"></i><span>Edit</span>
        </button>
      </li>
      <li class="dropdown__item popup__item">
        <button class="dropdown__btn popup__btn popup__btn--delete">
          <i class="ti ti-trash"></i><span>Delete</span>
        </button>
      </li>
    </ul>`;

const createUserPolyPopup = (id) => {
  selectedPolygonID = id;

  return `
    <ul class="dropdown__list polygon__popup">
      <li class="dropdown__item popup__item">
        <button class="dropdown__btn popup__btn" onclick="displayNoteForm()">
            <i class="ti ti-plus"></i><span>Add Note</span>
        </button>
        </li>
        <li class="dropdown__item popup__item">
            <button class="dropdown__btn popup__btn" onclick="getPolyNotes('${id}')">
                <i class="ti ti-notes"></i><span>Show Notes</span>
            </button>
        </li>
    </ul>`;
};
