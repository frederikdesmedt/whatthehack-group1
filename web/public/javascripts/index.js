var previousPlaceIds = [];

function playAudio(audioUrl) {
    var audio = new Audio(audioUrl);
    return audio.play();
}

function getNearbyLocations() {
    var listGenerator = document.getElementById("places-list-generator").innerText;
    var template = Handlebars.compile(listGenerator);
    navigator.geolocation.getCurrentPosition(location => {
        var lat = location.coords.latitude;
        var long = location.coords.longitude;
        var response = fetch("/locations/nearby?lat=" + lat + "&long=" + long);
        response.then(res => {
            return res.json();
        }).then(newPlaces => {
            newPlaceIds = newPlaces.map(place => place.id);
            if (newPlaceIds.some(newPlaceId => !previousPlaceIds.includes(newPlaceId))) {
                showNewPlacesNotification();
            }
            previousPlaceIds = newPlaceIds;
            var placesList = document.getElementById("places-list");
            var placesListContent = template({
                places: newPlaces
            });
            placesList.innerHTML = placesListContent;
        });
    });
}

function showNewPlacesNotification() {
    if (Notification.permission === "granted") {
        var notification = new Notification("There are new places nearby!");
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                var notification = new Notification("There are new places nearby!");
            }
        });
    }
}

getNearbyLocations();
setInterval(() => {
    getNearbyLocations();
}, 5000);

// document.getElementById("nearby-locations").onclick = function () {
//     getNearbyLocations();
// }

Handlebars.registerHelper('list', function (items, options) {
    var out = "";
    for (var i = 0, l = items.length; i < l; i++) {
        out += options.fn(items[i]);
    }
    return out;
});