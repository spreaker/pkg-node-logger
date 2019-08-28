const Jasmine = require("jasmine");
const jasmine = new Jasmine();

const onGlobalError = (e) => {
    console.log(e);
    process.exit(1);
};

process.on("uncaughtException", onGlobalError);
process.on("unhandledRejection", onGlobalError);

jasmine.loadConfigFile(__dirname + "/jasmine.json");

jasmine.execute();

