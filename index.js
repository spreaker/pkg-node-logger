const pino = require("pino");

/**
 * List of default field that should not be transformed by the serializer
*/
const whitelist = ["time", "pid"];

/**
 * Replace the standard serializer to be able to transform each log
 * Pino Documentation: https://getpino.io/#/docs/api?id=serializerssymbolfor39pino39-function
*/
const serializers = {};
serializers[Symbol.for('pino.*')] = ( obj ) => {
    Object.keys(obj).forEach(key => {
        if (whitelist.indexOf(key) === -1) {
            // Try to stringify objects/array or transform other types in string
            try {
                if (typeof obj[key] === "object" || obj[key] instanceof Array) {
                    obj[key] = JSON.stringify(obj[key]);
                } else {
                    obj[key] = String(obj[key]);
                }
            } 
            // in case of errors just return the current value
            catch(err) {
                obj[key] = obj[key];
            }
        }
    });
    return obj;
};


/**
* Factory to create the logger
*
* @param {string} type    Which type of logger you want to create: "app" or "access"
*/
const createLogger = (type = "app") => {
    // Add the custom serializer if we are creating an AppLogger
    const props = type === "app" ? {
        serializers
    } : {};
    return pino(props);
};

module.exports = {
    createLogger
};