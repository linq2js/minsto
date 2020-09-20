import { unset } from "./types";

export default function createSelector(selector, selectorResolver) {
  if (typeof selector === "function") {
    let lastArgs;
    let lastResult;
    return function (...args) {
      if (!lastArgs || lastArgs.some((arg, index) => args[index] !== arg)) {
        lastArgs = args;
        lastResult = selector(...args);
      }
      return lastResult;
    };
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
    return createSelector(function () {
      return combiner(...selectors.map((s) => s(...arguments)));
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
