export default function createNamedFunction(fn, name) {
  if (fn.name === name) return fn;
  return Object.values({
    [name]() {
      return fn(...arguments);
    },
  })[0];
}
