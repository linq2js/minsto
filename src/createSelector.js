import { selectorType, unset } from "./types";

export default function createSelector(selector, selectorResolver) {
  if (typeof selector === "function") {
    if (selector.__type === selectorType) return selector;

    let lastArgs;
    let lastResult;
    return Object.assign(
      function (...args) {
        if (!lastArgs || lastArgs.some((arg, index) => args[index] !== arg)) {
          lastArgs = args;
          lastResult = selector(...args);
        }
        return lastResult;
      },
      {
        __type: selectorType,
      }
    );
  }
  if (typeof selector === "string") {
    let runtimeSelector = unset;
    return function () {
      if (runtimeSelector === unset) {
        runtimeSelector = selectorResolver(selector);
      }
      if (!runtimeSelector)
        throw new Error("No named selector " + selector + " found");
      return runtimeSelector(...arguments);
    };
  }

  if (Array.isArray(selector)) {
    const combiner = selector[selector.length - 1];
    const selectors = selector
      .slice(0, selector.length - 1)
      .map((s) => createSelector(s, selectorResolver));
    const wrappedCombiner = createSelector(combiner);
    return createSelector(function () {
      return wrappedCombiner(...selectors.map((s) => s(...arguments)));
    });
  }

  if (typeof selector === "object") {
    const entries = Object.entries(selector).map(([key, subSelector]) => [
      key,
      createSelector(subSelector, selectorResolver),
    ]);
    let prev;
    return createSelector(function () {
      const result = {};
      let hasChange = !prev;
      entries.forEach(([key, selector]) => {
        const value = selector(...arguments);
        if (!hasChange && prev[key] !== value) {
          hasChange = true;
        }
        result[key] = value;
      });
      return hasChange ? (prev = result) : prev;
    });
  }

  throw new Error(
    "Invalid selector type. Expected Array | String | Function but got " +
      typeof selector
  );
}
