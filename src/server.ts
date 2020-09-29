import koa from "koa";
import Router from "@koa/router";
import logger from "koa-logger";
import koaBody from "koa-body";
import "colors";
import { getControllerPaths, getIPAdress, initPathMapping } from "./util";
import { IServerOption } from "./interfaces/controller";
import { IControllerInfo } from "./interfaces/controller";
export class Server {
  private app!: koa;
  private option: IServerOption | undefined;
  private pathMapping: IControllerInfo = {};
  constructor(option?: IServerOption) {
    this.option = Object.assign(
      {
        transform: (v: any) => v,
      },
      option
    );
    this.app = new koa();
  }

  // 初始化路由
  private initRouter() {
    const router = new Router();
    this.pathMapping = getControllerPaths();
    initPathMapping(this.pathMapping, router);
    return router;
  }
  // 初始化控制器
  private initController() {
    const router = this.initRouter();
    this.setPlugins();
    // 放在controller之前
    this.app.use(async (ctx, next) => {
      const res = this.option!.transform!(await next());
      if (res !== undefined) {
        ctx.body = res;
      }
    });
    this.app.use(router.routes()).use(router.allowedMethods());
  }

  private setPlugins() {
    this.app.use(this.option?.defaultPlugins?.logger || logger());
    this.app.use(this.option?.defaultPlugins?.body || koaBody());
    this.option?.plugins?.forEach((plugin) => this.app.use(plugin));
  }

  // 启动
  start(
    port: number = this.option?.port || 8080,
    host: string = this.option?.host || "0.0.0.0"
  ) {
    this.initController();
    this.app.listen(port, host);
    console.log(
      `服务已启动: 请访问:${
        `http://${getIPAdress()}:${port}`.green
      }， 或者访问: ${`http://127.0.0.1:${port}`.green}`
    );
    return this;
  }
  getApp() {
    return this.app;
  }

  getOption() {
    return this.option;
  }
}
