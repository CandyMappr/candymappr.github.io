var map = L.map('map', {doubleClickZoom: false}).setView([37.5485, -77.6659], 14);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

var clusterGroup = L.markerClusterGroup();
map.addLayer(clusterGroup);

fetch('houses.json')
  .then(r => r.json())
  .then(data => {
    data.houses.forEach(house => {
      if (house.coordinates === "user") {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(pos => {
            placeMarker([pos.coords.latitude, pos.coords.longitude],
              house.address, house.candy, true, house.outOfCandy);
          });
        }
      } else {
        placeMarker(house.coordinates, house.address, house.candy, false, house.outOfCandy);
      }
    });
  });

function placeMarker(coords, address, candy, isUser = false, outOfCandy = false) {

  const isKing = candy.toLowerCase().includes("king");

  const popupHTML = `
    <span class="popup-title">\${address}</span>
    <div class="popup-candy">\${candy}</div>
    \${isKing ? '<div class="popup-king">KING SIZE!</div>' : ""}
    \${outOfCandy ? '<div class="popup-empty">OUT OF CANDY</div>' : ""}
  `;

  const marker = L.marker(coords).bindPopup(popupHTML);

  if (outOfCandy) marker.setOpacity(0.45);
  if (isUser) marker.addTo(map);
  else clusterGroup.addLayer(marker);
}
