const stackTrace = require("stack-trace");

module.exports = (err) => {
    try {
        const parseTrace = stackTrace.parse(err)[0];
        const obj = {
            stackTrace: err.stack,
            code: err.code || null,
            fileName: parseTrace.getFileName(),
            lineNumber: parseTrace.getLineNumber(),
            functionName: parseTrace.getFunctionName(),
            columnNumber: parseTrace.getColumnNumber(),
        };
        return obj;
    } catch (e) {
        const obj = {
            stackTrace: (err && err.stack) || null,
            code: (err && err.code) || null,
            fileName: null,
            lineNumber: null,
            functionName: null,
            columnNumber: null,
        };
        return obj;
    }
};
