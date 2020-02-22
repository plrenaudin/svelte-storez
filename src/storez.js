import { writable } from "svelte/store";

let oldValue;
let currentValue;
const subscriptions = [];

const storez = val => {
  const valueStore = writable(val);
  const dispose = valueStore.subscribe(newVal => {
    oldValue = currentValue;
    currentValue = newVal;
  });

  return {
    subscribe: subscriptionFn => {
      console.log("subscribing");
      subscriptions.push(subscriptionFn);
      subscriptionFn(currentValue);
      return () => {
        console.log("unsubscribing");
        dispose();
        subscriptions.splice(subscriptions.indexOf(subscriptionFn), 1);
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
