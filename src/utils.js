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

export const diff = (a, b, idParam = "id") => {
  const result = {
    post: [],
    put: [],
    del: []
  };
  if (a !== b) {
    // addition or deletion then diff
    if (b === null && a !== null) {
      result.del.push(a);
    } else if (a === null && b !== null) {
      result.post.push(b);
    } else if (typeof a === "object" && typeof b === "object") {
      // Compare arrays
      if (Array.isArray(a) && Array.isArray(b)) {
        const previousIds = a.map(i => i[idParam]).filter(Boolean);
        const newIds = b.map(i => i[idParam]).filter(Boolean);

        result.del = previousIds.filter(i => !newIds.includes(i));
        for (const current of b) {
          // Returns POST for each items without idParam
          const currentId = current[idParam];
          if (!currentId) {
            result.post.push(current);
            continue;
          }
          const old = a.find(i => i[idParam] === currentId);
          if (!objectDeepEqual(old, current)) {
            result.put.push(current);
          }
          // PUT or unchanged
        }
      } else {
        if (!objectDeepEqual(a, b)) {
          result.put.push(b);
        }
      }
    }
  }
  return result;
};
const objectDeepEqual = (a, b) => {
  for (let p in a) {
    if (
      Object.prototype.hasOwnProperty.call(a, p) !==
      Object.prototype.hasOwnProperty.call(b, p)
    )
      return false;

    switch (typeof a[p]) {
      case "object":
        if (!objectDeepEqual(a[p], b[p])) return false;
        break;
      case "function":
        if (
          typeof b[p] == "undefined" ||
          (p != "compare" && a[p].toString() != b[p].toString())
        )
          return false;
        break;
      default:
        if (a[p] != b[p]) return false;
    }
  }

  //Check object 2 for any extra properties
  for (let p in b) {
    if (typeof a[p] == "undefined") return false;
  }
  return true;
};
