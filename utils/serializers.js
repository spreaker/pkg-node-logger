/**
 * List of default field that should not be transformed by the serializer
*/
const whitelist = ["time", "pid"];

const getCustomSerializers = (type) => {
    return {
        "app": ( obj ) => {
            Object.keys(obj).forEach(key => {
                switch(key) {
                    // Avoid that someone overwrites the type field
                    // because we use it to detect the application
                    case "type":
                        obj.type = type;
                        break;
                    // Serializer to add 'error_stack' field
                    case "stack":
                        obj["error_stack"] = obj[key];
                        break;
                    default:
                        serializeToString(key, obj);
                }
            });
            return obj;
        },
        "access": ( obj ) => {
            Object.keys(obj).forEach(key => {
                switch(key) {
                    // Avoid that someone overwrites the type field
                    // because we use it to detect the application
                    case "type":
                        obj.type = type;
                        break;
                    // Serializer to add 'error_stack' field
                    case "stack":
                        obj["error_stack"] = obj[key];
                }
            });
            return obj;
        }
    }
};


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

module.exports = {
    getCustomSerializers
};