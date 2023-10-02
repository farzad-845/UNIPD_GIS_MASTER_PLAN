const searchOpenBtn = document.querySelector("#search-btn");
const searchListContainer = document.querySelector(".list__container--search");
const searchCloseBtn = searchListContainer.querySelector(
  ".side__button--close"
);
const searchListList = searchListContainer.querySelector("#notes-list");
const searchInput = searchListContainer.querySelector(".search__input");

searchOpenBtn.addEventListener("click", () => {
  [...document.querySelectorAll(".list__container")].map(
    (item) =>
      item !== searchListContainer &&
      item.classList.add("list__container--hidden")
  );
  searchListContainer.classList.toggle("list__container--hidden");
  searchInput.value = "";
  findByNumero("");
});

searchCloseBtn.addEventListener("click", () => {
  searchListContainer.classList.add("list__container--hidden");
});

const findByNumero = (numero) => {
  const foundArea = particelleData.find(
    (area) => area.properties.numero === numero
  );

  if (polygonsLayer != null) map.removeLayer(polygonsLayer);

  polygonsLayer = L.geoJSON(foundArea, {
    style: { color: "#f14a16" },
  }).addTo(group);

  if (foundArea) {
    const polygonBounds = polygonsLayer.getBounds();

    // Fit the map's view to the polygon's bounds
    map.fitBounds(polygonBounds);
  } else {
    map.setView({ lat: 43.8441, lng: 13.0194 }, 16);
  }

  //   foundArea && displayPolygon(foundArea.geometry.coordinates[0]);
};

searchInput.addEventListener("input", (e) => findByNumero(e.target.value));

searchInput.addEventListener("propertychange", (e) =>
  findByNumero(e.target.value)
);
