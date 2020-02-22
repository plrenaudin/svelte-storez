import { get } from "svelte/store";
import sut from "../src/storez";

describe("Storez unit test suite", () => {
  it("Should save the string value on set", () => {
    const store = sut("intialValue");
    store.set("changed value");
    expect(get(store)).toEqual("changed value");
  });
  it("Should save the object value on set", () => {
    const store = sut({ name: "initial" });
    store.set({ name: "changed" });
    expect(get(store).name).toEqual("changed");
  });
});
