import { writable } from "svelte/store";

const storez = val => {
  let oldValue;
  let currentValue;
  const subscriptions = [];

  const valueStore = writable(val);

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
