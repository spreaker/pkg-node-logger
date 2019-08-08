const pino = require("pino");

/**
 * Wrapper class around pino package to add some extra functionality.
 */
module.exports = class Logger {
    /**
     * @param {string} loglevel  Accepted values: fatal | error | warn | info | debug | trace
     * @param {object} context   Common props to add to all logged messages.
     * @param {object} logger    Pino instance to use, if null create a new one (default).
     */
    constructor(loglevel = "info", context = {}, logger = null) {
        this._logger = logger || pino({
            messageKey: "message",
            base:       null,
            timestamp:  true,
            level:      loglevel
        });
        this.setLogLevel(loglevel);
        this.setContext(context);
    }

    /**
     * Sets the pino-compatible log level to be used from this point forward.
     *
     * @param {string} loglevel  Accepted values: fatal | error | warn | info | debug | trace
     */
    setLogLevel(loglevel) {
        this._logger.level = loglevel;
    }

    /**
     * Sets common props that will be added to all logs from this point forward.
     * Useful for things like request_id, type/namespace/service, etc.
     *
     * @param {object} context   Common props to add to all logged messages.
     */
    setContext(context) {
        this._context = context;
    }

    /**
     * Adds/overwrites common props that will be added to all logs from this point forward.
     * Useful for things like request_id, type/namespace/service, etc.
     *
     * @param {object} context   Common props to add to all logged messages.
     */
    addContext(context) {
        this._context = {...this._context, ...context};
    }

    /**
     * Creates a child logger from the current one, inherting
     *
     * @param {object} context   Common props to add to all logged messages.
     */
    child(options) {
        return new Logger(this._logger.level, this._context, this._logger.child(options));
    }

    info(message, props = {}) {
        this._log("info", message, props);
    }

    warn(message, props = {}) {
        this._log("warn", message, props);
    }

    error(message, props = {}) {
        if (props instanceof Error) {
            var error_props = {
                error_message: props.message
            };
            if (props.hasOwnProperty("statusCode")) {
                error_props.error_code = props.statusCode;
            }
            if (props.hasOwnProperty("stack")) {
                error_props.error_stack = props.stack;
            }
            props = error_props;
        }
        this._log("error", message, props);
    }

    debug(message, props = {}) {
        this._log("debug", message, props);
    }

    _log(loglevel, message, props) {
        // Add loglevel and context to props for log message.
        props = {...this._context, ...props, loglevel: loglevel.toUpperCase()};

        // We serialize all object props to avoid possbile sub-prop type-mismatch
        // problems when ingesting logs into ElasticSearch.
        for (var prop in props) {
            if (typeof props[prop] === "object") {
                props[prop] = JSON.stringify(props[prop]);
            }
        }
        this._logger[loglevel]({...this._context, ...props}, message);
    }
}