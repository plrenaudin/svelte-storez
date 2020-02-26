import { writable } from "svelte/store";

const historyHook = ({ history: { size = 50 } }) => {
  const history = writable([]);

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
      history
    }
  };
};

export default historyHook;
