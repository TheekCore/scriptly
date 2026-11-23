import { describe, it, expect } from "vitest";
import { sortSubjects, filterSubjects } from "./subjectHelpers.js";

describe("Subject Sorting (sortSubjects)", () => {
  it("places favourite subjects before non-favourite subjects", () => {
    const list = [
      { id: "1", name: "Zebra Biology", is_favourite: false },
      { id: "2", name: "Algorithms", is_favourite: true },
    ];
    const sorted = sortSubjects(list);
    expect(sorted[0].name).toBe("Algorithms");
    expect(sorted[1].name).toBe("Zebra Biology");
  });

  it("sorts alphabetically when both subjects are favourites", () => {
    const list = [
      { id: "1", name: "Software Eng", is_favourite: true },
      { id: "2", name: "Algorithms", is_favourite: true },
      { id: "3", name: "Data Structures", is_favourite: true },
    ];
    const sorted = sortSubjects(list);
    expect(sorted.map((s) => s.name)).toEqual([
      "Algorithms",
      "Data Structures",
      "Software Eng",
    ]);
  });

  it("sorts alphabetically when neither subject is favourite", () => {
    const list = [
      { id: "1", name: "Physics", is_favourite: false },
      { id: "2", name: "Chemistry", is_favourite: false },
      { id: "3", name: "Biology", is_favourite: false },
    ];
    const sorted = sortSubjects(list);
    expect(sorted.map((s) => s.name)).toEqual([
      "Biology",
      "Chemistry",
      "Physics",
    ]);
  });

  it("handles case-insensitive alphabetical sorting", () => {
    const list = [
      { id: "1", name: "database systems", is_favourite: false },
      { id: "2", name: "Artificial Intelligence", is_favourite: false },
    ];
    const sorted = sortSubjects(list);
    expect(sorted[0].name).toBe("Artificial Intelligence");
    expect(sorted[1].name).toBe("database systems");
  });

  it("handles empty or single-item arrays without errors", () => {
    expect(sortSubjects([])).toEqual([]);
    expect(sortSubjects([{ name: "Math", is_favourite: false }])).toHaveLength(1);
  });
});

describe("Subject Filtering (filterSubjects)", () => {
  const subjects = [
    { id: "1", name: "Mathematics" },
    { id: "2", name: "Material Science" },
    { id: "3", name: "Computer Networks" },
  ];

  it("returns all subjects if query is empty or spaces", () => {
    expect(filterSubjects(subjects, "")).toEqual(subjects);
    expect(filterSubjects(subjects, "   ")).toEqual(subjects);
  });

  it("filters subjects matching query case-insensitively", () => {
    const result = filterSubjects(subjects, "mat");
    expect(result.map((s) => s.name)).toEqual([
      "Mathematics",
      "Material Science",
    ]);
  });

  it("returns empty array when no subjects match", () => {
    const result = filterSubjects(subjects, "history");
    expect(result).toEqual([]);
  });
});
