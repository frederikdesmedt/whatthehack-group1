var mainAudio;

function playAudio(audioUrl) {
    var audio = new Audio(audioUrl);
    return audio.play();
}

Handlebars.registerHelper('list', function (items, options) {
    var out = "";
    Object.entries(items).forEach(element => {
        out += options.fn({
            'name': element[0],
            'description': element[1],
            'audioUrl': element[1]
        });
    });
    return out;
});

(function loadAndPlayAudioData() {
    var pathParts = window.location.pathname.split("/");
    var placeId = pathParts[pathParts.length - 1];
    fetch("/locations/place/" + placeId).then(res => {
        var json = res.json();
        return json;
    }).then(guide => {
        document.getElementById('name').innerText = guide.name;
        console.log(guide);
        var listGenerator = document.getElementById("questions-list-generator").innerText;
        var template = Handlebars.compile(listGenerator);
        mainAudio = guide.audio.main;
        playAudio(mainAudio);
        delete guide.audio['main'];
        var questionsListContent = template({
            questions: guide.audio
        });
        document.getElementById('bootstrap-toggle').innerHTML = questionsListContent;
    });
})()