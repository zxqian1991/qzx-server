import { Context } from "koa";
import { Ioc } from "qzx-ioc";
import { SYMBOL_OF_CONTROLLER_PROPERY_DECORATOR } from "./common";

export function Query(prop?: string) {
  return setParams((ctx: Context) =>
    !prop ? ctx.query : ctx.query[prop as string]
  );
}

export function Data(prop?: string) {
  return setParams((ctx: Context) =>
    !prop ? ctx.request.body : ctx.request.body[prop as string]
  );
}

export function Param(prop?: string) {
  return setParams((ctx: Context) =>
    !prop ? ctx.params : ctx.params[prop as string]
  );
}

export function Ctx() {
  return setParams((ctx: Context) => ctx);
}

export function Res() {
  return setParams((ctx: Context) => ctx.response);
}

export function req() {
  return setParams((ctx: Context) => ctx.request);
}

export function Inject() {
  return setParams((ctx: Context, type: any) => {
    return Ioc(type);
  });
}

function setParams(handler: (ctx: Context, type: any) => any) {
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
    const types = Reflect.getMetadata("design:paramtypes", target, propertyKey);
    const type = types[index];
    arr[index].push((ctx: Context) => handler(ctx, type));
  };
}
