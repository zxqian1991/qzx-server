import koa from 'koa';
import 'colors';
import Router from 'koa-router';
import { analyseController, METHOD_TYPE } from './common';
import moment from 'moment';
import bodyParser from 'koa-bodyparser';
export interface ServerOption {
    host?: string;
    port?: number;
    plugins?: ((app: koa) => koa.Middleware)[];
    controllers?: (new (...args: any[]) => any)[];
    prefix?: string;
    filters?: ((ctx: {
        getMetadata: <T>(key: string) => T; // 获取metadata
        method: METHOD_TYPE; // 方法
        path: string;
        context: koa.Context;
    }) => boolean)[];
}
export class Server {
    getApp() {
        return this.app;
    }
    private app = new koa();
    private router?: Router;
    private getPort() {
        return this.option.port || 8080;
    }

    private getHost() {
        return this.option.host || '127.0.0.1';
    }
    private getPlugins() {
        return this.option.plugins || [];
    }
    private getControllers(): (new (...args: any[]) => any)[] {
        return this.option.controllers || [];
    }

    private initControllers() {
        this.getControllers().forEach((c) => this.initController(c));
    }
    private initController(controller: new (...args: any[]) => any) {
        analyseController(controller, (type, path, h) => {
            switch (type) {
                case METHOD_TYPE.GET:
                    this.router?.get(path, (c, n) =>
                        h(
                            c,
                            n,
                            this.option.filters
                                ? (c) =>
                                      this.option.filters!.every((filter) =>
                                          filter(c)
                                      )
                                : undefined
                        )
                    );
                    break;
                case METHOD_TYPE.POST:
                    this.router?.post(path, h);
                case METHOD_TYPE.DELETE:
                    this.router?.delete(path, h);
                default:
                    this.router?.use(h);
            }
        });
    }

    private initPlugins() {
        const plugins = this.getPlugins();
        plugins.forEach((plugin) => this.app.use(plugin(this.app)));
    }
    constructor(private option: ServerOption = {}) {
        this.option = Object.assign(
            {
                prefix: '/',
                host: '0.0.0.0',
                port: 9999,
            } as ServerOption,
            option
        );
        this.router = new Router({
            prefix: option.prefix,
        });
    }
    start() {
        this.app.use(bodyParser());
        this.initPlugins();
        this.initControllers();
        this.app.use(this.router!.routes()).use(this.router!.allowedMethods());
        this.app.listen(this.getPort(), this.getHost());
        console.log(
            `[${moment().format('YYYY-MM-DD HH:mm:ss')}]`.green,
            `: 服务已启动,请访问`,
            `http://${this.option.host}:${this.option.port}`.green
        );
    }
}
