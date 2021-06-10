# Storez

<img src="https://img.shields.io/bundlephobia/minzip/storez" />
<img src="https://img.shields.io/david/plrenaudin/svelte-storez" />

## Svelte writable store with extra feature

- **Fully compatible** with svelte writable store
- Subscriber function receives the new **and the old value**
- Read and persist value to localstorage
- Keep previous values in **history** (**undo** store mutation with `undo()`)
- Write operation **debouncing**
- Get current value without having to subscribe or use `svelte/store` **get** method

## Installation

```
npm install storez
```

## Usage example

Check out the [Demo](https://codesandbox.io/s/storez-demo-c11v9)

### Basic example

```js
import storez from "storez";

const myStore = storez("my value");

const dispose = myStore.subscribe((newVal, oldVal) => {
  console.log(`'${oldVal}' has been changed to '${mewVal}'`);
});

myStore.set("changed value"); // console output: 'my value' has been changed to 'changed value'
```

### With localStorage

```js
import storez from "storez";

const myStore = storez("my value", { localstorage: { key: "myPersistedStore" } });

const dispose = myStore.subscribe(() => {...});

myStore.set("changed value");

localstorage.getItem("myPersistedStore") // === "my value"

dispose(); // persist in localStorage

localstorage.getItem("myPersistedStore") // === "changed value"
```

### With history

```js
import storez from "storez";

export const store = storez("my value", { history: { size: 1000 } });

store.set("changed value");

store.set("another value");

// Undo last mutation:
store.z.undo();
```

In the Svelte file:

```html
<script>
  import { store } from "./store";
  const history = store.z.history; // is a Svelte derived store containing an array of all the previous values
  // e.g. ["my value", "changed value"]
</script>

<input type="text" bind:value="{$store}" />
<p>Value: {$store}</p>

<strong>History</strong>
<ul>
  {#each $history as item}
  <li>{item}</li>
  {/each}
</ul>
<button on:click="{store.z.undo}">Undo</button>
```

## API

### Constructor

```js
// Svelte compatible store API
storez(val);
storez(val, start);

// Same with Storez options
storez(val, options);
storez(val, start, options);
```

### Storez instance

```js
const instance = storez("initial", ...);
instance.set("newValue");
instance.set("wrongValue");

instance.z.get() // returns the current value of the store (e.g. "wrongValue") This value is not reactive

// If History module enabled:
instance.z.history; // History module: Svelte readable store containing the state history
instance.z.undo(); // History module: undo last mutation
// Here: instance === newValue
instance.z.redo();
// Here: instance === wrongValue


```

## Options

| Module       | Options  | Type   | Details                                                  |
| ------------ | -------- | ------ | -------------------------------------------------------- |
| (default)    | debounce | Number | Timeout between each insert in the store                 |
| localstorage | key      | String | Key under which the local storage will be saved          |
| history      | size     | Number | Overall size of the array of element kept in the history |
