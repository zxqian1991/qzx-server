import koa from "koa";
import Router from "@koa/router";
import { Ioc } from "qzx-ioc";
import App from "./app";
import { COMMON_OF_CONTROLLER_INFO } from "./common";
import { getControllerPaths, runObjectLikeArray } from "./util";
import { IControllerMethodStore } from "./interfaces/controller";
export default class Server {
  private app = Ioc(App);
  private pathMapping: IControllerMethodStore = {};
  constructor() {
    const app = Ioc(App);
    // 私有属性，不想对外暴露
    (app as any).app = new koa();
  }

  private initRouter() {
    const router = new Router();
    this.pathMapping = getControllerPaths();
    runObjectLikeArray(this.pathMapping, (v, k) => {
      // router.use('sdsd', )
      router.get(k, (c, n) => {});
      (router as any)[v.propertyName](
        k,
        (
          context: koa.ParameterizedContext<
            any,
            Router.RouterParamContext<any, {}>
          >,
          next: koa.Next
        ) => {
          // 获取controller对应的实例
          // 获取参数值
          // 执行方法
        }
      );
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
