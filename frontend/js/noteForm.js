const notesFormContainer = document.querySelector(".form__container");
const notesForm = document.querySelector("#note-form");
const descriptionInput = document.querySelector("#description");
const formCanceleBtns = document.querySelectorAll(".cancel__btn");
const formSubmitBtn = document.querySelector("#note-submit-btn");
const polygonIdInput = document.querySelector("#polygon-input");

displayPolygons(polygonsData);

const displayForm = () =>
  notesFormContainer.classList.remove("form__container--hidden");

[...formCanceleBtns].map((btn) =>
  btn.addEventListener("click", () =>
    notesFormContainer.classList.add("form__container--hidden")
  )
);

const disbaleSubmitBtn = () => formSubmitBtn.classList.add("btn--disabled");

const enableSubmitBtn = () => formSubmitBtn.classList.remove("btn--disabled");

const changePolygonInput = (id) => (polygonIdInput.value = id);

const submitNotesForm = (e) => {
  e.preventDefault();

  const formData = new FormData(notesForm);

  const payload = {
    ...Object.fromEntries(formData),
    polygon_points: polygonsData,
  };

  console.log(payload);

  // $(".submitStatus").html("Saving to DB..");

  // $.ajax({
  //     url : `${APIpath}addInput`,
  //     // xhrFields: {
  //     //     withCredentials: true
  //     // },
  //     type : 'POST',
  //     data : JSON.stringify(payload),
  //     cache: false,
  //     processData: false,    // tell jQuery not to process the data
  //     contentType: false,    // tell jQuery not to set contentType
  //     success : function(returndata) {
  //         console.log(returndata);
  //         let data = JSON.parse(returndata);
  //         $(".submitStatus").html(data.message);
  //
  //         // reset stuff
  //         resetForm();
  //     },
  //     error: function(jqXHR, exception) {
  //         console.log('error:',jqXHR.responseText);
  //         let response = JSON.parse(jqXHR.responseText);
  //         $(".submitStatus").html(response.message);
  //     }
  // });
};

formSubmitBtn.addEventListener("click", (e) => submitNotesForm(e));

const checkFormValues = () => Boolean(descriptionInput.value);

descriptionInput.addEventListener("input", () =>
  checkFormValues() ? enableSubmitBtn() : disbaleSubmitBtn()
);
descriptionInput.addEventListener("propertychange", () =>
  checkFormValues() ? enableSubmitBtn() : disbaleSubmitBtn()
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

const fetchInputs = () => {
  let payload = {};
  $("#fetchInputs_status").html("Loading Citizens Inputs..");
  $.ajax({
    url: `${APIpath}listInputs`,
    // xhrFields: {
    //     withCredentials: true
    // },
    type: "POST",
    data: JSON.stringify(payload),
    cache: false,
    processData: false, // tell jQuery not to process the data
    contentType: false, // tell jQuery not to set contentType
    success: function (return_data) {
      // console.log(return_data);
      let data = JSON.parse(return_data);
      mapInputs(data);
    },
    error: function (jqXHR, exception) {
      // console.log('error:',jqXHR.responseText);
      let response = JSON.parse(jqXHR.responseText);
      $(".submitStatus").html(response.message);
    },
  });
};
