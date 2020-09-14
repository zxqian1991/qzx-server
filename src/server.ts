import koa from "koa";
import Router from "@koa/router";
import { Ioc } from "qzx-ioc";
import App from "./app";
import { getControllerPaths, getParamStore, runObjectLikeArray } from "./util";
import { IControllerMethodStore } from "./interfaces/controller";
export default class Server {
  private app = Ioc(App);
  private pathMapping: { target?: any; methods?: IControllerMethodStore } = {};
  constructor() {
    const app = Ioc(App);
    // 私有属性，不想对外暴露
    (app as any).app = new koa();
  }

  private initRouter() {
    const router = new Router();
    this.pathMapping = getControllerPaths();
    runObjectLikeArray(this.pathMapping.methods!, (v, k) => {
      for (let type in v) {
        (router as any)[type](
          k,
          (
            ctx: koa.ParameterizedContext<
              any,
              Router.RouterParamContext<any, {}>
            >,
            next: koa.Next
          ) => {
            const propName = (v as any)[type];
            const instance: any = Ioc(this.pathMapping.target);
            instance[propName].apply(
              instance,
              getParamStore(
                this.pathMapping.target,
                propName
              ).map((handler: any) => handler(ctx))
            );
          }
        );
      }
    });
    return router;
  }
  private initController() {
    const router = this.initRouter();
    this.app.getApp().use(router.routes()).use(router.allowedMethods());
  }

  start(port: number = 8080, host: string = "0.0.0.0") {
    this.initController();
    this.app.getApp().listen(port, host);
  }
}
