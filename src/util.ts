import { join } from "path";
import {
  COMMON_OF_CONTROLLER_INFO,
  CONTROLLER_URL_PROPERTY_NAME,
} from "./common";
import {
  IControllerMethodStore,
  IControllerMethodObj,
} from "./interfaces/controller";
/**
 * 根据所有的controller生成path和controller的对应关系
 */
export function getControllerPaths() {
  return COMMON_OF_CONTROLLER_INFO.reduce<{
    [prop: string]: IControllerMethodObj;
  }>((lastv, [option, target]) => {
    const store = getControllerMethodStore(target);
    for (let url in store) {
      lastv[join(option.path, url)] = store[url];
    }
    return lastv;
  }, {});
}

export function getControllerMethodStore(target: any): IControllerMethodStore {
  if (!target[CONTROLLER_URL_PROPERTY_NAME]) {
    target[CONTROLLER_URL_PROPERTY_NAME] = {};
  }
  return target[CONTROLLER_URL_PROPERTY_NAME];
}

export function runObjectLikeArray<T>(
  obj: { [prop: string]: T },
  handler: (v: T, key: string) => void
) {
  for (let i in obj) {
    handler(obj[i], i);
  }
}
