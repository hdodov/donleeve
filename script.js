var timer = document.getElementById("timer");
var logsMain = document.getElementById("logs-main");
var logsTriggers = document.getElementById("logs-triggers");

function getNow() {
    var d = new Date(),
        hrs = d.getHours(),
        min = d.getMinutes(),
        sec = d.getSeconds();

    if (hrs < 10) { hrs = "0" + hrs; }
    if (min < 10) { min = "0" + min; }
    if (sec < 10) { sec = "0" + sec; }

    return hrs + ":" + min + ":" + sec;
}

function log(text, logger) {
    logger = logger || logsMain;
    logger.innerHTML += "<p>" + text + "</p>";
    logger.scrollTop = logger.scrollHeight;
}

Donleeve.init(function (e) {
    Modalite.open("the-modal");
    log("Exit intent activated by " + e.type + "!");
    return true;
});

Donleeve.onTrigger = function (e) {
    log("<strong>" + getNow() + "</strong> triggered " + e.type, logsTriggers);
};

Donleeve.onStorageBlock = function (str, time) {
    log("Exit intent blocked on &quot;" + str + "&quot; URLs for " + time + " ms.");
};

ActiveTimeout.set(function () {
    log("Events bound!");
}, function (left) {
    if (left < 0) left = 0;
    timer.innerHTML = left;
}, Donleeve.options.bindDelay);