import { diff } from "./utils";

/* eslint-disable no-unused-vars */
const restHook = ({
  rest: { endpoint, idParam = "id", fetchImpl = window.fetch, fetchParams = {} }
}) => {
  if (!endpoint) {
    throw new Error("Endpoint parameter is required");
  }
  let store;
  let loading = false;
  const onStoreInit = storeInitialized => (store = storeInitialized);

  const onNewVal = (value, old) => {
    // do not trigger rest if data comes from teh loading step
    if (loading) {
      loading = false;
      return;
    }
    const result = diff(old, value);
    const promises = Object.entries(result).reduce((acc, [method, entries]) => {
      return acc.concat(
        entries.map(entry => {
          switch (method) {
            case "post":
              return fetchImpl(endpoint, {
                method: "POST",
                body: entry
              });
            case "put":
              return fetchImpl(`${endpoint}/${entry[idParam]}`, {
                method: "PUT",
                body: entry
              });
            case "del":
              return fetchImpl(`${endpoint}/${entry}`, {
                method: "DELETE"
              });
          }
        })
      );
    }, []);
  };

  const load = async params => {
    try {
      loading = true;
      let url = `${endpoint}`;
      if (params) {
        const search = new URLSearchParams(params);
        if (params[idParam]) {
          url = url.concat(`/${params[idParam]}`);
          search.delete(idParam);
        }
        if (!search.keys().next().done) {
          url = url.concat(`?${search.toString()}`);
        }
      }
      const response = await fetchImpl(url, fetchParams);
      const data = response.json();
      store.set(data);
    } catch (e) {
      console.error(e);
    }
  };

  return {
    onStoreInit,
    onNewVal,
    exports: {
      load
    }
  };
};

export default restHook;
