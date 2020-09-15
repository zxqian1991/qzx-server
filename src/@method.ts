import { ENUM_OF_METHOD_TYPE } from ".";
import { getControllerMethodStore } from "./util";

export function Get(url: string = "/") {
  return setMethod(url, ENUM_OF_METHOD_TYPE.GET);
}

export function Post(url: string) {
  return setMethod(url, ENUM_OF_METHOD_TYPE.POST);
}
export function Delete(url: string) {
  return setMethod(url, ENUM_OF_METHOD_TYPE.DELETE);
}
export function Put(url: string) {
  return setMethod(url, ENUM_OF_METHOD_TYPE.PUT);
}

export function All(url: string) {
  return setMethod(url, ENUM_OF_METHOD_TYPE.ALL);
}

function setMethod(url: string, type: ENUM_OF_METHOD_TYPE) {
  return (target: any, key: string) => {
    const store = getControllerMethodStore(target);
    if (!store[url]) {
      store[url] = {};
    }
    store[url][type] = key;
  };
}
