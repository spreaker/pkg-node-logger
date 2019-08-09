// module.exports = require("./src/Logger");

const Logger =  require("./src/Logger");

var logger = new Logger("debug", { foo: "bar" });

logger.info("message", { asd: 123 });
logger.info("message", { asd: [1,2,3] });
logger.info("message", { asd: [{ asd: "foobar" }, { g2g: "foobar" }] });
logger.info("message", { asd: { obj: 123, asd: { asd: "foobar" } } });
logger.access({ asd: { obj: 123, asd: { asd: "foobar" } } });
logger.error("message", new Error("foo"));