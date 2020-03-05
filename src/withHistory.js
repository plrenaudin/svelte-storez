import { writable, derived } from "svelte/store";

const historyHook = ({ history: { size = 50 } }) => {
  const history = writable([]);
  let store;
  let undoing;

  const readableHistory = derived(history, $history => $history);

  const undo = () => {
    history.update(n => {
      if (n.length <= 1) {
        return n;
      }
      n.pop();
      const newValue = n[n.length - 1];
      undoing = { value: newValue };
      store.set(newValue);
      return n;
    });
  };

  const onStoreInit = storeInitialized => (store = storeInitialized);
  const onNewVal = value => {
    //if there is an undo, the store.set will triger subscriber so we need to skip history for the value
    if (undoing && undoing.value === value) {
      undoing = false;
      return;
    }
    history.update(n => {
      while (n.length >= size) {
        n.shift();
      }
      return n.concat(value);
    });
  };

  return {
    onStoreInit,
    onNewVal,
    exports: {
      history: readableHistory,
      undo
    }
  };
};

export default historyHook;
