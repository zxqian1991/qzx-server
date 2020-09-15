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
  SYMBOL_OF_CONTROLLER_PROPERY_DECORATOR,
} from "./common";
import { Context } from "koa";
import { Injectable } from "qzx-ioc";

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

export function Query(prop?: string) {
  return setParams((ctx: Context) =>
    !prop ? ctx.query : ctx.query[prop as string]
  );
}

export function Data(prop?: string) {
  return setParams((ctx: Context) =>
    !prop ? ctx.body : ctx.body[prop as string]
  );
}

export function Param(prop?: string) {
  return setParams((ctx: Context) =>
    !prop ? ctx.params : ctx.params[prop as string]
  );
}

/**
 * 参数装饰器  获取request参数
 */
export function Ctx() {
  return setParams((ctx: Context) => ctx);
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

function setParams(handler: (ctx: Context) => any) {
  return (target: any, propertyKey: string, index: number) => {
    if (!target[SYMBOL_OF_CONTROLLER_PROPERY_DECORATOR]) {
      target[SYMBOL_OF_CONTROLLER_PROPERY_DECORATOR] = {};
    }
    if (!target[SYMBOL_OF_CONTROLLER_PROPERY_DECORATOR][propertyKey]) {
      target[SYMBOL_OF_CONTROLLER_PROPERY_DECORATOR][propertyKey] = [];
    }
    const arr: any[] =
      target[SYMBOL_OF_CONTROLLER_PROPERY_DECORATOR][propertyKey];
    if (index > arr.length - 1) {
      for (let i = arr.length; i <= index; i++) {
        arr.push([]);
      }
    }
    arr[index].push(handler);
  };
}
