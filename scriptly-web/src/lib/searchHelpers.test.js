import { describe, it, expect } from "vitest";
import { buildSearchText, filterNotesByKeyword } from "./searchHelpers.js";

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

describe("filterNotesByKeyword Helper", () => {
  const sampleNotes = [
    {
      id: "1",
      title: "Relational Databases",
      search_text: "relational databases sql joins indexing b-trees postgresql",
      subjects: { name: "Database Systems" },
    },
    {
      id: "2",
      title: "Software Engineering Methodologies",
      search_text: "software engineering agile scrum waterfall sprint planning testing",
      subjects: { name: "Software Engineering" },
    },
    {
      id: "3",
      title: "Graph Algorithms",
      search_text: "graph algorithms dijkstra shortest path bfs dfs trees",
      subjects: { name: "Algorithms" },
    },
  ];

  it("returns all notes when query is empty", () => {
    expect(filterNotesByKeyword(sampleNotes, "")).toEqual(sampleNotes);
    expect(filterNotesByKeyword(sampleNotes, "   ")).toEqual(sampleNotes);
  });

  it("finds matching note by single keyword", () => {
    const results = filterNotesByKeyword(sampleNotes, "dijkstra");
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe("Graph Algorithms");
  });

  it("finds matching note by multiple keywords (AND logic)", () => {
    const results = filterNotesByKeyword(sampleNotes, "agile testing");
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe("Software Engineering Methodologies");
  });

  it("finds notes by matching subject name", () => {
    const results = filterNotesByKeyword(sampleNotes, "Database Systems");
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe("Relational Databases");
  });

  it("returns empty array when no notes match", () => {
    const results = filterNotesByKeyword(sampleNotes, "quantum physics");
    expect(results).toEqual([]);
  });
});
