import { get } from "svelte/store";
import sut from "../src/storez";

describe("Storez unit test suite", () => {
  it("Should save the value on set", () => {
    const store = sut("intialValue");
    store.set("changed value");
    expect(get(store)).toEqual("changed value");
  });
});
