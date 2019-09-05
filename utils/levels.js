const getLevelAsString = (levels, level) => {
    return levels && levels.labels[level] ? levels.labels[level].toUpperCase() : null;
};

module.exports = {
    getLevelAsString
};