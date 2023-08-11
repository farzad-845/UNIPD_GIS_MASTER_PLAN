// api.js - for all citizens inputs related functions

const APIpath = 'https://server2.nikhilvj.co.in/draftmpd41_backend/API/';

// if (window.location.host =="localhost:8000") APIpath = 'http://localhost:5610/API/';
let polygon = null;

// Assume you have an array to store the polygon points called 'polygonPoints'
let polygonPoints = [];

// Function to add a point to the polygonPoints array while maintaining the correct order
function addPointToPolygon(lat, lng) {
    const newPoint = [lat, lng];

    // Find the correct index to insert the new point
    let insertIndex = 0;

    // Insert the new point at the calculated index
    polygonPoints.splice(insertIndex, 0, newPoint);
}


function clearPoints(){
    polygonPoints = [];
    if (polygon != null) {
        map.removeLayer(polygon)
    }
    polygon = null;
}

function addPoint() {
    let currentLocation = map.getCenter();

    addPointToPolygon(currentLocation.lat, currentLocation.lng);

    if (polygon != null) {
        map.removeLayer(polygon)
    }

    polygon = L.polygon(polygonPoints, {color: 'red'});

    polygon.addTo(submittedLayer);
}

function submitInput() {
    // declaration check
    if(! $("#declaration")[0].checked ) {
        alert('Please check On the declaration first.');
        return;
    }

    if (polygonPoints.length < 3) {
        alert('Please draw a polygon first.');
        return;
    }

    let payload = {
        "polygon_points": polygonPoints,
        "category": $('#category').val(),
        "message": $('#message').val(),
        "name": $('#name').val(),
        "email": $('#email').val(),
        "mobile": $('#mobile').val(),
        "consent": $("#consent")[0].checked
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
}

function resetForm() {
    $('#category').val('');
    $('#message').val('');
    $('#name').val('');
    $('#email').val('');
    $('#mobile').val('');
    $("#declaration")[0].checked = false;
    $("#consent")[0].checked = false;
}

function fetchInputs() {
    let payload = {};
    $('#fetchInputs_status').html("Loading Citizens Inputs..");
    $.ajax({
        url : `${APIpath}listInputs`,
        // xhrFields: {
        //     withCredentials: true
        // },
        type : 'POST',
        data : JSON.stringify(payload),
        cache: false,
        processData: false,    // tell jQuery not to process the data
        contentType: false,    // tell jQuery not to set contentType
        success : function(return_data) {
            // console.log(return_data);
            let data = JSON.parse(return_data);
            mapInputs(data);

        },
        error: function(jqXHR, exception) {
            // console.log('error:',jqXHR.responseText);
            let response = JSON.parse(jqXHR.responseText);
            $(".submitStatus").html(response.message);
        }
    });
}

