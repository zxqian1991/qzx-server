import { getControllerMethodStore } from "./util";
/**
 * @author [qianzhixiang]
 * @email [zxqian199@163.com]
 * @create date 2020-09-14 14:32:34
 * @modify date 2020-09-14 14:32:34
 * @desc [
 *    路由控制器，
 *   1. 根据请求路径匹配对应的处理方法
 *   2. 依赖注入
 *   3. 注解式获取参数
 *   4. 拦截器
 *   5. typeorm
 * ]
 */

import {
  IControllerOption,
  IControllerMethodStore,
  ENUM_OF_METHOD_TYPE,
} from "./interfaces/controller";
import {
  COMMON_OF_CONTROLLER_INFO,
  CONTROLLER_URL_PROPERTY_NAME,
} from "./common";

export function Controller(option?: string | IControllerOption) {
  const tempOption =
    typeof option === "object" ? option : { path: option || "/" };
  // 接下来要记录controller
  return (target: any) => {
    COMMON_OF_CONTROLLER_INFO.push([tempOption, target]);
  };
}

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

export function Query() {}

export function Data() {}

export function Param() {}

/**
 * 参数装饰器  获取request参数
 */
export function Req() {}

/**
 * 参数装饰器 获取response参数
 */
export function Res() {}

function setMethod(url: string, type: ENUM_OF_METHOD_TYPE) {
  return (target: any, key: string) => {
    const store = getControllerMethodStore(target);
    store[url] = {
      type,
      propertyName: key,
    };
  };
}
