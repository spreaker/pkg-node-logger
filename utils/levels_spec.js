const { getLevelAsString } = require("./levels");

describe("getLevelAsString", () => {
    it("should return the loglevel string that match the level", () => {
        expect(getLevelAsString(10)).toBe("DEBUG");
        expect(getLevelAsString(20)).toBe("DEBUG");
        expect(getLevelAsString(30)).toBe("INFO");
        expect(getLevelAsString(40)).toBe("WARN");
        expect(getLevelAsString(50)).toBe("ERROR");
        expect(getLevelAsString(60)).toBe("FATAL");
    });
    it("should return the loglevel string that match the level, also if level is a string", () => {
        expect(getLevelAsString("10")).toBe("DEBUG");
        expect(getLevelAsString("20")).toBe("DEBUG");
        expect(getLevelAsString("30")).toBe("INFO");
        expect(getLevelAsString("40")).toBe("WARN");
        expect(getLevelAsString("50")).toBe("ERROR");
        expect(getLevelAsString("60")).toBe("FATAL");
    });
    it("should return null if there is no match", () => {
        expect(getLevelAsString()).toBe(null);
        expect(getLevelAsString("0")).toBe(null);
        expect(getLevelAsString(100)).toBe(null);
        expect(getLevelAsString(null)).toBe(null);
        expect(getLevelAsString(NaN)).toBe(null);
    });
});