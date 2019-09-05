const pino = require("pino");
const { getCustomSerializers } = require("./utils/serializers");

/**
 * Replace the standard serializer to be able to transform each log
 * Pino Documentation: https://getpino.io/#/docs/api?id=serializerssymbolfor39pino39-function
*/
const getSerializers = (props) => {
    const serializers = {};
    serializers[Symbol.for('pino.*')] = getCustomSerializers(props.type)[props.context];
    return serializers;
};


/**
* Factory to create the logger
*
* @param {Object} props Logger initial configuration
* @param {string} props.type Name of application is using the Logger
* @param {string} props.context Which Logger user want to create: "app" or "access"
*/
const createLogger = (props, level) => {
    const options = {
        messageKey: "message",
        base: null,
        timestamp: true,
        level: level || "info",
        redact: {
            // we remove the 'stack' field because overwrited by 'error_stack'
            paths: ["stack"],
            remove: true
        }
    }

    // Add the custom serializers based on the context
    options.serializers = getSerializers(props);
    return pino(options).child(props);
};

module.exports = {
    createLogger
};