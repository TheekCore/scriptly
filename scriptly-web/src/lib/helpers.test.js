import { describe, it, expect } from "vitest";
import { calculateTargetDimensions } from "./imageResize.js";
import { getTodayDateString, formatDisplayDate, getWeekdayNumber } from "./dateHelpers.js";

describe("Image Resize Dimensions (calculateTargetDimensions)", () => {
  it("does not shrink images smaller than 1600px", () => {
    const dims = calculateTargetDimensions(1200, 800, 1600);
    expect(dims).toEqual({ width: 1200, height: 800 });
  });

  it("scales down landscape images so width equals 1600px preserving ratio", () => {
    // 3200 x 1600 (2:1 aspect ratio) -> 1600 x 800
    const dims = calculateTargetDimensions(3200, 1600, 1600);
    expect(dims).toEqual({ width: 1600, height: 800 });
  });

  it("scales down portrait images so height equals 1600px preserving ratio", () => {
    // 2000 x 4000 (1:2 aspect ratio) -> 800 x 1600
    const dims = calculateTargetDimensions(2000, 4000, 1600);
    expect(dims).toEqual({ width: 800, height: 1600 });
  });

  it("scales down square images equally", () => {
    const dims = calculateTargetDimensions(2400, 2400, 1600);
    expect(dims).toEqual({ width: 1600, height: 1600 });
  });

  it("handles edge cases gracefully with positive defaults", () => {
    expect(calculateTargetDimensions(0, 0, 1600)).toEqual({ width: 1600, height: 1600 });
    expect(calculateTargetDimensions(-10, 50, 1600)).toEqual({ width: 1600, height: 1600 });
  });
});

describe("Date Helpers (dateHelpers)", () => {
  it("returns YYYY-MM-DD format for getTodayDateString", () => {
    const testDate = new Date(2026, 10, 24); // Nov 24, 2026 (month index 10 = Nov)
    expect(getTodayDateString(testDate)).toBe("2026-11-24");
  });

  it("formats display dates nicely with formatDisplayDate", () => {
    expect(formatDisplayDate("2026-11-24")).toBe("Nov 24, 2026");
  });

  it("calculates weekday index where Monday is 0 and Sunday is 6", () => {
    // 2026-11-23 is Monday -> should be 0
    const monday = new Date("2026-11-23T12:00:00Z");
    expect(getWeekdayNumber(monday)).toBe(0);

    // 2026-11-29 is Sunday -> should be 6
    const sunday = new Date("2026-11-29T12:00:00Z");
    expect(getWeekdayNumber(sunday)).toBe(6);

    // 2026-11-27 is Friday -> should be 4
    const friday = new Date("2026-11-27T12:00:00Z");
    expect(getWeekdayNumber(friday)).toBe(4);
  });
});
