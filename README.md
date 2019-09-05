# Spreaker Node Logger

Pino-based Logger that we use in all of Spreaker's nodeJS projects. 
It's possible to create 2 different instances of the logger:

- `Application Logger`: this is an instance of `Pino Logger`, initialized with `Spreaker's base options`, with a custom serializer that take care of stringify objects and array and transforming other types into string before log.
- `Access Logger`: this is an instance of `Pino Logger`, initialized with `Spreaker's base options`.

Both the loggers provide 2 common functions:
- Add `loglevel` field to each log to have a string version of the log level
- Errors serializer that take care of set the correct error fields in the logs


## Install package

`npm install @spreaker/logger`


## Usage

```js
const { createLogger } = require("@spreaker/logger");

// Create logger passing the initial properties and the logLevel. 
// Mandatory properties are: 
// - `type` (name of application is using the logger)
// - `context` (type of logger to create: "app" or "access")
// Minimum level of log enabled; if not passed is "info".
const logger = createLogger({ type: "test", context: "app"}, "info");

// Use the logger as a simple `Pino` child instance.
logger.info({a: "b", c: 123}, "Message to log");
```

## Logger types

### Application logger
Create logger passing the property `context: "app"` if you want to create an `Application Logger`.
```js
const { createLogger } = require("@spreaker/logger");
const logger = createLogger({ type: "test", context: "app"});
```

This instance has a custom serializer that that take care of stringify objects and array and transforming other types into string before log.
```js
logger.info(
    {"object":{"b":123},"string":"c","number":321,"array":["a",1,["subarray"]]}, 
    "Stringify log"
);
```
will produce a log like:
```
{"level":30,"time":1566908680683,"type":"test","context":"app","object":"{\"b\":123}","string":"c","number":"321","array":"[\"a\",1,[\"subarray\"]]","message":"Stringify log","loglevel":"INFO","v":1}
```

### Access logger
Create logger passing the property `context: "access"` if you want to create an `Access Logger`.
```js
const { createLogger } = require("@spreaker/logger");
const logger = createLogger({ type: "test", context: "access"});
```

This instance is a normal `Pino` child instance, initialized with `Spreaker's base options`.
```js
logger.info(
    {"object":{"b":123},"string":"c","number":321,"array":["a",1,["subarray"]]}, 
    "Don't stringify log"
);
```
will produce a log like:
```
{"level":30,"time":1566908953080,"type":"test","context":"access","object":{"b":123},"string":"c","number":321,"array":["a",1,["subarray"]],"message":"Don't stringify log","loglevel":"INFO","v":1}
```

## Errors serializer
When you pass an error to the logger the possible scenarios are:

- the Error is passed as `mergingObject` (first param) and the log has already a `message` (second param). In this case the logger add fields `"error_message": Error.message` and `"error_stack": Error.stack` to the `mergingObject` and the log message is printed in the `message` field
```js
logger.error(new Error("This is an error"), "Error with log message");
```
will produce a log like:
```
{"level":50,"time":1567688722065,"type":"test","context":"app","error_message":"This is an error","error_stack":"Error: This is an error...","loglevel":"ERROR","message":"Error with log message","v":1}
```

- the Error is passed as `mergingObject` (first param) and the log has not a `message` (second param). In this case the logger add field `"error_stack": Error.stack` to the `mergingObject` and use the `Error.message` as log `message`
```js
logger.error(new Error("Error without log message");
```
will produce a log like:
```
{"level":50,"time":1567688853208,"type":"test","context":"app","error_stack":"Error: Error without log message...","loglevel":"ERROR","message":"Error without log message","v":1}
```


- the Error is passed as log `message` (second param). In this case the logger add field `"error_stack": Error.stack` to the mergingObject and use the `Error.message` as log `message`
```js
logger.error({ "a": "b" }, new Error("Error as log message"));
```
will produce a log like:
```
"level":50,"time":1567689070052,"type":"test","context":"app","a":"b","error_stack":"Error: Error as log message...","loglevel":"ERROR","message":"Error as log message","v":1}
```
