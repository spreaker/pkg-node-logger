const { getLevelAsString } = require("./levels");
const parseErrorStack = require("./parseErrorStack");

/**
 * List of default field that should not be transformed by the serializer
*/
const whitelist = ["time", "pid"];

/**
 * Serializer to transform values into string
*/
const serializeToString = (key, obj) => {
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
};

const getErrorCommonFields = (obj) => {
    return {
        error_stack: obj.stackTrace,
        error_file: obj.fileName,
        error_line: obj.lineNumber
    }
};

/**
 * Serializer to transform Error
 * - if the Error is passed as mergingObject (first param) and the log has already a message (second param)
 * we add fields "error_message": Error.message and "error_stack": Error.stack to the mergingObject
 * - if the Error is passed as mergingObject (first param) and the log has not a message (second param)
 * we add field "error_stack": Error.stack to the mergingObject and use the Error.message as message
 * - if the Error is passed as message (second param)
 * we add field "error_stack": Error.stack to the mergingObject and use the Error.message as message
*/
const serializeError = (arguments) => {
    if (arguments[0] instanceof Error) {
        const errorStackParsed = parseErrorStack(arguments[0]);
        if (arguments[1]) {
            arguments[0] = {
                error_message: arguments[0].message,
                ...getErrorCommonFields(errorStackParsed)
            };
        } else {
            arguments[1] = arguments[0].message;
            arguments[0] = getErrorCommonFields(errorStackParsed);
        }
    }
    if (arguments[1] instanceof Error) {
        const errorStackParsed = parseErrorStack(arguments[1]);
        arguments[0] = {
            ...arguments[0],
            ...getErrorCommonFields(errorStackParsed)
        }
        arguments[1] = arguments[1].message;
    }
}

/**
 * Add loglevel field to have a string version of the log level
 */
const serializeLogLevel = (levels, arguments) => {
    if (!arguments[0]) {
        arguments[0] = {}
    }
    arguments[0].loglevel = getLevelAsString(levels, arguments[2]);
}

module.exports = {
    serializeToString,
    serializeError,
    serializeLogLevel
};