import { diff } from "./utils";

/* eslint-disable no-unused-vars */
const restHook = ({
  rest: { endpoint, idParam = "id", fetchImpl = window.fetch, fetchParams = {} }
}) => {
  if (!endpoint) {
    throw new Error("Endpoint parameter is required");
  }
  let setter;
  let loading = false;
  const onStoreInit = valueStoreSetter => (setter = valueStoreSetter);

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
                body: entry,
                ...fetchParams
              });
            case "put":
              return fetchImpl(`${endpoint}/${entry[idParam]}`, {
                method: "PUT",
                body: entry,
                ...fetchParams
              });

            case "del":
              return fetchImpl(`${endpoint}/${entry}`, {
                method: "DELETE",
                ...fetchParams
              });
          }
        })
      );
    }, []);
  };

  const load = async params => {
    let url = `${endpoint}`;
    try {
      loading = true;
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
      setter(data);
    } catch (e) {
      throw new Error(`Error thrown while fetching ${url}`, e);
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
