const addPointBtn = document.querySelector("#add-point-btn");
const clearPointsBtn = document.querySelector("#clear-points-btn");
const submitPointsBtn = document.querySelector("#submit-points-btn");

proj4.defs([
  [
    "EPSG:4326",
    "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees",
  ],
  [
    "EPSG:3004",
    "+proj=tmerc +lat_0=0 +lon_0=15 +k=0.9996 +x_0=2520000 +y_0=0 +ellps=intl +towgs84=-104.1,-49.1,-9.9,0.971,-2.917,0.714,-11.68 +units=m +no_defs ",
  ],
]);

const convertPointsToMultipolygon = (points) =>
  `MULTIPOLYGON(((${points
    .map((point) => `${point[0]} ${point[1]}`)
    .join(", ")}, ${points[0][0]} ${points[0][1]})))`;

// if (window.location.host =="localhost:8000") APIpath = 'http://localhost:5610/API/';
let polygon = null;
let polygonsLayer;

let newPolygon = [];

const addNewPolygon = async (points) => {
  console.log(points);
  const transformedMultipolygon = [points].map((polygon) => {
    return polygon.map((point) => {
      return proj4("EPSG:4326", "EPSG:3004", point);
    });
  });

  const newPolyData = {
    db_id: 0,
    area: 0,
    id_area: 0,
    comparto: "string",
    geom: convertPointsToMultipolygon(transformedMultipolygon[0]),
  };

  try {
    const response = await axios.post(
      "http://64.226.84.10/api/v1/zone",
      newPolyData,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    displayAlert("Area added successfully!", "success");
    getHSRAlignmentData();

    newPolygon = [];
    if (polygonsLayer != null) map.removeLayer(polygonsLayer);

    console.log("Response:", response.data);
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

const updatePolygon = async (id, data) => {
  console.log(id);
  // const transformedMultipolygon = [points].map((polygon) => {
  //   return polygon.map((point) => {
  //     return proj4("EPSG:4326", "EPSG:3004", point);
  //   });
  // });

  // const newPolyData = {
  //   db_id: 0,
  //   area: 0,
  //   id_area: 0,
  //   comparto: "string",
  //   geom: convertPointsToMultipolygon(transformedMultipolygon[0]),
  // };

  // try {
  // const response = await axios.put(
  //   `http://64.226.84.10/api/v1/zone/${id}`,
  //   data,
  //   {
  //     headers: {
  //       Accept: "application/json",
  //       Authorization: `Bearer ${accessToken}`,
  //       "Content-Type": "application/json",
  //     },
  //   }
  // );

  // displayAlert("Area added successfully!", "success");
  // getHSRAlignmentData();

  //   newPolygon = [];
  //   if (polygonsLayer != null) map.removeLayer(polygonsLayer);

  //   console.log("Response:", response.data);
  // } catch (error) {
  //   console.error("Error:", error);

  //   if (error.response) {
  //     displayAlert(error.response?.data.detail, "error");

  //     if (error.response.status === 401 || error.response.status === 403) {
  //       window.location.href = "login.html";
  //     }
  //   } else {
  //     displayAlert(
  //       "There seems to be a problem with your network connection.",
  //       "error"
  //     );
  //   }
  // }
};

let lastPolygon;

const changePolygonStatus = async (id, currentStatus) => {
  const selectedPolygon = polygonsData.find((polygon) => polygon.id === id);

  if (!selectedPolygon) return;

  let newState;

  switch (currentStatus) {
    case "planned":
      newState = "approved";
      break;

    case "in_progress":
      newState = "planned";
      break;

    default:
      break;
  }

  try {
    const response = await axios.put(
      `http://64.226.84.10/api/v1/zone/${id.replace("prg_pg.", "")}`,
      {
        status: newState,
      },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    displayAlert("Area was updated successfully!", "success");
    getHSRAlignmentData();

    console.log("Response:", response.data);
  } catch (error) {
    console.error("Error:", error);

    if (error.response) {
      displayAlert(error.response?.data.detail, "error");

      // if (error.response.status === 401 || error.response.status === 403) {
      //   window.location.href = "login.html";
      // }
    } else {
      displayAlert(
        "There seems to be a problem with your network connection.",
        "error"
      );
    }
  }
};

const displayPolygon = (points) => {
  if (polygonsLayer != null) map.removeLayer(polygonsLayer);

  const polygonData = {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [points],
    },
  };

  polygonsLayer = L.geoJSON(polygonData, {
    style: { color: "#f14a16" },
  }).addTo(group);
};

// Function to add a point to the polygonPoints array while maintaining the correct order

const addPointToPolygon = (lng, lat) => {
  const newPoint = [lng, lat];

  newPolygon.push(newPoint);
};

const clearPoints = () => {
  newPolygon = [];

  if (polygonsLayer != null) map.removeLayer(polygonsLayer);
};

const addPoint = () => {
  let currentLocation = map.getCenter();

  addPointToPolygon(currentLocation.lng, currentLocation.lat);

  displayPolygon(newPolygon);
};

addPointBtn.addEventListener("click", () => addPoint());
clearPointsBtn.addEventListener("click", () => clearPoints());

submitPointsBtn.addEventListener("click", () => {
  if (newPolygon.length < 3) {
    displayAlert("The drawn area must contain at least 3 points.", "error");
    return;
  }

  addNewPolygon(newPolygon);
});

const displaySpecificPolygon = (id) => {
  // const selectedPolygon = polygonsData.find(
  //   (polygon) => Number(polygon.properties.id) === Number(id)
  // );
  // if (polygonsLayer != null) map.removeLayer(polygonsLayer);
  // displayPolygons(selectedPolygon);
};

// displayPolygons(polygonsData);
