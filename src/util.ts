import { join } from "path";
import {
  COMMON_OF_CONTROLLER_INFO,
  CONTROLLER_URL_PROPERTY_NAME,
  SYMBOL_OF_CONTROLLER_PROPERY_DECORATOR,
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
    [prop: string]: {
      target: any;
      methods: IControllerMethodObj;
    };
  }>((lastv, [option, target]) => {
    const store = getControllerMethodStore(target);
    for (let url in store) {
      lastv[join(option.path, url)] = {
        target,
        methods: store[url],
      };
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

export function getParamStore(target: any, propertyKey: string) {
  return (
    target &&
    target[SYMBOL_OF_CONTROLLER_PROPERY_DECORATOR] &&
    target[SYMBOL_OF_CONTROLLER_PROPERY_DECORATOR][propertyKey]
  );
}
