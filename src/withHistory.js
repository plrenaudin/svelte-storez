import { writable, derived } from "svelte/store";

const historyHook = ({ history: { size = 50 } }) => {
  const history = writable([]);
  const readableHistory = derived(history, $history => $history);
  return {
    onNewVal: value => {
      history.update(n => {
        while (n.length >= size) {
          n.shift();
        }
        return n.concat(value);
      });
    },
    exports: {
      history: readableHistory
    }
  };
};

export default historyHook;
