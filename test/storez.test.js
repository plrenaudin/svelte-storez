import { get } from "svelte/store";
import sut from "../src/storez";

describe("'Set' method unit test suite", () => {
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

describe("'Update' method unit test suite", () => {
  it("Should save the string value on update", () => {
    const store = sut("intialValue");
    store.update(n => n + "Changed");
    expect(get(store)).toEqual("intialValueChanged");
  });

  it("Should save the object value on update", () => {
    const store = sut({ name: "initial" });
    store.update(n => {
      n.name += "Changed";
      return n;
    });
    expect(get(store).name).toEqual("initialChanged");
  });

  it("Should save the array value on update", () => {
    const initial = [1, 2, 3];
    const store = sut(initial);
    store.update(n => n.concat(4));
    expect(get(store)).toEqual(initial.concat(4));
  });
});

describe("'Subscribe' method unit test suite", () => {
  it("Should call the subscription with old and new value on set", () => {
    const store = sut("initialValue");
    const spy = jest.fn();

    store.subscribe(spy);
    store.set("changedValue");

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[0][0]).toEqual("initialValue");
    expect(spy.mock.calls[0][1]).not.toBeDefined();
    expect(spy.mock.calls[1][0]).toEqual("changedValue");
    expect(spy.mock.calls[1][1]).toEqual("initialValue");
  });

  it("Should call the subscription with old and new value on update", () => {
    const store = sut("initialValue");
    const spy = jest.fn();

    store.subscribe(spy);
    store.update(n => n + "Changed");

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[0][0]).toEqual("initialValue");
    expect(spy.mock.calls[0][1]).not.toBeDefined();
    expect(spy.mock.calls[1][0]).toEqual("initialValueChanged");
    expect(spy.mock.calls[1][1]).toEqual("initialValue");
  });

  it("Should work with objects", () => {
    const store = sut({ name: "initial" });
    const spy = jest.fn();

    store.subscribe(spy);
    store.set({ name: "changed" });

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[0][0]).toEqual({ name: "initial" });
    expect(spy.mock.calls[0][1]).not.toBeDefined();
    expect(spy.mock.calls[1][0]).toEqual({ name: "changed" });
    expect(spy.mock.calls[1][1]).toEqual({ name: "initial" });
  });

  it("Should work with arrays", () => {
    const initial = [1, 2, 3];
    const changed = [3, 2, 1];
    const store = sut(initial);
    const spy = jest.fn();

    store.subscribe(spy);
    store.set(changed);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[0][0]).toEqual(initial);
    expect(spy.mock.calls[0][1]).not.toBeDefined();
    expect(spy.mock.calls[1][0]).toEqual(changed);
    expect(spy.mock.calls[1][1]).toEqual(initial);
  });

  it("Should unsubscribe correctly", () => {
    const store = sut("initialValue");
    const spy = jest.fn();

    const unsubscribe = store.subscribe(spy);
    store.set("changedValue");
    unsubscribe();
    store.set("changedAgainValue");

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("Should work with start/stop function", () => {
    const stop = jest.fn();
    const start = jest.fn(() => {
      return stop;
    });
    const store = sut("initialValue", start);
    const subscription = store.subscribe(() => {});
    expect(start).toHaveBeenCalledTimes(1);
    expect(stop).toHaveBeenCalledTimes(0);
    subscription();
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it("Should work with multiple subscriptions", () => {
    const store = sut("initialValue");
    const spy1 = jest.fn();
    const spy2 = jest.fn();

    const unsubscribe1 = store.subscribe(spy1);
    store.subscribe(spy2);
    store.set("changed");
    unsubscribe1();
    store.set("changedAgainValue");
    expect(spy1.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "initialValue",
        ],
        Array [
          "changed",
          "initialValue",
        ],
      ]
    `);
    expect(spy2.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "initialValue",
        ],
        Array [
          "changed",
          "initialValue",
        ],
        Array [
          "changedAgainValue",
          "changed",
        ],
      ]
    `);
  });
});

