
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
        response.then(function(res) {
            return res.json();
        }).then(function(json) {
            var placesList = document.getElementById("places-list");
            var placesListContent = template({
                places: json
            });
            placesList.innerHTML = placesListContent;
        });
    });
}

// document.getElementById("play-test-audio").onclick = function() {
//     playAudio("/audio/test_bla_test.mp3");
// }

document.getElementById("nearby-locations").onclick = function() {
    getNearbyLocations();
}

Handlebars.registerHelper('list', function(items, options) {
  var out = "<ul>";

  for(var i=0, l=items.length; i<l; i++) {
    out = out + "<li>" + options.fn(items[i]) + "</li>";
  }

  return out + "</ul>";
});