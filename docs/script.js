var timer = document.getElementById("timer");
var logsMain = document.getElementById("logs-main");
var logsTriggers = document.getElementById("logs-triggers");
var purgeLink = document.getElementById("purge-link");

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

purgeLink.addEventListener("click", function (e) {
    e.preventDefault();

    Donleeve.purgeBlocks(Date.now());
    log("<strong>All</strong> blocks have been purged!");
});

Donleeve.onTrigger = function (e) {
    log("<strong>" + getNow() + "</strong> " + e.type, logsTriggers);
};

Donleeve.onStorageBlock = function (str, time) {
    log("Blocked on <strong>" + str + "</strong> URLs for <strong>" + time + "</strong> milliseconds.");
};

Donleeve.init({
    bindDelay: 2000,
    ignoreFlagBlocking: true
}, function (e) {
    Modalite.open("the-modal");
    log("Exit intent activated by <strong>" + e.type + "</strong>!");

    if (!Donleeve.options.ignoreFlagBlocking) {
        log("On this page, an option is set that prevents multiple exit intents to appear on one page load. Refresh the page to see how Storage Blocking works. The block will last " + Math.ceil(Donleeve.options.storageBlockingMinutes * 60) + " seconds.");
    }
});

ActiveTimeout.set(function () {
    log("Events bound!");
}, function (left) {
    if (left < 0) left = 0;
    timer.innerHTML = Math.ceil(left / 1000);
}, Donleeve.options.bindDelay);