describe("Localstorage hoook unit test suite", () => {
  it("Reads from localstorage a string", () => {
    localStorage.setItem("lsKey", "valueFromLS");
    const store = sut("fallback", { localstorage: { key: "lsKey" } });
    expect(get(store)).toEqual("valueFromLS");
  });

  it("Reads from localstorage an object", () => {
    localStorage.setItem("lsKey", JSON.stringify({ value: "test" }));
    const store = sut("fallback", { localstorage: { key: "lsKey" } });
    expect(get(store)).toEqual({ value: "test" });
  });

  it("Saves to localstorage as a string", () => {
    localStorage.clear();
    const store = sut("value", { localstorage: { key: "lsKey" } });

    expect(localStorage.getItem("lsKey")).toEqual("value");
    const dispose = store.subscribe(() => {});
    store.set("anotherVal");
    // Does not save to localstorage until store is disposed
    expect(localStorage.getItem("lsKey")).toEqual("value");
    dispose();

    expect(localStorage.getItem("lsKey")).toEqual("anotherVal");
  });

  it("Saves to localstorage as an object", () => {
    localStorage.clear();
    const store = sut({ name: "value" }, { localstorage: { key: "lsKey" } });

    expect(localStorage.getItem("lsKey")).toEqual(
      JSON.stringify({ name: "value" })
    );
    const dispose = store.subscribe(() => {});
    store.set({ name: "anotherVal" });
    // Does not save to localstorage until store is disposed
    expect(localStorage.getItem("lsKey")).toEqual(
      JSON.stringify({ name: "value" })
    );
    dispose();

    expect(localStorage.getItem("lsKey")).toEqual(
      JSON.stringify({ name: "anotherVal" })
    );
  });
});

describe("History hook unit test suite", () => {
  it("Has a single item in history upon store creation", () => {
    const store = sut("first", { history: true });

    expect(get(store.z.history)).toEqual(["first"]);
  });

  it("Keeps changes in history", () => {
    const store = sut("first", { history: { size: 3 } });

    store.set("second");
    store.set("third");

    expect(get(store.z.history)).toEqual(["first", "second", "third"]);
  });

  it("Keeps the history size under limit", () => {
    const store = sut("first", { history: { size: 3 } });

    store.set("second");
    store.set("third");
    store.set("fourth");

    expect(get(store.z.history)).toEqual(["second", "third", "fourth"]);
  });

  it("Debounces write operation", () => {
    jest.useFakeTimers();
    const store = sut("value", { history: { size: 3, debounce: 5000 } });

    store.set("value ");
    store.set("value c");
    store.set("value cha");
    store.set("value chan");
    store.set("value chang");
    store.set("value change");
    store.set("value changed");
    jest.runAllTimers();

    expect(get(store.z.history)).toEqual(["value changed"]);
  });

  it("Undoes the last change", () => {
    const store = sut("first", { history: true });

    store.set("coucou");
    store.z.undo();

    expect(get(store)).toEqual("first");
  });

  it("Undoes until the initial value", () => {
    const store = sut("first", { history: true });

    store.set("second");
    store.set("third");
    store.z.undo();
    store.z.undo();
    store.z.undo();

    expect(get(store)).toEqual("first");
  });

  it("Undoes the last string change with debounce", () => {
    jest.useFakeTimers();

    const store = sut("first", { history: { debounce: 200 } });

    store.set("second");
    jest.runAllTimers();
    store.set("third");
    jest.runAllTimers();
    store.set("coucou");
    jest.runAllTimers();
    store.z.undo();
    jest.runAllTimers();
    store.z.undo();
    jest.runAllTimers();
    expect(get(store)).toEqual("second");
  });
  it("Undoes the last object change with debounce", () => {
    jest.useFakeTimers();

    const store = sut({ name: "first" }, { history: { debounce: 200 } });

    store.set({ name: "second" });
    jest.runAllTimers();
    store.set({ name: "third" });
    jest.runAllTimers();
    store.set({ name: "coucou" });
    jest.runAllTimers();
    store.z.undo();
    jest.runAllTimers();
    store.z.undo();
    jest.runAllTimers();

    expect(get(store).name).toEqual("second");
  });
});

describe("Rest hook unit test suite", () => {
  it("Gets the content with params", async () => {
    const fetchImpl = jest.fn(() => ({ json: () => [1, 2, 3] }));
    const store = sut([], { rest: { endpoint: "/api/users", fetchImpl } });

    await store.z.load({ name: "test" });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0][0]).toEqual("/api/users?name=test");
    expect(get(store)).toEqual([1, 2, 3]);
  });

  it("Gets the content without params", async () => {
    const fetchImpl = jest.fn(() => ({ json: () => [1, 2, 3] }));
    const store = sut([], { rest: { endpoint: "/api/users", fetchImpl } });

    await store.z.load();

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0][0]).toEqual("/api/users");
    expect(get(store)).toEqual([1, 2, 3]);
  });

  xit("Calls the post method for a new object", () => {
    const fetchImpl = jest.fn(() => ({ json: () => [1, 2, 3] }));

    const store = sut([{ name: "test" }], {
      rest: { endpoint: "/api/users", fetchImpl }
    });

    store.update(n => n.concat({ name: "test2" }));

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
