window.Modalite = (function () {
    var _class_modal_visible  = "modal-visible"
    ,   _class_modal_loading  = "modal-loading"
    ,   _class_modal_loaded   = "modal-loaded"
    ,   _class_remote_success = "modal-remote-success"
    ,   _class_remote_error   = "modal-remote-error"
    ,   _class_remote_loading = "modal-remote-loading"
    ,   _attr_modal_remote     = "data-modal-remote"
    ,   _attr_modal_has_remote = "data-modal-has-remote"
    ,   _attr_modal_open       = "data-open-modal"
    ,   _attr_modal_close      = "data-close-modal"
    ,   _attr_modal            = "data-modal"
    ,   _zindex = 9999;

    /**
     * Opens an XHR to a URL and writes the response text in an element. Also
     * adds loading, success and error classes accordingly.
     * @param  {object} elem DOM element in which to write the response text.
     * @param  {string} url  Resource to request.
     * @return {object}      The XHR request.
     */
    function _loadXHR(elem, url) {
        var req = new XMLHttpRequest();

        req.addEventListener("load", function () {
            if (this.status >= 200 && this.status < 300) {
                elem.classList.add(_class_remote_success);
                elem.classList.remove(_class_remote_error);
            } else {
                elem.classList.add(_class_remote_error);
            }

            elem.innerHTML = req.responseText;
        });

        req.addEventListener("error", function () {
            elem.classList.add(_class_remote_error);
        });

        req.addEventListener("loadstart", function () {
            elem.classList.add(_class_remote_loading);
        })

        req.addEventListener("loadend", function () {
            elem.classList.remove(_class_remote_loading);
        });

        req.open("GET", url);
        req.send();

        return req;
    }

    /**
     * Loads a URL in an <iframe> and adds loading and success classes
     * accordingly.
     * @param  {object} elem The <iframe> element to load.
     * @param  {string} url  Resource to load in the <iframe>.
     */
    function _loadIframe(elem, url) {
        elem.classList.add(_class_remote_loading);

        elem.addEventListener("load", function () {
            elem.classList.add(_class_remote_success);
            elem.classList.remove(_class_remote_loading);
        });
        
        elem.src = url;
    }

    /**
     * Loads a modal remote, <iframe> or not.
     * @param  {object}   container   DOM element with the load remote
     * attribute.
     * @param  {function} onLoadStart Function to invoke when the load starts.
     * @param  {function} onLoadEnd   Function to invoke when the load ends.
     */
    function _loadRemote(container, onLoadStart, onLoadEnd) {
        var resource = container.getAttribute(_attr_modal_remote);

        if (resource && resource.length > 0) {
            onLoadStart();

            if (container.tagName === "IFRAME") {
                _loadIframe(container, resource);
                container.addEventListener("load", onLoadEnd);
            } else {
                request = _loadXHR(container, resource);
                request.addEventListener("loadend", onLoadEnd);
            }
        }
    }

    /**
     * Searches a modal for elements with the remote attribute set and loads
     * them, if they weren't already successfully loaded.
     * @param  {object} modal       The modal DOM element.
     * @param  {function} onLoadStart Function to invoke when the load starts.
     * @param  {function} onLoadEnd   Function to invoke when the load ends.
     */
    function _loadModalRemotes(modal, onLoadStart, onLoadEnd) {
        var children = modal.getElementsByTagName("*");

        for (var i = 0; i < children.length; i++) {
            if (!children[i].classList.contains(_class_remote_success)) {
                _loadRemote(children[i], onLoadStart, onLoadEnd);
            }
        }
    }

    /**
     * Loads all remotes of a modal and adds loading/loaded classes.
     * @param  {object} modal The modal DOM element.
     */
    function _loadModal(modal) {
        var resources = 0;

        _loadModalRemotes(
            modal,

            // load start
            function () {
                resources += 1;
            },

            // load end
            function () {
                resources -= 1;
                if (resources <= 0) {
                    modal.classList.remove(_class_modal_loading);
                    modal.classList.add(_class_modal_loaded);
                }
            }
        );

        if (resources > 0) {
            modal.classList.add(_class_modal_loading);
        }
    }

    /**
     * Adds the visible class to a modal and loads its remotes.
     * @param  {object} modal The modal DOM element or its ID attribute.
     */
    function openModal(modal) {
        if (typeof modal === "string") {
            modal = document.getElementById(modal);
        }

        if (modal) {
            modal.classList.add(_class_modal_visible);
            if (modal.style) {
                modal.style.zIndex = _zindex;
                _zindex += 1;
            }

            if (
                modal.getAttribute(_attr_modal_has_remote) !== null &&
                modal.classList.contains(_class_modal_loading) === false &&
                modal.classList.contains(_class_modal_loaded) === false
            ) {
                _loadModal(modal);
            }
        }
    }

    /**
     * Removes the visible class from a modal.
     * @param  {object} modal The modal DOM element or its ID attribute.
     */
    function closeModal(modal) {
        if (typeof modal === "string") {
            modal = document.getElementById(modal);
        }

        if (modal) {
            modal.classList.remove(_class_modal_visible);
        }
    }

    document.addEventListener("click", function (evt) {
        var target = evt.srcElement || evt.target; // evt.target for Mozilla    

        // If the target has the modal attribute, that means it's the modal
        // itself, so it must be closed, as this is expected modal behaviour.
        if (target.getAttribute(_attr_modal) != null) {
            closeModal(target);
        }

        var attrOpen = target.getAttribute(_attr_modal_open);
        if (attrOpen && attrOpen.length > 0) {
            openModal(attrOpen);
        }

        if (target.getAttribute(_attr_modal_close) !== null) {
            var parent = target.parentNode;

            while (parent && parent !== document.body) {
                if (parent.getAttribute(_attr_modal) !== null) {
                    closeModal(parent);

                    // Break the loop so that if the modal is nested, the
                    // parent modals won't be closed.
                    break;
                }

                parent = parent.parentNode;
            }
        }
    });

    return {
        open: openModal,
        close: closeModal
    };
})();