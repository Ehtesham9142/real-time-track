const socket = io();

const map = L.map("map").setView([20, 0], 2); // Initial world view

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Transport Nagar kokta Multi"
}).addTo(map);

const markers = {};

// 🛰️ Emit your location to server
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => console.error("Geolocation error:", error),
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
} else {
    alert("Geolocation is not supported by your browser.");
}

// 📍 Receive other users' location
socket.on("receive-location", ({ id, latitude, longitude }) => {
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        const marker = L.marker([latitude, longitude]).addTo(map);
        markers[id] = marker;
    }

    // Optional: focus map on latest user (for debugging)
    // map.setView([latitude, longitude], 10);
});

// ❌ Remove marker when a user disconnects
socket.on("user-disconnect", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
