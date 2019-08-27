# Spreaker Node Logger

Pino-based Logger class that we use in all of Spreaker's nodeJS projects. 
It's possible to create 2 different instances of the logger:

- `Application Logger`: this is an instance of `Pino Logger`, initialized with `Spreaker's base options`, with a custom serializer that take care of stringify objects and array and transforming other types into string before log.
- `Access Logger`: this is an instance of `Pino Logger`, initialized with `Spreaker's base options`.


## Install package

`npm install @spreaker/logger`


## Usage

```js
const { createLogger } = require("@spreaker/logger");

// Create logger passing the logLevel and the initial properties. 
// Mandatory properties are: 
// - `type` (name of application is using the logger)
// - `context` (type of logger to create: "app" or "access")
const logger = createLogger({ type: "test", context: "app"});

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
{"level":30,"time":1566908680683,"type":"test","context":"app","object":"{\"b\":123}","string":"c","number":"321","array":"[\"a\",1,[\"subarray\"]]","message":"Stringify log","v":1}
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
    "Stringify log"
);
```
will produce a log like:
```
{"level":30,"time":1566908953080,"type":"test","context":"access","object":{"b":123},"string":"c","number":321,"array":["a",1,["subarray"]],"message":"Don't stringify log","v":1}
```

