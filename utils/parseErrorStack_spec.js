const parseErrorStack = require("./parseErrorStack");

describe("Parse error stack trace", () => {
    it("should parse a simple valid stack trace", () => {
        const error = {
            stack: "Error: pippo\n    at GetPippo (/workspace/pippo.js:1:1)",
        };

        const errorStackParsed = parseErrorStack(error);

        expect(errorStackParsed).toEqual({
            stackTrace: "Error: pippo\n    at GetPippo (/workspace/pippo.js:1:1)",
            fileName: "/workspace/pippo.js",
            lineNumber: 1,
            functionName: "GetPippo",
            columnNumber: 1,
        });
    });

    it("should parse a complex valid stack trace", () => {
        const error = {
            stack:
                "Error: pippo\n    at GetLogin (/workspace/app-dynamo/apps/admin/server/src/routes/Login.js:14:11)\n    at dispatch (/workspace/app-dynamo/node_modules/koa-router/node_modules/koa-compose/index.js:44:32)\n    at next (/workspace/app-dynamo/node_modules/koa-router/node_modules/koa-compose/index.js:45:18)\n    at module.exports (/workspace/app-dynamo/apps/admin/server/src/middlewares/CheckLoginAccessMiddleware.js:6:15)\n    at dispatch (/workspace/app-dynamo/node_modules/koa-router/node_modules/koa-compose/index.js:44:32)\n    at next (/workspace/app-dynamo/node_modules/koa-router/node_modules/koa-compose/index.js:45:18)\n    at /workspace/app-dynamo/node_modules/koa-generic-session/lib/session.js:264:15\n    at Generator.next (<anonymous>)\n    at step (/workspace/app-dynamo/node_modules/koa-generic-session/lib/session.js:3:191)\n    at /workspace/app-dynamo/node_modules/koa-generic-session/lib/session.js:3:361",
        };

        const errorStackParsed = parseErrorStack(error);

        expect(errorStackParsed).toEqual({
            stackTrace:
                "Error: pippo\n    at GetLogin (/workspace/app-dynamo/apps/admin/server/src/routes/Login.js:14:11)\n    at dispatch (/workspace/app-dynamo/node_modules/koa-router/node_modules/koa-compose/index.js:44:32)\n    at next (/workspace/app-dynamo/node_modules/koa-router/node_modules/koa-compose/index.js:45:18)\n    at module.exports (/workspace/app-dynamo/apps/admin/server/src/middlewares/CheckLoginAccessMiddleware.js:6:15)\n    at dispatch (/workspace/app-dynamo/node_modules/koa-router/node_modules/koa-compose/index.js:44:32)\n    at next (/workspace/app-dynamo/node_modules/koa-router/node_modules/koa-compose/index.js:45:18)\n    at /workspace/app-dynamo/node_modules/koa-generic-session/lib/session.js:264:15\n    at Generator.next (<anonymous>)\n    at step (/workspace/app-dynamo/node_modules/koa-generic-session/lib/session.js:3:191)\n    at /workspace/app-dynamo/node_modules/koa-generic-session/lib/session.js:3:361",
            fileName: "/workspace/app-dynamo/apps/admin/server/src/routes/Login.js",
            lineNumber: 14,
            functionName: "GetLogin",
            columnNumber: 11,
        });
    });

    it("should not brake in case of invalid stack trace", () => {
        const error = {
            stack: "Error: pippo   at GetPippo (/workspace/pippo.js:1:1)",
        };

        const errorStackParsed = parseErrorStack(error);

        expect(errorStackParsed).toEqual({
            stackTrace: "Error: pippo   at GetPippo (/workspace/pippo.js:1:1)",
            fileName: null,
            lineNumber: null,
            functionName: null,
            columnNumber: null,
        });
    });
});
