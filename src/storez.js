import { writable } from "svelte/store";
import localstorageHook from "./withLocalstorage";
import historyHook from "./withHistory";
import { debounce } from "./utils";

/**
 * Svelte compatible store type
 * @typedef {Object} SvelteCompatibleStore
 * @property {function} subscribe Subscription function
 * @property {function} set Set function
 * @property {function} update Update function
 * @property {StorezExtra} z Storez extra
 *
 * @typedef {Object} StorezExtra
 * @property {SvelteDerivedStore} history Returns history of the past values of the store
 * @property {Number} debounce Interval in ms between 2 stores updates
 * @property {() => any} get Get current value (not reactive)
 *
 * @typedef {Object} Options
 * @property {LocalStorageOptions} localstorage Localstorage options
 * @property {HistoryOptions} history History options
 *
 * @typedef {Object} LocalStorageOptions
 * @property {String} key Key used for the local storage
 *
 * @typedef {Object} HistoryOptions
 * @property {Number} [size=50] Number of mutations to keep in history
 *
 * @typedef {(val: any) => SvelteCompatibleStore} Simple
 * @typedef {(val: any, start:function) => SvelteCompatibleStore} Compatible
 * @typedef {(val: any, options:Options) => SvelteCompatibleStore} SimpleExtended
 * @typedef {(val: any, start:function, options: Options) => SvelteCompatibleStore} CompatibleExtended
 *
 * @typedef {Simple & Compatible & SimpleExtended & CompatibleExtended} MethodArgument
 */

/**
 * Create a Svelte writable store on steroids
 * @type {MethodArgument}
 */
const storez = (...args) => {
  const val = args[0];

  let start = () => {};
  let options = {};

  if (args.length > 1) {
    if (typeof args[1] === "function") {
      start = args[1];
      if (args.length > 2) {
        options = args[2];
      }
    } else {
      options = args[1];
    }
  }

  return storezImpl(val, start, options);
};

const storezImpl = (val, start, options) => {
  let oldValue;
  let currentValue = val;
  let dispose;
  let subscribedToValueStore = false;
  const subscriptions = [];

  const hooks = [
    options.localstorage && localstorageHook(options),
    options.history && historyHook(options),
  ].filter(Boolean);

  const runHooks = (fnName, ...args) =>
    hooks.forEach((hook) => hook[fnName] && hook[fnName](...args));
  const processHooks = (fnName, ...args) =>
    hooks.reduce((acc, cur) => (cur[fnName] ? cur[fnName](acc) : acc), ...args);

  let initialValue = processHooks("onInit", val);

  const valueStore = writable(initialValue, start);

  const setter = (newVal) => {
    valueStore.set(newVal);
    subscriptions.forEach((sub) => sub(currentValue, oldValue));
  };

  const updater = (fn) => {
    setter(fn(currentValue));
  };

  const subscribeValueStore = () => {
    subscribedToValueStore = true;
    return valueStore.subscribe((newVal) => {
      oldValue = JSON.parse(JSON.stringify(currentValue));
      currentValue = JSON.parse(JSON.stringify(newVal));
      runHooks("onNewVal", newVal, oldValue);
    });
  };

  runHooks("onStoreInit", setter);

  dispose = subscribeValueStore();

  const z = hooks.reduce(
    (acc, cur) => (cur.exports ? Object.assign(acc, cur.exports) : acc),
    { get: () => currentValue }
  );

  return {
    subscribe: (subscriptionFn) => {
      if (!subscriptions.length && !subscribedToValueStore) {
        dispose = subscribeValueStore();
      }
      subscriptions.push(subscriptionFn);
      subscriptionFn(currentValue);
      return () => {
        const index = subscriptions.indexOf(subscriptionFn);
        if (index !== -1) {
          subscriptions.splice(index, 1);
        }
        runHooks("onDispose", currentValue);
        if (subscriptions.length === 0 && subscribedToValueStore) {
          //dispose
          dispose();
          subscribedToValueStore = false;
        }
      };
    },

    set: options.debounce > 0 ? debounce(setter, options.debounce) : setter,

    update:
      options.debounce > 0 ? debounce(updater, options.debounce) : updater,
    z,
  };
};

export default storez;
