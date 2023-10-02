const printBtn = document.querySelector("#print-btn");

const easyPrint = new L.easyPrint({
  title: "Print Map",
  position: "bottomleft",
  elementsToHide: "sidebar-map",
  link: printBtn,
  download: true,
}).addTo(map);

document.addEventListener("DOMContentLoaded", function () {
  printBtn.addEventListener("click", () => {
    document.querySelector(".CurrentSize")?.click();
  });
});
