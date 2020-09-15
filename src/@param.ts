import { Context } from "koa";
import { SYMBOL_OF_CONTROLLER_PROPERY_DECORATOR } from "./common";

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
