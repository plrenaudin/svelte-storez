import { diff as sut } from "../src/utils";

describe("Diff utility unit test suite", () => {
  it("returns nothing if same object", () => {
    const test = { name: "test" };
    expect(sut(test, test)).toEqual({
      post: [],
      put: [],
      del: []
    });
  });
  it("returns nothing if identical object", () => {
    const test = { class: 1, name: "test", sub: { one: 1 } };
    const test2 = { name: "test", class: 1, sub: { one: 1 } };
    expect(sut(test, test2)).toEqual({
      post: [],
      put: [],
      del: []
    });
  });
  it("returns delete if new value is null", () => {
    const test = { name: "test" };
    const test2 = null;
    expect(sut(test, test2)).toEqual({
      post: [],
      put: [],
      del: [{ name: "test" }]
    });
  });
  it("returns post if old value is null and new is not", () => {
    const test = { name: "test" };
    const test2 = null;
    expect(sut(test, test2)).toEqual({
      post: [],
      put: [],
      del: [{ name: "test" }]
    });
  });
  it("returns a put if it is a different object", () => {
    const test = { name: "test" };
    const test2 = { name: "test2" };
    expect(sut(test, test2)).toEqual({
      post: [],
      put: [{ name: "test2" }],
      del: []
    });
  });
  it("returns post for each new items in an array", () => {
    const test = [
      { id: 1, name: "plop" },
      { id: 2, name: "test" }
    ];
    const test2 = [
      { id: 2, name: "test" },
      { id: 1, name: "plop" },
      { name: "test2" },
      { name: "another" }
    ];
    expect(sut(test, test2)).toEqual({
      post: [{ name: "test2" }, { name: "another" }],
      put: [],
      del: []
    });
  });
  it("returns delete for each items in an array that are not on the old array", () => {
    const test = [
      { id: 1, name: "plop" },
      { id: 2, name: "test" },
      { id: 3, name: "another" }
    ];
    const test2 = [{ id: 2, name: "test" }];
    expect(sut(test, test2)).toEqual({
      post: [],
      put: [],
      del: [1, 3]
    });
  });
  it("returns put for each items in an array that are different in the old array", () => {
    const test = [
      { id: 1, name: "plop" },
      { id: 2, name: "test" },
      { id: 3, name: "another" }
    ];
    const test2 = [
      { id: 1, name: "plop" },
      { id: 2, name: "test2" },
      { id: 3, name: "another2" }
    ];
    expect(sut(test, test2)).toEqual({
      post: [],
      put: [
        { id: 2, name: "test2" },
        { id: 3, name: "another2" }
      ],
      del: []
    });
  });
  it("can follow all modification in one commit", () => {
    const test = [
      { id: 1, name: "leave it", sub: { content: "change" } },
      { id: 2, name: "to delete" },
      { id: 3, name: "another", sub: { content: "leave it" } },
      { id: 4, name: "changesub", sub: { content: "original" } },
      { id: 5, name: "changeit", sub: { content: "stay" } },
      { id: 6, name: "changeit", sub: { content: "both" } },
      { id: 7, name: "anotherDelete", sub: { content: "something" } }
    ];
    const test2 = [
      { id: 1, name: "leave it", sub: { content: "changed" } },
      { id: 3, name: "another", sub: { content: "leave it" } },
      { id: 4, name: "changesub", sub: { content: "newVal" } },
      { name: "new1", sub: { content: "newContent" } },
      { id: 5, name: "changedName", sub: { content: "stay" } },
      { id: 6, name: "changeAgain", sub: { content: "bothChanged" } },
      { name: "new2" }
    ];
    expect(sut(test, test2)).toEqual({
      post: [
        { name: "new1", sub: { content: "newContent" } },
        { name: "new2" }
      ],
      put: [
        { id: 1, name: "leave it", sub: { content: "changed" } },
        { id: 4, name: "changesub", sub: { content: "newVal" } },
        { id: 5, name: "changedName", sub: { content: "stay" } },
        { id: 6, name: "changeAgain", sub: { content: "bothChanged" } }
      ],
      del: [2, 7]
    });
  });
});
