import { writable, derived } from "svelte/store";

const historyHook = ({ history: { size = 50 } }) => {
  const history = writable([]);
  const redoStack = writable([]);
  let undoing;
  let setter;

  const readableHistory = derived(history, ($history) => $history);

  const onStoreInit = (valueStoreSetter) => (setter = valueStoreSetter);
  const undo = () => {
    history.update((n) => {
      if (n.length <= 1) {
        return n;
      }
      redoStack.update((redos) => {
        redos = [...redos, n.pop()];
        const newValue = n[n.length - 1];
        undoing = { value: newValue };
        setter(newValue);
        return redos;
      });

      return n;
    });
  };

  const redo = () => {
    redoStack.update((redos) => {
      if (redos.length <= 0) {
        return redos;
      }
      history.update((undos) => {
        undos = [...undos, redos.pop()];
        const newValue = undos[undos.length - 1];
        undoing = { value: newValue };
        setter(newValue);
        return undos;
      });

      return redos;
    });
  };

  const onNewVal = (value) => {
    //if there is an undo, the store.set will triger subscriber so we need to
    //skip history for the value

    value = JSON.parse(JSON.stringify(value));

    if (undoing && JSON.stringify(undoing.value) === JSON.stringify(value)) {
      undoing = false;
      return;
    }
    redoStack.set([]);
    history.update((n) => {
      while (n.length >= size) {
        n.shift();
      }
      return n.concat(value);
    });
  };

  return {
    onNewVal,
    onStoreInit,
    exports: {
      history: readableHistory,
      undo,
      redo,
    },
  };
};

export default historyHook;
