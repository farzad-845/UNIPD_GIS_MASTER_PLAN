const notesFormContainer = document.querySelector(".form__container--note");
const notesForm = document.querySelector("#note-form");
const descriptionInput = document.querySelector("#description");
const noteFormCanceleBtns = document.querySelectorAll(".cancel__btn");
const noteSubmitBtn = document.querySelector("#note-submit-btn");
const polygonIdInput = document.querySelector("#polygon-input");

let selectedPolygonID;

const displayNoteForm = () => {
  notesForm.reset();
  notesFormContainer.classList.remove("form__container--hidden");
};

[...noteFormCanceleBtns].map((btn) =>
  btn.addEventListener("click", () =>
    notesFormContainer.classList.add("form__container--hidden")
  )
);

const disbaleSubmitBtn = (btn) => btn.classList.add("btn--disabled");

const enableSubmitBtn = (btn) => btn.classList.remove("btn--disabled");

const changePolygonInput = (id) => (polygonIdInput.value = id);

const submitNote = async (data) => {
  try {
    const response = await axios.post(`${APIpath}/note`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    displayAlert("Your input was successfuly submitted!", "success");
    notesFormContainer.classList.add("form__container--hidden");
    console.log(response.data);
  } catch (error) {
    console.error(error);

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

notesForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(notesForm);

  const noteData = { ...Object.fromEntries(formData) };
  noteData.prg_id = noteData.polygonIdInput;
  console.log(polygonsData);

  console.log(noteData);

  submitNote(noteData);
});

const checkFormValues = () => Boolean(descriptionInput.value);

descriptionInput.addEventListener("input", () =>
  checkFormValues()
    ? enableSubmitBtn(noteSubmitBtn)
    : disbaleSubmitBtn(noteSubmitBtn)
);
descriptionInput.addEventListener("propertychange", () =>
  checkFormValues()
    ? enableSubmitBtn(noteSubmitBtn)
    : disbaleSubmitBtn(noteSubmitBtn)
);

const submitInput = () => {};

// const resetForm = () => {
//   $("#category").val("");
//   $("#message").val("");
//   $("#name").val("");
//   $("#email").val("");
//   $("#mobile").val("");
//   $("#declaration")[0].checked = false;
//   $("#consent")[0].checked = false;
// };

// const fetchInputs = () => {
//   let payload = {};
//   $("#fetchInputs_status").html("Loading Citizens Inputs..");
//   $.ajax({
//     url: `${APIpath}listInputs`,
//     // xhrFields: {
//     //     withCredentials: true
//     // },
//     type: "POST",
//     data: JSON.stringify(payload),
//     cache: false,
//     processData: false, // tell jQuery not to process the data
//     contentType: false, // tell jQuery not to set contentType
//     success: function (return_data) {
//       // console.log(return_data);
//       let data = JSON.parse(return_data);
//       mapInputs(data);
//     },
//     error: function (jqXHR, exception) {
//       // console.log('error:',jqXHR.responseText);
//       let response = JSON.parse(jqXHR.responseText);
//       $(".submitStatus").html(response.message);
//     },
//   });
// };
