import { get } from "svelte/store";
import sut from "../src/storez";

describe("'Set' method unit test suite", () => {
  it("Should save the string value on set", () => {
    let current;
    const store = sut("intialValue");
    store.subscribe(newVal => (current = newVal));

    store.set("changed value");

    expect(current).toEqual("changed value");
  });

  it("Should save the object value on set", () => {
    let current;
    const store = sut({ name: "initial" });
    store.subscribe(newVal => (current = newVal));

    store.set({ name: "changed" });

    expect(current.name).toEqual("changed");
  });

  it("Should save the array value on set", () => {
    let current;
    const store = sut([1, 2, 3, 4]);
    store.subscribe(newVal => (current = newVal));

    store.set([1, 2, 3]);

    expect(current).toEqual([1, 2, 3]);
  });

  it("Should save the value on multiple stores", () => {
    let current;
    let current2;
    const store1 = sut("coucou");
    store1.subscribe(newVal => (current = newVal));
    const store2 = sut([1, 2, 3]);
    store2.subscribe(newVal => (current2 = newVal));

    store1.set("coucouChanged");
    store2.set([3, 2, 1]);

    expect(current).toEqual("coucouChanged");
    expect(current2).toEqual([3, 2, 1]);
  });
});

describe("'Update' method unit test suite", () => {
  it("Should save the string value on update", () => {
    let current;
    const store = sut("intialValue");
    store.subscribe(newVal => (current = newVal));

    store.update(n => n + "Changed");

    expect(current).toEqual("intialValueChanged");
  });

  it("Should save the object value on update", () => {
    let current;
    const store = sut({ name: "initial" });
    store.subscribe(newVal => (current = newVal));

    store.update(n => {
      n.name += "Changed";
      return n;
    });

    expect(current.name).toEqual("initialChanged");
  });

  it("Should save the array value on update", () => {
    const initial = [1, 2, 3];
    let current;
    const store = sut(initial);
    store.subscribe(newVal => (current = newVal));

    store.update(n => n.concat(4));

    expect(current).toEqual(initial.concat(4));
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
    const unsubscribe2 = store.subscribe(spy2);
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
    unsubscribe2();
  });
  it("should resubscribe the value store if subscriptions goes to 0 twice", () => {
    const store = sut("initialValue");
    const dispose = store.subscribe(() => {});
    let caught = false;

    dispose();

    const dispose2 = store.subscribe(() => {});
    try {
      dispose2();
    } catch (e) {
      caught = true;
    }
    expect(caught).toBe(false);
  });
  it("should not error out on double disposal", () => {
    const store = sut("initialValue");
    const dispose = store.subscribe(() => {});
    let caught = false;

    dispose();

    try {
      dispose();
    } catch (e) {
      console.log(e);
      caught = true;
    }
    expect(caught).toBe(false);
  });
  it("Debounces write operation", () => {
    jest.useFakeTimers();
    const store = sut("value", { debounce: 5000 });
    let current;
    const dispose = store.subscribe(value => (current = value));
    store.set("value ");
    store.set("value c");
    store.set("value cha");
    store.set("value chan");
    store.set("value chang");
    store.set("value change");
    store.set("value changed");
    expect(current).toEqual("value");

    jest.runAllTimers();
    expect(current).toEqual("value changed");
    dispose();
  });
  it("Should update the current value", () => {
    const store = sut("initialValue");

    expect(store.z.get()).toEqual("initialValue");

    store.set("changed value");

    expect(store.z.get()).toEqual("changed value");
  });
});

describe("Localstorage hoook unit test suite", () => {
  it("Reads from localstorage a string", () => {
    let current;
    localStorage.setItem("lsKey", "valueFromLS");
    const store = sut("fallback", { localstorage: { key: "lsKey" } });
    store.subscribe(newVal => (current = newVal));

    expect(current).toEqual("valueFromLS");
  });

  it("Reads from localstorage an object", () => {
    let current;
    localStorage.setItem("lsKey", JSON.stringify({ value: "test" }));
    const store = sut("fallback", { localstorage: { key: "lsKey" } });
    store.subscribe(newVal => (current = newVal));

    expect(current).toEqual({ value: "test" });
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

  it("Saves to localstorage at every disposal", () => {
    localStorage.clear();
    const store = sut("value", { localstorage: { key: "lsKey" } });

    expect(localStorage.getItem("lsKey")).toEqual("value");
    const dispose = store.subscribe(() => {});
    const dispose2 = store.subscribe(() => {});
    store.set("anotherVal");

    // Does not save to localstorage until store is disposed
    expect(localStorage.getItem("lsKey")).toEqual("value");
    dispose();

    expect(localStorage.getItem("lsKey")).toEqual("anotherVal");

    // Does update localstorage between every disposal
    store.set("lastVal");
    expect(localStorage.getItem("lsKey")).toEqual("anotherVal");
    dispose2();

    expect(localStorage.getItem("lsKey")).toEqual("lastVal");
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

  it("Undoes the last change", () => {
    let current;
    const store = sut("first", { history: true });
    store.subscribe(newVal => (current = newVal));

    store.set("coucou");
    store.z.undo();

    expect(current).toEqual("first");
  });

  it("Undoes until the initial value", () => {
    const store = sut("first", { history: true });
    let current;
    store.subscribe(newVal => (current = newVal));

    store.set("second");
    store.set("third");
    store.z.undo();
    store.z.undo();
    store.z.undo();

    expect(current).toEqual("first");
  });
});
describe("Debounce option", () => {
  it("Undoes the last string change with debounce", () => {
    jest.useFakeTimers();
    let current;
    const store = sut("first", { debounce: 200, history: true });
    store.subscribe(newVal => (current = newVal));

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
    expect(current).toEqual("second");
  });

  it("Undoes the last object change with debounce", () => {
    jest.useFakeTimers();
    let current;
    const store = sut({ name: "first" }, { history: true, debounce: 200 });
    store.subscribe(newVal => (current = newVal));

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

    expect(current.name).toEqual("second");
  });
});
