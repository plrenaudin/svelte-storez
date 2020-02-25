# svelte-storez

## Svelte writable store with extra feature

- Fully compatible with svelte writable store
- Subscriber function receives the new and the old value

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
