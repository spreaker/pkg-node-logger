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
        this._logger       = this._createLogger(loglevel);
        this._accessLogger = null;
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
                error_message: props.message
            };
            if (props.hasOwnProperty("code")) {
                error_props.error_code = props.code;
            }
            if (props.hasOwnProperty("status")) {
                error_props.error_status = props.status;
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

    /**
     * Helper method to record access logs. We want these with no message, context: "access" and
     * not casting all props as strings, since we use a few integers there and the format is standard.
     */
    access(props = {}) {
        // We have a separate logger for access logs (only if our app needs to) since we
        // log them as INFO but we want them written regardless of logger log level set.
        if (null === this._accessLogger) {
            this._accessLogger = this._createLogger("info");
        }
        props = {...this._context, ...props, loglevel: "INFO", context: "access"};

        this._accessLogger.info({...this._context, ...props});
    }

    _log(loglevel, message, props) {
        // Add loglevel and context to props for log message.
        props = {...this._context, ...props, loglevel: loglevel.toUpperCase(), context: "app"};

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

    _createLogger(loglevel) {
        return pino({
            messageKey: "message",
            base:       null,
            timestamp:  true,
            level:      loglevel
        });
    }
}