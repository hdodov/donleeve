window.ActiveTimeout = (function () {

    // Gets the Visibility API properties. If the browser doesn't support
    // that, this library would basically be useless, except for the fancy way
    // of handling time.
    var _visibility = (function () {
        var p, e;

        if ("hidden" in document) {
            p = "hidden";
            e = "visibilitychange";
        } else if ("msHidden" in document) {
            p = "msHidden";
            e = "msvisibilitychange";
        } else if ("webkitHidden" in document) {
            p = "webkitHidden";
            e = "webkitvisibilitychange";
        } else {
            return null;
        }

        return {
            hidden: p,
            event: e
        };
    })();

    function _isPageHidden() {
        return (_visibility && document[_visibility.hidden]);
    }

    /**
     * Invokes a function after a ~17ms interval. Uses `requestAnimationFrame`
     * if supported to ease the load on the browser.
     * @param  {function} callback Function to execute.
     */
    function _delay(callback) {
        if (typeof requestAnimationFrame !== "undefined") {
            requestAnimationFrame(callback);
        } else {
            setTimeout(callback, (1000 / 60));
        }
    }

    var _listeners = [];

    if (_visibility) {
        document.addEventListener(_visibility.event, function () {
            if (!_isPageHidden()) {
                // The page is not hidden, but a change occured. That means
                // is *was* previously hidden, so the timers receive an event
                // that tells them to ignore the next tick since it would
                // contain the inactive time.
                for (var i = _listeners.length - 1; i >= 0; i--) {
                    _listeners[i]();
                }
            }
        });
    }

    /**
     * Measure ~60 intervals per second and ignore ones where the user was
     * inactive. Repeat until the predicate returns a falsy value.
     * @param  {function} predicate Stops pulsing when it returns a falsy value.
     */
    function pulse(predicate) {
        var ignoreTicks = 0;
        var listener = function () {
            ignoreTicks += 1;
        }
        
        _listeners.push(listener);

        (function measure(last) {
            var proceed = false, now = Date.now();

            // Whenever the page loses focus, the next tick should be
            // ignored, otherwise the inactive time would be added and this
            // whole charade would be meaningless.
            if (ignoreTicks > 0) {
                ignoreTicks -= 1;
                proceed = true;
            } else {
                if (_isPageHidden()) {
                    // Page is hidden, continue to pulse and wait for focus.
                    proceed = true;
                } else {
                    if (!last) {
                        // First iteration of the recursion, continue and wait
                        // for some time to pass.
                        proceed = true;
                    } else {
                        // Finally, the predicate decides whether to continue.
                        proceed = predicate(now - last);
                    }
                }
            }

            if (proceed === true) {
                _delay(function () {
                    measure(now);
                });
            } else {
                _listeners.splice(_listeners.indexOf(listener), 1);
            }
        })();
    }

    /**
     * Count *active* passed time until a predicate returns a falsy value.
     * @param  {function} predicate Stops the counter when it returns a falsy value.
     */
    function count(predicate) {
        var time = 0;

        pulse(function (tick) {
            time += tick;
            return predicate(time, tick);
        });
    }

    /**
     * Invoke a function after the user has spent a set amount of *active* time
     * on the page. Optionally provide a callback for each tick.
     * @param  {function} completeCallback Function to call when the timeout
     *                                     completes.
     * @param  {function} tickCallback     Optional function to call upon each
     *                                     timer tick.
     * @param  {number}   time             How much milliseconds to wait.
     */
    function timeout(completeCallback, tickCallback, time) {
        if (typeof tickCallback === "number") {
            time = tickCallback;
            tickCallback = null;
        }

        count(function (passed, tick) {
            if (typeof tickCallback === "function") {
                tickCallback(time - passed, tick);
            }

            if (passed >= time) {
                completeCallback();
                return false;
            } else {
                return true;
            }
        });
    }

    return {
        set: timeout,
        count: count,
        pulse: pulse
    };
})();