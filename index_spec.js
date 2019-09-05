const { createLogger } = require("./index");

describe("Logger", () => {

    describe("loglevel field", () => {
        it("should add the correct loglevel string if no mergingObject is passed", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain(
                    '"type":"test","context":"app","loglevel":"INFO","message":"Loglevel no mergingObject"'
                );
                done();
            });
            const logger = createLogger({ type: "test", context: "app"});
            logger.info("Loglevel no mergingObject");
        });
        it("should add the correct loglevel string if mergingObject is passed", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain(
                    '"type":"test","context":"access","a":"b","loglevel":"WARN","message":"Loglevel with mergingObject"'
                );
                done();
            });
            const logger = createLogger({ type: "test", context: "access"});
            logger.warn({ "a": "b" }, "Loglevel with mergingObject");
        });
        it("should add the correct loglevel string if we are logging an error message", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain(
                    '"type":"test","context":"app","loglevel":"ERROR","message":"Loglevel with error"'
                );
                expect(log).toContain(
                    '"error_stack":"Error: Loglevel with error'
                );
                done();
            });
            const logger = createLogger({ type: "test", context: "app"});
            logger.error(new Error("Loglevel with error"));
        });
        it("should add the correct loglevel string for child logger", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain(
                    '"type":"test","context":"app","child":"true","loglevel":"INFO","message":"Loglevel with child"'
                );
                done();
            });
            const logger = createLogger({ type: "test", context: "app"}).child({ "child": true });
            logger.info("Loglevel with child");
        });
    });

    describe("application logger", () => {
        it("should log the initial properties passed", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain(
                    '"type":"test","context":"app","test":"initial_properties"'
                );
                done();
            });
            const logger = createLogger({ type: "test", context: "app"});
            logger.info({"test":"initial_properties"}, "Initial properties");
        });
        it("should not transform fields in the whitelist", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain(
                    '"test":"whitelist","time":123,"pid":321'
                );
                done();
            });
            const logger = createLogger({ type: "test", context: "app"});
            logger.info({"test":"whitelist","time":123,"pid":321}, "Don't transform whitelist");
        });
        it("should stringify objects or array and transform other types into string before log INFO", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain(
                    '"test":"stringify_info","object":"{\\\"b\\\":123}","string":"c","number":"321","array":"[\\\"a\\\",1,[\\\"subarray\\\"]]"'
                );
                done();
            });
            const logger = createLogger({ type: "test", context: "app"});
            logger.info({"test":"stringify_info","object":{"b":123},"string":"c","number":321,"array":["a",1,["subarray"]]}, "Stringify log");
        });
        it("should stringify objects or array and transform other types into string before log WARN", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain(
                    '"test":"stringify_warn","object":"{\\\"b\\\":123}","string":"c","number":"321","array":"[\\\"a\\\",1,[\\\"subarray\\\"]]"'
                );
                done();
            });
            const logger = createLogger({ type: "test", context: "app"});
            logger.warn({"test":"stringify_warn","object":{"b":123},"string":"c","number":321,"array":["a",1,["subarray"]]}, "Stringify log");
        });
        it("should transform null or boolean fields into string", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain(
                    '"test":"stringify_null","a":"null","b":"true"'
                );
                done();
            });
            const logger = createLogger({ type: "test", context: "app"});
            logger.warn({"test":"stringify_null","a": null, "b": true}, "Transform null or boolean");
        });
        it("should stringify functions", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain(
                    '"test":"stringify_functions","function":"function () {return true}"'
                );
                done();
            });
            const logger = createLogger({ type: "test", context: "app"});
            logger.warn({"test":"stringify_functions","function": function () {return true}}, "Stringify functions");
        });

        it("should serialize Error stack", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain('"message":"This is an error"');
                expect(log).toContain('"error_stack":"Error: This is an error');
                expect(log).not.toContain('"stack"');
                done();
            });
            const logger = createLogger({ type: "test", context: "app"});
            logger.error(new Error("This is an error"));
        });

        it("should not be possible to overwrite 'type' field", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain(
                    '"type":"test","context":"app","type":"test","loglevel":"INFO"'
                );
                done();
            });
            const logger = createLogger({ type: "test", context: "app"});
            logger.info({ type: "overwrited" });
        });
    });

    describe("access logger", () => {
        it("should log the initial properties passed", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain(
                    '"type":"test","context":"access","test":"access_initial_properties"'
                );
                done();
            });
            const logger = createLogger({ type: "test", context: "access"});
            logger.info({"test":"access_initial_properties"}, "Initial properties");
        });
        it("should not stringify objects or array and not transform other types into string before log INFO", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain(
                    '"test":"not_stringify_info","object":{\"b\":123},"string":"c","number":321,"array":[\"a\",1,[\"subarray\"]]'
                );
                done();
            });
            const logger = createLogger({ type: "test", context: "access"});
            logger.info({"test":"not_stringify_info","object":{"b":123},"string":"c","number":321,"array":["a",1,["subarray"]]}, "Don't stringify log");
        });
        it("should not stringify objects or array and not transform other types into string before log WARN", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain(
                    '"test":"not_stringify_warn","object":{\"b\":123},"string":"c","number":321,"array":[\"a\",1,[\"subarray\"]]'
                );
                done();
            });
            const logger = createLogger({ type: "test", context: "access"});
            logger.warn({"test":"not_stringify_warn","object":{"b":123},"string":"c","number":321,"array":["a",1,["subarray"]]}, "Don't stringify log");
        });

        it("should serialize Error stack", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain('"message":"This is an error"');
                expect(log).toContain('"error_stack":"Error: This is an error');
                expect(log).not.toContain('"stack"');
                done();
            });
            const logger = createLogger({ type: "test", context: "access"});
            logger.error(new Error("This is an error"));
        });

        it("should not be possible to overwrite 'type' field", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain(
                    '"type":"test","context":"access","type":"test","loglevel":"INFO"'
                );
                done();
            });
            const logger = createLogger({ type: "test", context: "access"});
            logger.info({ type: "overwrited" });
        });
    })
});