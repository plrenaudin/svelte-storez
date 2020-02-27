import { writable, derived } from "svelte/store";
import { debounce } from "./utils";

const historyHook = ({ history: { size = 50, debounce: timeout } }) => {
  const history = writable([]);
  let store;
  let intialized = false;
  let undoing;

  if (timeout > 0) {
    history.update = debounce(history.update, timeout);
  }

  const readableHistory = derived(history, $history => $history);

  const undo = () => {
    history.update(n => {
      n.pop();
      const newValue = n[n.length - 1];
      undoing = newValue;
      store.set(newValue);
      return n;
    });
  };

  return {
    onStoreInit: storeInitialized => (store = storeInitialized),
    onNewVal: value => {
      //if there is an undo, the store.set will triger subscriber so we need to skip history for the value
      if (undoing && undoing === value) {
        undoing = false;
        return;
      }
      // initial value set directly to avoid debouncing
      if (!intialized) {
        history.set([value]);
        intialized = true;
      } else {
        history.update(n => {
          while (n.length >= size) {
            n.shift();
          }
          return n.concat(value);
        });
      }
    },
    exports: {
      history: readableHistory,
      undo
    }
  };
};

export default historyHook;
