const fs = require("fs");
const path = require("path");
const { createLogger } = require("./index");

describe("Logger", () => {

    ["app","access"].forEach(context => {
        describe(`${context} logger destination`, () => {

            afterEach(() => {
                fs.unlinkSync(path.join(__dirname, "./logs"));
            });

            it("should use destination passed as logs output", () => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    const logs = fs.readFileSync(path.join(__dirname, "./logs")).toString();
                    expect(logs).toContain(`"type":"test","context":"${context}"`);
                    expect(logs).toContain('"message":"Test destination"');
                });
                const logger = createLogger({ type: "test", context }, { destination: "./logs" });
                logger.info("Test destination");
            });
        });
    });

    ["parent", "child"].forEach(type => {
        describe(`${type} application logger`, () => {
            const getLogger = (minLoglevel) => {
                let logger = createLogger({ type: "test", context: "app"}, { minLoglevel });
                if (type === "child") {
                    logger = logger.child({});
                }
                return logger;
            }
            it("should log the initial properties passed", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        '"type":"test","context":"app","test":"initial_properties","loglevel":"INFO","message":"Initial properties"'
                    );
                    done();
                });
                const logger = getLogger();
                logger.info({"test":"initial_properties"}, "Initial properties");
            });
            it("should not transform fields in the whitelist", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        '"time":123,"pid":321'
                    );
                    done();
                });
                const logger = getLogger();
                logger.info({"time":123,"pid":321}, "Don't transform whitelist");
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
            it("should add the correct loglevel string if no mergingObject is passed", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        '"type":"test","context":"app","loglevel":"INFO","message":"Loglevel no mergingObject"'
                    );
                    done();
                });
                const logger = getLogger();
                logger.info("Loglevel no mergingObject");
            });
            it("should add the correct loglevel string if mergingObject is passed", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        '"type":"test","context":"app","a":"b","loglevel":"WARN","message":"Loglevel with mergingObject"'
                    );
                    done();
                });
                const logger = getLogger();
                logger.warn({ "a": "b" }, "Loglevel with mergingObject");
            });
            it("should add loglevel = DEBUG for trace logs", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        '"type":"test","context":"app","loglevel":"DEBUG","message":"Replace trace with debug"'
                    );
                    done();
                });
                const logger = getLogger("trace");
                logger.trace("Replace trace with debug");
            });

            describe(`serialize Errors`, () => {
                it("should add common error fields and error_message if log message is present", (done) => {
                    spyOn(process.stdout,"write").and.callFake(log => {
                        expect(log).toContain('"message":"Error with log message"');
                        expect(log).toContain('"error_stack":"Error: This is an error');
                        expect(log).toContain('"error_code":"ERR_CODE"');
                        expect(log).toContain('"error_message":"This is an error');
                        expect(log).toContain('"error_file"');
                        expect(log).toContain('"error_line"');
                        expect(log).not.toContain('"stack"');
                        done();
                    });
                    const logger = getLogger();
                    const error = new Error("This is an error");
                    error.code = "ERR_CODE";
                    logger.error(error, "Error with log message");
                });
    
                it("should add common error fields and use Error.message as message if log message is not present", (done) => {
                    spyOn(process.stdout,"write").and.callFake(log => {
                        expect(log).toContain('"message":"Error without log message"');
                        expect(log).toContain('"error_stack":"Error: Error without log message');
                        expect(log).toContain('"error_code":"ERR_CODE"');
                        expect(log).toContain('"error_file"');
                        expect(log).toContain('"error_line"');
                        expect(log).not.toContain('"error_message"');
                        expect(log).not.toContain('"stack"');
                        done();
                    });
                    const logger = getLogger();
                    const error = new Error("Error without log message");
                    error.code = "ERR_CODE";
                    logger.error(error);
                });
    
                it("should add common error fields and use Error.message as message if log message is the Error", (done) => {
                    spyOn(process.stdout,"write").and.callFake(log => {
                        expect(log).toContain('"a":"b"');
                        expect(log).toContain('"message":"Error as log message"');
                        expect(log).toContain('"error_stack":"Error: Error as log message');
                        expect(log).toContain('"error_code":"ERR_CODE"');
                        expect(log).toContain('"error_file"');
                        expect(log).toContain('"error_line"');
                        expect(log).not.toContain('"error_message"');
                        expect(log).not.toContain('"stack"');
                        done();
                    });
                    const logger = getLogger();
                    const error = new Error("Error as log message");
                    error.code = "ERR_CODE";
                    logger.error({ "a": "b" }, error);
                });
                
                it("should not add error code if not present in Error instance", (done) => {
                    spyOn(process.stdout,"write").and.callFake(log => {
                        expect(log).toContain('"error_stack":"Error: Error without code');
                        expect(log).toContain('"error_file"');
                        expect(log).toContain('"error_line"');
                        expect(log).not.toContain('"error_message"');
                        expect(log).not.toContain('"error_code"');
                        expect(log).not.toContain('"stack"');
                        done();
                    });
                    const logger = getLogger();
                    logger.error(new Error("Error without code"));
                });
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
            it("should not add loglevel field", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        `"type":"test","context":"access","message":"No loglevel added"`
                    );
                    expect(log).not.toContain('"loglevel"');
                    done();
                });
                const logger = getLogger();
                logger.info("No loglevel added");
            });

            describe(`serialize Errors`, () => {
                it("should add common error fields and error_message if log message is present", (done) => {
                    spyOn(process.stdout,"write").and.callFake(log => {
                        expect(log).toContain('"message":"Error with log message"');
                        expect(log).toContain('"error_stack":"Error: This is an error');
                        expect(log).toContain('"error_code":"ERR_CODE"');
                        expect(log).toContain('"error_message":"This is an error');
                        expect(log).toContain('"error_file"');
                        expect(log).toContain('"error_line"');
                        expect(log).not.toContain('"stack"');
                        done();
                    });
                    const logger = getLogger();
                    const error = new Error("This is an error");
                    error.code = "ERR_CODE";
                    logger.error(error, "Error with log message");
                });
    
                it("should add common error fields and use Error.message as message if log message is not present", (done) => {
                    spyOn(process.stdout,"write").and.callFake(log => {
                        expect(log).toContain('"message":"Error without log message"');
                        expect(log).toContain('"error_stack":"Error: Error without log message');
                        expect(log).toContain('"error_code":"ERR_CODE"');
                        expect(log).toContain('"error_file"');
                        expect(log).toContain('"error_line"');
                        expect(log).not.toContain('"error_message"');
                        expect(log).not.toContain('"stack"');
                        done();
                    });
                    const logger = getLogger();
                    const error = new Error("Error without log message");
                    error.code = "ERR_CODE";
                    logger.error(error);
                });
    
                it("should add common error fields and use Error.message as message if log message is the Error", (done) => {
                    spyOn(process.stdout,"write").and.callFake(log => {
                        expect(log).toContain('"a":"b"');
                        expect(log).toContain('"message":"Error as log message"');
                        expect(log).toContain('"error_stack":"Error: Error as log message');
                        expect(log).toContain('"error_code":"ERR_CODE"');
                        expect(log).toContain('"error_file"');
                        expect(log).toContain('"error_line"');
                        expect(log).not.toContain('"error_message"');
                        expect(log).not.toContain('"stack"');
                        done();
                    });
                    const logger = getLogger();
                    const error = new Error("Error as log message");
                    error.code = "ERR_CODE";
                    logger.error({ "a": "b" }, error);
                    done();
                });

                it("should not add error code if not present in Error instance", (done) => {
                    spyOn(process.stdout,"write").and.callFake(log => {
                        expect(log).toContain('"error_stack":"Error: Error without code');
                        expect(log).toContain('"error_file"');
                        expect(log).toContain('"error_line"');
                        expect(log).not.toContain('"error_message"');
                        expect(log).not.toContain('"error_code"');
                        expect(log).not.toContain('"stack"');
                        done();
                    });
                    const logger = getLogger();
                    logger.error(new Error("Error without code"));
                });
            });
        });
    });
});