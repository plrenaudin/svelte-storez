import { localStorageSerializer, readLocalStorage } from "./utils";

const localstorageHook = options => ({
  onInit: value => {
    const initialValue = readLocalStorage(options.localstorage.key);
    if (!initialValue) {
      localStorage.setItem(
        options.localstorage.key,
        localStorageSerializer.to(value)
      );
    }
    return initialValue || value;
  },

  onDispose: value => {
    localStorage.setItem(
      options.localstorage.key,
      localStorageSerializer.to(value)
    );
  }
});

export default localstorageHook;
