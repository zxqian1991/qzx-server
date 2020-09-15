import koa from "koa";
import Router from "@koa/router";
import logger from "koa-logger";
import koaBody from "koa-body";
import "colors";
import {
  getControllerPaths,
  getIPAdress,
  getTargetConstructorParamInsts,
  initPathMapping,
} from "./util";
import { IServerOption } from "./interfaces/controller";
import { IControllerInfo } from "./interfaces/controller";
export default class Server {
  private app!: koa;
  private option: IServerOption = {};
  private pathMapping: IControllerInfo = {};
  constructor(option?: IServerOption) {
    this.option = option || {};
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
    this.app.use(router.routes()).use(router.allowedMethods());
  }

  private setPlugins() {
    this.app.use(this.option.defaultPlugins?.logger || logger());
    this.app.use(this.option.defaultPlugins?.body || koaBody());
    (this.option.plugins || []).forEach((plugin) => this.app.use(plugin));
  }

  // 启动
  start(port: number = 8080, host: string = "0.0.0.0") {
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
