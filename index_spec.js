const { createLogger } = require("./index");

describe("Logger", () => {

    ["parent", "child"].forEach(type => {
        describe(`${type} application logger`, () => {
            const getLogger = (minLogValue) => {
                let logger = createLogger({ type: "test", context: "app"}, minLogValue);
                if (type === "child") {
                    logger = logger.child({});
                }
                return logger;
            }
            it("should add 'v2_' prefix to all the fields, except for the whitelisted ones", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        '"v2_type":"test","v2_context":"app","time":123,"pid":"321","v2_loglevel":"INFO","v2_message":"Add prefix"'
                    );
                    done();
                });
                const logger = getLogger();
                logger.info({"time":123,"pid":"321"}, "Add prefix");
            });
            it("should log the initial properties passed", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        '"v2_type":"test","v2_context":"app","v2_test":"initial_properties"'
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
                        '"v2_test":"stringify_info","v2_object":"{\\\"b\\\":123}","v2_string":"c","v2_number":"321","v2_array":"[\\\"a\\\",1,[\\\"subarray\\\"]]"'
                    );
                    done();
                });
                const logger = getLogger();
                logger.info({"test":"stringify_info","object":{"b":123},"string":"c","number":321,"array":["a",1,["subarray"]]}, "Stringify log");
            });
            it("should stringify objects or array and transform other types into string before log WARN", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        '"v2_test":"stringify_warn","v2_object":"{\\\"b\\\":123}","v2_string":"c","v2_number":"321","v2_array":"[\\\"a\\\",1,[\\\"subarray\\\"]]"'
                    );
                    done();
                });
                const logger = getLogger();
                logger.warn({"test":"stringify_warn","object":{"b":123},"string":"c","number":321,"array":["a",1,["subarray"]]}, "Stringify log");
            });
            it("should transform null or boolean fields into string", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        '"v2_test":"stringify_null","v2_a":"null","v2_b":"true"'
                    );
                    done();
                });
                const logger = getLogger();
                logger.warn({"test":"stringify_null","a": null, "b": true}, "Transform null or boolean");
            });
            it("should stringify functions", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        '"v2_test":"stringify_functions","v2_function":"function () {return true}"'
                    );
                    done();
                });
                const logger = getLogger();
                logger.warn({"test":"stringify_functions","function": function () {return true}}, "Stringify functions");
            });
            it("should add the correct loglevel string if no mergingObject is passed", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        '"v2_type":"test","v2_context":"app","v2_loglevel":"INFO","v2_message":"Loglevel no mergingObject"'
                    );
                    done();
                });
                const logger = getLogger();
                logger.info("Loglevel no mergingObject");
            });
            it("should add the correct loglevel string if mergingObject is passed", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        '"v2_type":"test","v2_context":"app","v2_a":"b","v2_loglevel":"WARN","v2_message":"Loglevel with mergingObject"'
                    );
                    done();
                });
                const logger = getLogger();
                logger.warn({ "a": "b" }, "Loglevel with mergingObject");
            });
            it("should add loglevel = DEBUG for trace logs", (done) => {
                spyOn(process.stdout,"write").and.callFake(log => {
                    expect(log).toContain(
                        '"v2_type":"test","v2_context":"app","v2_loglevel":"DEBUG","v2_message":"Replace trace with debug"'
                    );
                    done();
                });
                const logger = getLogger("trace");
                logger.trace("Replace trace with debug");
            });

            describe(`serialize Errors`, () => {
                it("should add common error fields and error_message if log message is present", (done) => {
                    spyOn(process.stdout,"write").and.callFake(log => {
                        expect(log).toContain('"v2_message":"Error with log message"');
                        expect(log).toContain('"v2_error_stack":"Error: This is an error');
                        expect(log).toContain('"v2_error_message":"This is an error');
                        expect(log).toContain('"v2_error_file"');
                        expect(log).toContain('"v2_error_line"');
                        expect(log).not.toContain('"v2_stack"');
                        expect(log).not.toContain('"stack"');
                        done();
                    });
                    const logger = getLogger();
                    logger.error(new Error("This is an error"), "Error with log message");
                });
    
                it("should add common error fields and use Error.message as message if log message is not present", (done) => {
                    spyOn(process.stdout,"write").and.callFake(log => {
                        expect(log).toContain('"v2_message":"Error without log message"');
                        expect(log).toContain('"v2_error_stack":"Error: Error without log message');
                        expect(log).toContain('"v2_error_file"');
                        expect(log).toContain('"v2_error_line"');
                        expect(log).not.toContain('"error_message"');
                        expect(log).not.toContain('"v2_stack"');
                        expect(log).not.toContain('"stack"');
                        done();
                    });
                    const logger = getLogger();
                    logger.error(new Error("Error without log message"));
                });
    
                it("should add common error fields and use Error.message as message if log message is the Error", (done) => {
                    spyOn(process.stdout,"write").and.callFake(log => {
                        expect(log).toContain('"v2_a":"b"');
                        expect(log).toContain('"v2_message":"Error as log message"');
                        expect(log).toContain('"v2_error_stack":"Error: Error as log message');
                        expect(log).toContain('"v2_error_file"');
                        expect(log).toContain('"v2_error_line"');
                        expect(log).not.toContain('"v2_error_message"');
                        expect(log).not.toContain('"v2_stack"');
                        expect(log).not.toContain('"stack"');
                        done();
                    });
                    const logger = getLogger();
                    logger.error({ "a": "b" }, new Error("Error as log message"));
                    done();
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
                        expect(log).toContain('"error_message":"This is an error');
                        expect(log).toContain('"error_file"');
                        expect(log).toContain('"error_line"');
                        expect(log).not.toContain('"stack"');
                        done();
                    });
                    const logger = getLogger();
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
                    const logger = getLogger();
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
                    const logger = getLogger();
                    logger.error({ "a": "b" }, new Error("Error as log message"));
                    done();
                });
            });
        });
    });
});