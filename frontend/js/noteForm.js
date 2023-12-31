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
  polygonIdInput.value = selectedPolygonID;
};

[...noteFormCanceleBtns].map((btn) =>
  btn.addEventListener("click", () => {
    selectedPolygonID = null;
    notesFormContainer.classList.add("form__container--hidden");
  })
);

const disbaleSubmitBtn = (btn) => btn.classList.add("btn--disabled");

const enableSubmitBtn = (btn) => btn.classList.remove("btn--disabled");

const submitNote = async (data) => {
  try {
    let body = {
        ...data,
    }
    if (newPolygon) {
      body.geom = convertPointsToMultipolygon(newPolygon);
    } else {
      body.prg_id = data.polygon ? data.polygon?.replace("prg_pg.", "") : null
    }

    const response = await axios.post(
        `${APIpath}/note`,
        body,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
    );

    displayAlert("Your input was successfuly submitted!", "success");
    notesFormContainer.classList.add("form__container--hidden");
    console.log(response.data);

    if (uploadedImg) {
      try {
        const response2 = await axios.post(
            `${APIpath}/note/${response.data.data.id}/image`,
            {image_file: uploadedImg},
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${accessToken}`,
              },
            }
        );

        uploadedImg = null;
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
    }
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
