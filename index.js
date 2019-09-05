const pino = require("pino");
const { serializeToString, serializeError, serializeLogLevel } = require("./utils/serializers");

/**
 * Replace the standard serializer to be able to transform each log
 * Pino Documentation: https://getpino.io/#/docs/api?id=serializerssymbolfor39pino39-function
*/
const serializers = {};
serializers[Symbol.for('pino.*')] = (obj) =>{
    Object.keys(obj).forEach(key => {
        serializeToString(key, obj);
    });
    return obj;
}

/**
* Factory to create the logger
*
* @param {Object} props Logger initial configuration
* @param {string} props.type Name of application is using the Logger
* @param {string} props.context Which Logger user want to create: "app" or "access"
* @param {string} minLoglevel minimum level of log enabled: "trace", "debug", "info", "warn", "error", and "fatal"
*/
const createLogger = (props, minLoglevel) => {
    const options = {
        messageKey: "message",
        base: null,
        timestamp: true,
        level: minLoglevel ? minLoglevel.toLowerCase() : "info"
    }

    /**
     * Add the serializeToString for application logger
     * We don't do this inside the Proxy because we want
     * to be able to stringify all the fields, included
     * the ones passed in the initialization that are not
     * available in the pino.write
     */ 
    if (props.context === "app") {
        options.serializers = serializers;
    }

    const customPino = new Proxy(pino(options), {
        get: function (target, prop) {
            // Proxy the logger and intercept the 'write' fnc to be able to customize the logs
            if(prop.toString() === "Symbol(pino.write)"){
                return function () {
                    serializeError(arguments);
                    serializeLogLevel(this.levels, arguments);
                    target[prop].apply(this, arguments);
                }
            }
            return target[prop];
        }
    });

    return customPino.child(props);
};

module.exports = {
    createLogger
};