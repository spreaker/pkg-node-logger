const { createLogger } = require("./index");

describe("Logger", () => {

    ["app","access"].forEach(context => {
        describe(`serialize Errors for ${context} logger`, () => {
            it("should add common error fields and error_message if log message is present", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain('"message":"Error with log message"');
                    expect(log).toContain('"error_stack":"Error: This is an error');
                    expect(log).toContain('"error_message":"This is an error');
                    expect(log).toContain('"error_file"');
                    expect(log).toContain('"error_line"');
                    expect(log).not.toContain('"stack"');
                    done();
                });
                const logger = createLogger({ type: "test", context });
                logger.error(new Error("This is an error"), "Error with log message");
            });

            it("should add common error fields and use Error.message as message if log message is not present", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain('"message":"Error without log message"');
                    expect(log).toContain('"error_stack":"Error: Error without log message');
                    expect(log).toContain('"error_file"');
                    expect(log).toContain('"error_line"');
                    expect(log).not.toContain('"error_message"');
                    expect(log).not.toContain('"stack"');
                    done();
                });
                const logger = createLogger({ type: "test", context });
                logger.error(new Error("Error without log message"));
            });

            it("should add common error fields and use Error.message as message if log message is the Error", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain('"a":"b"');
                    expect(log).toContain('"message":"Error as log message"');
                    expect(log).toContain('"error_stack":"Error: Error as log message');
                    expect(log).toContain('"error_file"');
                    expect(log).toContain('"error_line"');
                    expect(log).not.toContain('"error_message"');
                    expect(log).not.toContain('"stack"');
                    done();
                });
                const logger = createLogger({ type: "test", context });
                logger.error({ "a": "b" }, new Error("Error as log message"));
            });

            it("should works also for child logger", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain('"message":"Error of child logger"');
                    expect(log).toContain('"error_stack":"Error: This is an error');
                    expect(log).toContain('"error_file"');
                    expect(log).toContain('"error_line"');
                    expect(log).toContain('"error_message":"This is an error');
                    expect(log).not.toContain('"stack"');
                    done();
                });
                const logger = createLogger({ type: "test", context }).child({});
                logger.error(new Error("This is an error"), "Error of child logger");
            });
        });
    });

    ["app","access"].forEach(context => {
        describe(`serialize loglevel field for ${context} logger`, () => {
            it("should add the correct loglevel string if no mergingObject is passed", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        `"type":"test","context":"${context}","loglevel":"INFO","message":"Loglevel no mergingObject"`
                    );
                    done();
                });
                const logger = createLogger({ type: "test", context});
                logger.info("Loglevel no mergingObject");
            });
            it("should add the correct loglevel string if mergingObject is passed", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        `"type":"test","context":"${context}","a":"b","loglevel":"WARN","message":"Loglevel with mergingObject"`
                    );
                    done();
                });
                const logger = createLogger({ type: "test", context });
                logger.warn({ "a": "b" }, "Loglevel with mergingObject");
            });
            it("should add the correct loglevel string if we are logging an error message", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        `"type":"test","context":"${context}","error_stack":"Error: Loglevel with error`
                    );
                    expect(log).toContain(
                        '"loglevel":"ERROR","message":"Loglevel with error"'
                    );
                    done();
                });
                const logger = createLogger({ type: "test", context });
                logger.error(new Error("Loglevel with error"));
            });
            it("should add the correct loglevel string for child logger", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        `"type":"test","context":"${context}","child":"child property","loglevel":"INFO","message":"Loglevel with child"`
                    );
                    done();
                });
                const logger = createLogger({ type: "test", context }).child({ "child": "child property" });
                logger.info("Loglevel with child");
            });
        });
    });

    ["parent", "child"].forEach(type => {
        describe(`${type} application logger`, () => {
            const getLogger = () => {
                let logger = createLogger({ type: "test", context: "app"});
                if (type === "child") {
                    logger = logger.child({});
                }
                return logger;
            }

            it("should log the initial properties passed", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        '"type":"test","context":"app","test":"initial_properties"'
                    );
                    done();
                });
                const logger = getLogger();
                logger.info({"test":"initial_properties"}, "Initial properties");
            });
            it("should not transform fields in the whitelist", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        '"test":"whitelist","time":123,"pid":321'
                    );
                    done();
                });
                const logger = getLogger();
                logger.info({"test":"whitelist","time":123,"pid":321}, "Don't transform whitelist");
            });
            it("should stringify objects or array and transform other types into string before log INFO", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        '"test":"stringify_info","object":"{\\\"b\\\":123}","string":"c","number":"321","array":"[\\\"a\\\",1,[\\\"subarray\\\"]]"'
                    );
                    done();
                });
                const logger = getLogger();
                logger.info({"test":"stringify_info","object":{"b":123},"string":"c","number":321,"array":["a",1,["subarray"]]}, "Stringify log");
            });
            it("should stringify objects or array and transform other types into string before log WARN", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        '"test":"stringify_warn","object":"{\\\"b\\\":123}","string":"c","number":"321","array":"[\\\"a\\\",1,[\\\"subarray\\\"]]"'
                    );
                    done();
                });
                const logger = getLogger();
                logger.warn({"test":"stringify_warn","object":{"b":123},"string":"c","number":321,"array":["a",1,["subarray"]]}, "Stringify log");
            });
            it("should transform null or boolean fields into string", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        '"test":"stringify_null","a":"null","b":"true"'
                    );
                    done();
                });
                const logger = getLogger();
                logger.warn({"test":"stringify_null","a": null, "b": true}, "Transform null or boolean");
            });
            it("should stringify functions", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        '"test":"stringify_functions","function":"function () {return true}"'
                    );
                    done();
                });
                const logger = getLogger();
                logger.warn({"test":"stringify_functions","function": function () {return true}}, "Stringify functions");
            });
        });
    });

    ["parent", "child"].forEach(type => {
        describe(`${type} access logger`, () => {
            const getLogger = () => {
                let logger = createLogger({ type: "test", context: "access"});
                if (type === "child") {
                    logger = logger.child({});
                }
                return logger;
            }

            it("should log the initial properties passed", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        '"type":"test","context":"access","test":"access_initial_properties"'
                    );
                    done();
                });
                const logger = getLogger();
                logger.info({"test":"access_initial_properties"}, "Initial properties");
            });
            it("should not stringify objects or array and not transform other types into string before log INFO", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        '"test":"not_stringify_info","object":{\"b\":123},"string":"c","number":321,"array":[\"a\",1,[\"subarray\"]]'
                    );
                    done();
                });
                const logger = getLogger();
                logger.info({"test":"not_stringify_info","object":{"b":123},"string":"c","number":321,"array":["a",1,["subarray"]]}, "Don't stringify log");
            });
            it("should not stringify objects or array and not transform other types into string before log WARN", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        '"test":"not_stringify_warn","object":{\"b\":123},"string":"c","number":321,"array":[\"a\",1,[\"subarray\"]]'
                    );
                    done();
                });
                const logger = getLogger();
                logger.warn({"test":"not_stringify_warn","object":{"b":123},"string":"c","number":321,"array":["a",1,["subarray"]]}, "Don't stringify log");
            });
        });
    });
});