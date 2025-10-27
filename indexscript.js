// Initialize the map
var map = L.map('map', { doubleClickZoom: false })
  .setView([37.5485768, -77.6659205], 16);

// Group for clustering house markers
var clusterGroup = L.markerClusterGroup();
map.addLayer(clusterGroup);

// Add OpenStreetMap layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load house data from JSON
function loadHouseData() {
  fetch('houses.json')
    .then(response => {
      if (!response.ok) throw new Error("Failed to load JSON");
      return response.json();
    })
    .then(data => {
      processHouseData(data.houses);
      getUserLocation(data.houses);
    })
    .catch(error => console.error('Error loading JSON:', error));
}

// Place markers from JSON data
function processHouseData(houses) {
  houses.forEach(house => {
    if (house.coordinates !== "user") {
      placeMarker(house.coordinates, house.address, house.candy);
    }
  });
}

// Geolocation for "user" marker
function getUserLocation(houses) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        map.setView([latitude, longitude], 16);

        placeMarker([latitude, longitude], "Your Location", "", true);

      },
      error => {
        console.warn("Geolocation unavailable — using fallback", error);

        // If JSON has user placeholder, add a dummy value near first house
        const fallback = houses.find(h => h.coordinates === "user");
        if (fallback) {
          placeMarker([37.5486, -77.6660], fallback.address, fallback.candy);
        }
      }
    );
  } else {
    console.error("Geolocation not supported.");
  }
}

function placeMarker(coords, address, candy, isUser = false, outOfCandy = false) {

  const isKing = candy.toLowerCase().includes("king");

  const popupHTML = `
    <span class="popup-title">${address}</span>
    <div class="popup-candy">${candy}</div>
    ${isKing ? '<div class="popup-king">KING SIZE!</div>' : ""}
    ${outOfCandy ? '<div class="popup-empty">OUT OF CANDY</div>' : ""}
  `;

  const marker = L.marker(coords).bindPopup(popupHTML);

  // If house is out of candy, reduce marker opacity
  if (outOfCandy) {
    marker.setOpacity(0.45);
  }

  // User location stays independent & visible
  if (isUser) {
    marker.addTo(map);
  } else {
    clusterGroup.addLayer(marker);
  }
}


// Start loading everything 🚀
loadHouseData();
