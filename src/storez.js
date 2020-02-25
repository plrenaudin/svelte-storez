import { writable } from "svelte/store";
import { readLocalStorage, localStorageSerializer } from "./utils";

/**
 * Svelte compatible store type
 * @typedef {Object} SvelteCompatibleStore
 * @property {function} subscribe Subscription function
 * @property {function} set Set function
 * @property {function} update Update function
 *
 * @typedef {Object} Options
 * @property {LocalStorageOptions} localstorage localstorage options
 *
 * @typedef {Object} LocalStorageOptions
 * @property {string} key Key used for the local storage
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
  let currentValue;
  const subscriptions = [];

  let initialValue = val;

  if (options.localstorage) {
    initialValue = readLocalStorage(options.localstorage.key);
    if (!initialValue) {
      localStorage.setItem(
        options.localstorage.key,
        localStorageSerializer.to(val)
      );
    }
  }

  const valueStore = writable(initialValue, start);

  const dispose = valueStore.subscribe(newVal => {
    oldValue = currentValue;
    currentValue = newVal;
  });

  return {
    subscribe: subscriptionFn => {
      subscriptions.push(subscriptionFn);
      subscriptionFn(currentValue);
      return () => {
        const index = subscriptions.indexOf(subscriptionFn);
        if (index !== -1) {
          subscriptions.splice(index, 1);
        }
        if (subscriptions.length === 0) {
          if (options.localstorage) {
            localStorage.setItem(
              options.localstorage.key,
              localStorageSerializer.to(currentValue)
            );
          }
          dispose();
        }
      };
    },

    set: newVal => {
      valueStore.set(newVal);
      subscriptions.forEach(sub => sub(currentValue, oldValue));
    },

    update: fn => {
      valueStore.set(fn(currentValue));
      subscriptions.forEach(sub => sub(currentValue, oldValue));
    }
  };
};

export default storez;
