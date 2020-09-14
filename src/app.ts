import { Injectable } from "qzx-ioc";
import koa from "koa";

@Injectable()
export default class App {
  private app!: koa;
  getApp() {
    return this.app;
  }
}
