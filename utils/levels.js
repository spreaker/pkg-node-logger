const LEVELS = {
    "10": "DEBUG",
    "20": "DEBUG",
    "30": "INFO",
    "40": "WARN",
    "50": "ERROR",
    "60": "FATAL"
};

const getLevelAsString = (level) => {
    return LEVELS[level] ? LEVELS[level] : null;
};

module.exports = {
    getLevelAsString
};