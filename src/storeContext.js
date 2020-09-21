const contexts = {};

function createContext(name) {
  return function () {
    if (arguments.length) {
      return (contexts[name] = arguments[0]);
    } else {
      return contexts[name];
    }
  };
}

export const dispatchContext = createContext("dispatch");

export const selectContext = createContext("select");

export const computedContext = createContext("computed");
