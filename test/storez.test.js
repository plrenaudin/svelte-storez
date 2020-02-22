import { get } from "svelte/store";
import sut from "../src/storez";

describe("Set method unit test suite", () => {
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

  it("Should save the array value on set", () => {
    const store = sut([1, 2, 3, 4]);
    store.set([1, 2, 3]);
    expect(get(store)).toEqual([1, 2, 3]);
  });

  it("Should save the value on multiple stores", () => {
    const store1 = sut("coucou");
    const store2 = sut([1, 2, 3]);
    store1.set("coucouChanged");
    store2.set([3, 2, 1]);
    expect(get(store1)).toEqual("coucouChanged");
    expect(get(store2)).toEqual([3, 2, 1]);
  });
});
