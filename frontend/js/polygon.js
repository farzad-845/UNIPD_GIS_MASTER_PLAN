const addPointBtn = document.querySelector("#add-point-btn");
const clearPointsBtn = document.querySelector("#clear-points-btn");
const submitPointsBtn = document.querySelector("#submit-points-btn");

const isAdmin = window.location.pathname.slice(1) === "admin.html";

// if (window.location.host =="localhost:8000") APIpath = 'http://localhost:5610/API/';
let polygon = null;
let polygonsLayer;

const polygonsData = [
  {
    type: "Feature",
    properties: {
      id: "1694095320656",
      status: "in progress",
    },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [12.969017028808596, 43.839448691918044],
          [12.95914649963379, 43.839448691918044],
          [12.955026626586914, 43.849167497099714],
          [12.969274520874025, 43.849167497099714],
          [12.983436584472658, 43.83994395594441],
        ],
      ],
    },
  },
  {
    type: "Feature",
    properties: {
      id: "1694095329368",
      status: "in progress",
    },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [12.99339294433594, 43.83765332536004],
          [13.002490997314453, 43.840810658098256],
          [13.013734817504885, 43.832947970495034],
          [13.006010055541994, 43.82892335947694],
          [12.994508743286133, 43.828613762772925],
          [12.977170944213869, 43.83201923819433],
        ],
      ],
    },
  },
  {
    type: "Feature",
    properties: {
      id: "1694095339680",
      status: "in progress",
    },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [12.967729568481447, 43.832947970495034],
          [12.951765060424806, 43.837777145477716],
          [12.95167922973633, 43.83115240834065],
          [12.960262298583984, 43.8300998123067],
        ],
      ],
    },
  },
  {
    type: "Feature",
    properties: {
      id: "1694095345360",
      status: "in progress",
    },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [12.967214584350588, 43.82966638501464],
          [12.974596023559572, 43.828489923641655],
          [12.977943420410158, 43.82174030240223],
          [12.969617843627931, 43.82198800841399],
          [12.963008880615234, 43.82235956550457],
        ],
      ],
    },
  },
  {
    type: "Feature",
    properties: {
      id: "1694095354385",
      status: "in progress",
    },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [12.97914505004883, 43.82706575516482],
          [12.983779907226564, 43.820068259941074],
          [12.989530563354492, 43.821492595362756],
          [12.990303039550783, 43.82657038425128],
          [12.983865737915039, 43.82830416446303],
        ],
      ],
    },
  },
  {
    type: "Feature",
    properties: {
      id: "1694095365569",
      status: "in progress",
    },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [12.967557907104494, 43.83734377394175],
          [12.972106933593752, 43.83214307000281],
          [12.982749938964846, 43.83697231012002],
        ],
      ],
    },
  },
  {
    type: "Feature",
    properties: {
      id: "1694095373345",
      status: "in progress",
    },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [12.989959716796877, 43.83814860428908],
          [12.997941970825197, 43.84093447166389],
          [12.988500595092775, 43.848239017245504],
          [12.979574203491213, 43.845020175184494],
        ],
      ],
    },
  },
  {
    type: "Feature",
    properties: {
      id: "1694095383033",
      status: "in progress",
    },
    geometry: {
      type: "Polygon",
      coordinates: [[]],
    },
  },
];

const addNewPolygon = (status, points) => {
  polygonsData.push({
    type: "Feature",
    properties: {
      id: `${new Date().getTime()}`,
      status: status,
    },
    geometry: {
      type: "Polygon",
      coordinates: points,
    },
  });
};

const getLastPolygon = () => {
  if (!polygonsData.length) {
    addNewPolygon("in progress", [[]]);
  }
  return polygonsData[polygonsData.length - 1];
};

let lastPolygon;

const changePolygonStatus = (id) => {
  const selectedPolygon = polygonsData.find(
    (polygon) => Number(polygon.properties.id) === Number(id)
  );

  if (
    !selectedPolygon ||
    selectedPolygon.properties.id ===
      polygonsData[polygonsData.length - 1].properties.id
  )
    return;

  switch (selectedPolygon.properties.status) {
    case "approved":
      selectedPolygon.properties.status = "in progress";
      break;

    case "planned":
      selectedPolygon.properties.status = "approved";
      break;

    case "in progress":
      selectedPolygon.properties.status = "planned";
      break;

    default:
      break;
  }

  displayPolygons(polygonsData);
};

const displayPolygons = (points) => {
  if (polygonsLayer != null) map.removeLayer(polygonsLayer);

  polygonsLayer = L.geoJSON(points, {
    onEachFeature: (feature, layer) =>
      !isAdmin &&
      layer.on("click", () => {
        displayForm();
        changePolygonInput(layer.feature.properties.id);
      }),
    style: function (feature) {
      switch (feature.properties.status) {
        case "in progress":
          return { color: "#f14a16" };
        case "planned":
          return { color: "#1f4690" };
        case "approved":
          return { color: "#3e8e7e" };
      }
    },
  }).addTo(map);

  isAdmin &&
    polygonsLayer.bindPopup(
      (layer) => {
        return `<p class="popup__content">
          Status:
          <button 
            class="popup__btn" 
            onclick="changePolygonStatus(${layer.feature.properties.id})"
          >${layer.feature.properties.status}
            <i class="ti ti-chevron-right"></i>
          </button>
          <span class="popup__span">Click on the status to change it.</span>
        </p>`;
      },
      { className: "polygon__popup" }
    );
};

// Function to add a point to the polygonPoints array while maintaining the correct order
const addPointToPolygon = (lng, lat) => {
  lastPolygon = getLastPolygon().geometry.coordinates[0];

  const newPoint = [lng, lat];

  lastPolygon.push(newPoint);
};

const clearPoints = () => {
  getLastPolygon().geometry.coordinates[0] = [];

  if (polygonsLayer != null) map.removeLayer(polygonsLayer);

  displayPolygons(polygonsData);
};

const addPoint = () => {
  let currentLocation = map.getCenter();

  addPointToPolygon(currentLocation.lng, currentLocation.lat);

  console.log(polygonsData);

  if (polygonsLayer != null) map.removeLayer(polygonsLayer);

  displayPolygons(polygonsData);
};

addPointBtn.addEventListener("click", () => addPoint());
clearPointsBtn.addEventListener("click", () => clearPoints());

submitPointsBtn.addEventListener("click", () => {
  lastPolygon = getLastPolygon().geometry.coordinates[0];

  if (lastPolygon.length < 3) {
    displayAlert("The drawn area must contain at least 3 points.");
    return;
  }

  addNewPolygon("in progress", [[]]);

  console.log(polygonsData);
  displayAlert("Area added successfully!");
});

const displaySpecificPolygon = (id) => {
  const selectedPolygon = polygonsData.find(
    (polygon) => Number(polygon.properties.id) === Number(id)
  );

  if (polygonsLayer != null) map.removeLayer(polygonsLayer);

  displayPolygons(selectedPolygon);
};

displayPolygons(polygonsData);
