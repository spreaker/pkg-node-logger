const { createLogger } = require("./index");

describe("Logger", () => {

    describe("application", () => {
        it("should not transform fields in the whitelist", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain(
                    '"test":"whitelist","time":123,"pid":321'
                );
                done();
            });
            const logger = createLogger();
            logger.info({"test":"whitelist","time":123,"pid":321}, "Don't transform whitelist");
        });
        it("should stringify objects or array and transform other types into string before logging INFO", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain(
                    '"test":"stringify_info","object":"{\\\"b\\\":123}","string":"c","number":"321","array":"[\\\"a\\\",1,[\\\"subarray\\\"]]"'
                );
                done();
            });
            const logger = createLogger();
            logger.info({"test":"stringify_info","object":{"b":123},"string":"c","number":321,"array":["a",1,["subarray"]]}, "Stringify log");
        });
        it("should stringify objects or array and transform other types into string before logging WARN", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain(
                    '"test":"stringify_warn","object":"{\\\"b\\\":123}","string":"c","number":"321","array":"[\\\"a\\\",1,[\\\"subarray\\\"]]"'
                );
                done();
            });
            const logger = createLogger();
            logger.warn({"test":"stringify_warn","object":{"b":123},"string":"c","number":321,"array":["a",1,["subarray"]]}, "Stringify log");
        });
        it("should transform null or boolean fields into string", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain(
                    '"test":"stringify_null","a":"null","b":"true"'
                );
                done();
            });
            const logger = createLogger();
            logger.warn({"test":"stringify_null","a": null, "b": true}, "Don't transform whitelist");
        });
        it("should stringify functions", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain(
                    '"test":"stringify_functions","function":"function () {return true}"'
                );
                done();
            });
            const logger = createLogger();
            logger.warn({"test":"stringify_functions","function": function () {return true}}, "Stringify functions");
        });
    });

    describe("access", () => {
        it("should not stringify objects or array and not transform other types into string before logging INFO", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain(
                    '"test":"not_stringify_info","object":{\"b\":123},"string":"c","number":321,"array":[\"a\",1,[\"subarray\"]]'
                );
                done();
            });
            const logger = createLogger("access");
            logger.info({"test":"not_stringify_info","object":{"b":123},"string":"c","number":321,"array":["a",1,["subarray"]]}, "Stringify log");
        });
        it("should not stringify objects or array and not transform other types into string before logging WARN", (done) => {
            spyOn(process.stdout,"write").and.callFake(log => {
                expect(log).toContain(
                    '"test":"not_stringify_warn","object":{\"b\":123},"string":"c","number":321,"array":[\"a\",1,[\"subarray\"]]'
                );
                done();
            });
            const logger = createLogger("access");
            logger.warn({"test":"not_stringify_warn","object":{"b":123},"string":"c","number":321,"array":["a",1,["subarray"]]}, "Stringify log");
        });
    })
});