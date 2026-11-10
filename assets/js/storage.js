/* Central localStorage access for the Ndago Market frontend prototype. */
(function (global) {
    "use strict";

    const PREFIX = "ndagoMarket:";

    function read(key, fallback) {
        try {
            const value = localStorage.getItem(PREFIX + key);
            return value === null ? fallback : JSON.parse(value);
        } catch (error) {
            console.error("Ndago Market could not read " + key + ".", error);
            return fallback;
        }
    }

    function write(key, value) {
        try {
            localStorage.setItem(PREFIX + key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error("Ndago Market could not save " + key + ".", error);
            return false;
        }
    }

    function remove(key) {
        localStorage.removeItem(PREFIX + key);
    }

    global.NdagoStorage = { read, write, remove };
})(window);
