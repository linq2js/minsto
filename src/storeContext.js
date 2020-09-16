const contexts = {};

function createContext(name) {
  return function () {
    if (arguments.length) {
      contexts[name] = arguments[0];
    } else {
      return contexts[name];
    }
  };
}

export const dispatchContext = createContext("dispatch");

export const selectContext = createContext("select");