import ErrorWrapper from "./ErrorWrapper";
import isPromiseLike from "./isPromiseLike";

export default class Loadable {
  constructor(value, promise) {
    this.promise = promise;
    if (isPromiseLike(value)) {
      this.promise = value;
      this.status = "loading";
    } else if (value instanceof ErrorWrapper) {
      this.error = value;
      this.status = "hasError";
    } else {
      this.status = "hasValue";
      this.value = value;
    }
    this[this.status] = true;
  }
}
