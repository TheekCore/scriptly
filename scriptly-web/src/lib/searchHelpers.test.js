import { describe, it, expect } from "vitest";
import { buildSearchText } from "./searchHelpers.js";

describe("buildSearchText Helper", () => {
  it("combines title, summary, headings, and points in lowercase separated by spaces", () => {
    const title = "Software Testing";
    const summary = "Overview of unit and integration tests.";
    const sections = [
      {
        heading: "Unit Testing",
        points: [
          { text: "Tests small isolated functions.", ai_added: false },
          { text: "Uses mocks and stubs.", ai_added: true },
        ],
      },
      {
        heading: "Integration Testing",
        points: [
          { text: "Verifies interaction between modules.", ai_added: false },
        ],
      },
    ];

    const result = buildSearchText(title, summary, sections);

    expect(result).toBe(
      "software testing overview of unit and integration tests. unit testing integration testing tests small isolated functions. uses mocks and stubs. verifies interaction between modules."
    );
  });

  it("handles empty or missing parameters without throwing errors", () => {
    expect(buildSearchText("", "", [])).toBe("");
    expect(buildSearchText(null, undefined, null)).toBe("");
  });

  it("normalizes multiple whitespace characters into single spaces", () => {
    const title = "  Database   Systems  ";
    const summary = "SQL    queries \n and indexing.";
    const sections = [
      {
        heading: "B-Trees",
        points: [{ text: "Balanced   search   tree." }],
      },
    ];

    const result = buildSearchText(title, summary, sections);
    expect(result).toBe(
      "database systems sql queries and indexing. b-trees balanced search tree."
    );
  });
});
