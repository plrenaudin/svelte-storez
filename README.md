# svelte-storez

## Svelte writable store with extra feature

- Fully compatible with svelte writable store
- Subscriber function receives the new and the old value
- Read and persist value to localstorage
- Keep previous values in history (easy undo/redo coming soon...)

## Usage example

### Basic example

```js
import storez from "svelte-storez";

const myStore = storez("my value");

const dispose = myStore.subscribe((newVal, oldVal) => {
  console.log(`'${oldVal}' has been changed to '${mewVal}'`);
});

myStore.set("changed value"); // console output: 'my value' has been changed to 'changed value'
```

### With localStorage

```js
import storez from "svelte-storez";

const myStore = storez("my value", { localstorage: { key: "myPersistedStore" } });

const dispose = myStore.subscribe(() => {...});

myStore.set("changed value");

localstorage.getItem("myPersistedStore") // === "my value"

dispose(); // persist in localStorage

localstorage.getItem("myPersistedStore") // === "changed value"
```

### With history

```js
import storez from "svelte-storez";

const myStore = storez("my value", { history: { size: 1000 } });

myStore.set("changed value");

myStore.z.history; // is a Svelte derived store containing an array of all the previous values
// e.g. ["my value", "changed value"]
```

## API

```js
// Svelte compatible store API
storez(val);
storez(val, start);

// Same with Storez options
storez(val, options);
storez(val, start, options);
```

## Options

| Module       | Options | Details                                                  |
| ------------ | ------- | -------------------------------------------------------- |
| localstorage | key     | Key under which the local storage will be saved          |
| history      | size    | Overall size of the array of element kept in the history |
