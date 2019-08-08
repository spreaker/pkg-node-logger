# Spreaker Node Logger

Pino-based Logger class that we use in all of Spreaker's nodeJS projects.


## Install package

`npm install @spreaker/logger`


## Usage

```js
const Logger = require("@spreaker/logger");

// Create logger with some context that will be used in all messages.
var logger = new Logger("info", { type: "myservice" });

// Property prop will also be added to this one logged message.
logger.info("Log this", { prop: "value" });

// You'll get props error_message & error_stack
logger.error("Something happened", new Error("Explanation"));

// objProp will be automatically JSON.stringified before being logged
logger.info("Log this", { objProp: { key: "value" } });
```