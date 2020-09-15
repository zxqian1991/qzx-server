import koa from "koa";
import Router from "@koa/router";
import { Ioc } from "qzx-ioc";
import App from "./app";
import { getControllerPaths, getParamStore, runObjectLikeArray } from "./util";
import { IServerOption } from "./interfaces/controller";
import { Context } from "koa";
import { IControllerInfo } from "./interfaces/controller";
export default class Server {
  private app = Ioc(App);
  private pathMapping: IControllerInfo = {};
  constructor(option?: IServerOption) {
    const app = Ioc(App);
    // 私有属性，不想对外暴露
    (app as any).app = new koa();
  }

  // 初始化路由
  private initRouter() {
    const router = new Router();
    this.pathMapping = getControllerPaths();
    runObjectLikeArray(this.pathMapping, (v, k) => {
      for (let type in v.methods) {
        (router as any)[type](k, (ctx: Context, next: koa.Next) => {
          const propName = (v.methods as any)[type];
          const paramsTypes: any[] = Reflect.getMetadata(
            "design:paramtypes",
            v.target
          );
          const instance: any = new v.target(...paramsTypes.map((t) => Ioc(t)));
          const params = getParamStore(instance, propName).map(
            (handlers: Array<(ctx: Context, _v?: any) => any>) => {
              const t = handlers.reduce(
                (_v, handler) => handler(ctx, _v),
                undefined
              );
              return t;
            }
          );
          ctx.body = instance[propName].apply(instance, params);
        });
      }
    });
    return router;
  }
  // 初始化控制器
  private initController() {
    const router = this.initRouter();
    this.app.getApp().use(router.routes()).use(router.allowedMethods());
  }

  // 启动
  start(port: number = 8080, host: string = "0.0.0.0") {
    this.initController();
    this.app.getApp().listen(port, host);
    return this;
  }
  getApp() {
    return this.app;
  }
}
