export const readLocalStorage = key => {
  try {
    return localStorageSerializer.from(localStorage.getItem(key));
  } catch (e) {
    throw new Error(`couldn't use local storage for key: ${key}`);
  }
};

export const localStorageSerializer = {
  from: value => {
    try {
      return JSON.parse(value);
    } catch (e) {
      if (e instanceof SyntaxError) {
        return value;
      }
    }
  },
  to: value => (value instanceof Object ? JSON.stringify(value) : value)
};

export const debounce = (func, delay) => {
  let timer;
  return function() {
    const me = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(me, args), delay);
  };
};
