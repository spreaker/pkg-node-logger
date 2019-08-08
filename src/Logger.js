const pino = require("pino");

/**
 * Wrapper class around pino package to add some extra functionality.
 */
module.exports = class Logger {
    /**
     * @param {string} loglevel  Accepted values: fatal | error | warn | info | debug | trace
     * @param {object} context   Common props to add to all logged messages.
     */
    constructor(loglevel = "info", context = {}) {
        this._logger = pino({
            messageKey: "message",
            base:       null,
            timestamp:  true,
            level:      loglevel
        });
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
     * Creates a child logger from the current one, inherting all of parent logger context.
     *
     * @param {object} context   Common props to add to current context.
     */
    child(context) {
        return new Logger(this._logger.level, {...this._context, ...context});
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
                err_message: props.message
            };
            if (props.hasOwnProperty("statusCode")) {
                error_props.err_code = props.statusCode;
            }
            if (props.hasOwnProperty("stack")) {
                error_props.err_stack = props.stack;
            }
            props = error_props;
        }
        this._log("error", message, props);
    }

    debug(message, props = {}) {
        this._log("debug", message, props);
    }

    _log(loglevel, message, props) {
        // Add context to props for this message.
        props = {...this._context, ...props};

        // In order to avoid possbile sub-prop type-mismatch issues when ingesting
        // logs into ElasticSearch, we make sure all properties are strings.
        for (var prop in props) {
            if (typeof props[prop] === "object" || props[prop] instanceof Array) {
                props[prop] = JSON.stringify(props[prop]);
            } else {
                props[prop] = String(props[prop]);
            }
        }
        this._logger[loglevel]({...this._context, ...props}, message);
    }
}