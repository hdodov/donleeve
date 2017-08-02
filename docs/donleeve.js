window.Donleeve = (function () {
    var _blockWildcard = "*",
        _lsEnabled = (typeof localStorage !== "undefined"),
        _lsKeyBlocks = "donleevBlocks",
        _lsKeyPurge = "donleevPurge";

    var _conf = {
        bindDelay: 3000,
        bindEventBlur: true,
        bindEventMouseLeave: true,
        bindEventMouseMove: true,
        storageBlockingRegex: _blockWildcard,
        storageBlockingMinutes: 10,
        ignoreStorageBlocking: false,
        ignoreFlagBlocking: false
    };

    var exports = {
        options: _conf,
        enabled: true,
        acted: false,

        onBound: null,
        onTrigger: null,
        onStorageBlock: null,
        onAction: null
    };

    /**
     * Converts the storage block time value in the configuration to
     * milliseconds. By default, it's specified as a decimal number representing
     * minutes.
     * @param  {number} time Time to convert.
     * @return {number}      Converted time.
     */
    function configTimeToMS(time) {
        return time * 60 * 1000;
    }

    /**
     * Gets for how longer a block time stamp will be active.
     * @param  {number} timeStamp Time stamp to compare.
     * @return {number}           Remaining time in milliseconds.
     */
    function getBlockTimeLeft(timeStamp) {
        if (typeof timeStamp === "number") {
            return timeStamp - Date.now();
        }

        return 0;
    }

    /**
     * Extracts the time stamp blocks from localStorage or returns an empty
     * array if it failed.
     * @return {object} Blocks array.
     */
    function getStorageBlocks() {
        var blocks;

        try {
            blocks = JSON.parse(localStorage[_lsKeyBlocks]);
        } catch (e) {
            console.warn("Couldn't parse blocks JSON.");
        }

        if (!Array.isArray(blocks)) {
            blocks = [];
            saveStorageBlocks(blocks);
            console.warn("Blocks were not an array.");
        }

        return blocks;
    }

    /**
     * Saves an array of blocks in the storage after removing outdated ones.
     * @param  {object} arr Array to save.
     */
    function saveStorageBlocks(arr) {
        var block, stamp;

        for (var i = arr.length - 1; i >= 0; i--) {
            block = arr[i];
            stamp = block[1];

            if (getBlockTimeLeft(stamp) <= 0) {
                arr.splice(i, 1);
            }
        }

        localStorage[_lsKeyBlocks] = JSON.stringify(arr);
    }

    /**
     * Adds a new block in the storage, using the block string and time from the
     * configuration object.
     */
    function addStorageBlock() {
        if (!_lsEnabled) return;

        var blocks = getStorageBlocks(),
            blockMS = configTimeToMS(_conf.storageBlockingMinutes);

        blocks.push([
            _conf.storageBlockingRegex,
            Date.now() + blockMS
        ]);

        saveStorageBlocks(blocks);
    }

    /**
     * Checks if any of the storage blocks are blocking the current action.
     * @return {boolean} Whether a block was found or not.
     */
    function isStorageBlocking() {
        if (!_lsEnabled) return false;

        var isBlocking = false;

        getStorageBlocks().forEach(function (block) {
            var regex = block[0],
                stamp = block[1];

            if (regex === _blockWildcard || (new RegExp(regex)).exec(window.location.href) !== null) {
                var blockTimeLeft = getBlockTimeLeft(stamp);

                if (blockTimeLeft > 0) {
                    isBlocking = true;

                    if (typeof exports.onStorageBlock === "function") {
                        exports.onStorageBlock(regex, blockTimeLeft);
                    }
                }
            }
        });
    
        return isBlocking;
    }

    /**
     * Checks if the exit intent action can be activated.
     * @return {boolean}
     */
    function isActionable() {
        if (!exports.enabled) {
            return false;
        }

        if (!_conf.ignoreFlagBlocking && exports.acted) {
            return false;
        }

        if (!_conf.ignoreStorageBlocking && isStorageBlocking()) {
            return false;
        }

        return true;
    }

    /**
     * Invokes the action callback and adds blocks if it returned `true`.
     * @param  {object} event DOM event that triggered the action.
     */
    function action(event) {
        if (
            typeof exports.onAction === "function" &&
            exports.onAction(event) !== false
        ) {
            exports.acted = true;
            addStorageBlock();
        }
    }

    /**
     * Called when a condition for activating the exit intent is met.
     * @param  {object} event DOM event that occurred.
     */
    function trigger(event) {
        if (typeof exports.onTrigger === "function") {
            exports.onTrigger(event);
        }

        if (isActionable() === true) {
            action(event);
        }
    }

    /**
     * Attaches event listeners that will check for the exit intent. Called
     * after the initial `bindDelay` to prevent any false positives in the
     * crucial first seconds of a user's visit.
     */
    function bindTriggers() {
        if (_conf.bindEventBlur) {
            window.addEventListener("blur", trigger);
        }

        if (_conf.bindEventMouseLeave) {
            document.documentElement.addEventListener("mouseleave", function (e) {
                // Sometimes in Chrome, mouseleave is dispatched when the
                // mouse *enters* the document. Luckily, the `y` of the event
                // is greater than 0 in these situations and we can filter
                // them out. Very rarely, a false positive occurs *at* 0 and
                // we can't filter that.
                if (e.y <= 0 || e.clientY <= 0) {
                    trigger(e);
                }
            });
        }

        if (_conf.bindEventMouseMove) {
            document.documentElement.addEventListener("mousemove", function (e) {
                // movementY holds the acceleration of the mouse. If it's
                // lower than 0, the mouse is moving upwards - towards the
                // address bar. Additionally, a check is performed whether the
                // mouse's Y is out of the document. If the user is moving
                // their mouse too fast, the event where its Y is 0 might not
                // be captured, so we give it some tolerance.
                if (e.movementY < 0 && (e.y <= 0 || e.movementY < -e.y)) {
                    trigger(e);
                }
            });
        }

        if (typeof exports.onBound === "function") {
            exports.onBound();
        }
    }

    /**
     * Loops through all the keys of an object and saves them in `_conf`.
     * @param {object} options
     */
    exports.setOptions = function (options) {
        if (typeof options === "object" && options !== null) {
            for (var k in options) {
                _conf[k] = options[k];
            }
        }
    };

    /**
     * Optionally configures the library, gives it an action callback and binds
     * the exit intent triggers after the initial bind delay.
     * @param  {object}   config   Optional configuration object used to modify
     *                             `_conf`.
     * @param  {function} callback Function to call when the exit intent must be
     *                             activated.
     */
    exports.init = function (config, callback) {
        if (typeof config === "function") {
            callback = config;
            config = undefined;
        }

        exports.setOptions(config);
        exports.onAction = callback;

        ActiveTimeout.set(function () {
            bindTriggers();
        }, _conf.bindDelay);
    };

    /**
     * This function gives you the ability to remove old storage blocks. For
     * example, if you set a block for 2 weeks and later decide to reduce it to
     * 5 minutes, any visitor who came while the block was 2 weeks will have to
     * wait for it to pass.
     *
     * With this function, you can pass a string that is saved in the storage.
     * If its new value differs from the old one, the blocks are purged.
     *
     * Back to our example. You release version 1 of your site with the 2 week
     * block and pass "v1" to this function. It is saved. Then, when you release
     * version 2 with the 5 minute block, you pass "v2" to this function. It
     * notices the difference and clears the previous blocks.
     * @param  {string} purge The purge string.
     */
    exports.purgeBlocks = function (purge) {
        if (!_lsEnabled) return;

        if (localStorage[_lsKeyPurge] !== purge) {
            localStorage[_lsKeyPurge] = purge;
            saveStorageBlocks([]);

            console.warn("Blocks purged with string:", purge);
        }
    };

    return exports;
})();