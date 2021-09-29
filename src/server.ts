import koa from 'koa';

import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';

import {
    getClassDecoratorInfos,
    getParamDecoratorInfo,
    getPropertyDecoratorInfos,
    IPropertyDecoratorInfo,
} from 'qzx-decorator';
import { Ioc, GetMetadata } from './decorators';

export type ServerFilter = (ctx: {
    getMetadata: <T>(key: string) => T; // 获取metadata
    method: string; // 方法
    path: string;
    context: koa.Context;
}) => boolean;
export function join(...ps: string[]) {
    return ('/' + ps.join('/')).replace(/(?<!https:)\/{2,}/gi, '/');
}
export interface ServerOption {
    host?: string;
    port?: number;
    plugins?: ((app: koa) => koa.Middleware)[];
    controllers?: (new (...args: any[]) => any)[];
    prefix?: string;
    filters?: ServerFilter[];
}
export class Server {
    getApp() {
        return this.app;
    }
    private app = new koa();
    private router?: Router;
    getPort() {
        return this.option.port || 8080;
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

    private filterHandler(
        h: (
            ctx: koa.Context,
            next: koa.Next,
            filter?: ServerFilter | undefined
        ) => any
    ) {
        return (c: koa.Context, n: koa.Next) =>
            h(
                c,
                n,
                this.option.filters
                    ? (c) => this.option.filters!.every((filter) => filter(c))
                    : undefined
            );
    }

    private getParamsValue(
        controller: new (...args: any[]) => any,
        property: string,
        ctx: koa.Context
    ) {
        const paramInfos = getParamDecoratorInfo(
            controller.prototype,
            property
        );
        return paramInfos.map((decorators) =>
            decorators.length <= 0
                ? undefined
                : decorators
                      //   .filter((i) => i.name === 'param')
                      .reduce<any>((lv, decorator) => {
                          if (decorator.handler) {
                              return decorator.handler(decorator, lv)?.(ctx);
                          }
                          return lv;
                      }, undefined)
        );
    }
    private handlerWithFilter(
        controller: new (...args: any[]) => any,
        propertyInfo: IPropertyDecoratorInfo<any>,
        url: string
    ) {
        return async (context: koa.Context, next: koa.Next) => {
            if (
                this.option.filters &&
                this.option.filters.length > 0 &&
                this.option.filters.some(
                    (filter) =>
                        !filter({
                            getMetadata: (name: string) =>
                                GetMetadata(
                                    controller.prototype,
                                    propertyInfo.property,
                                    name
                                ),
                            method: propertyInfo.args[0],
                            path: url,
                            context,
                        })
                )
            ) {
                return next();
            }
            const params = Reflect.getMetadata(
                'design:paramtypes',
                controller
            ) as Array<any>;
            const instance = new controller(...params.map((p) => Ioc(p)));
            if (typeof instance[propertyInfo.property] !== 'function') {
                await next();
            } else {
                context.body = await instance[propertyInfo.property](
                    ...this.getParamsValue(
                        controller,
                        propertyInfo.property,
                        context
                    )
                );
            }
        };
    }
    private initController(controller: new (...args: any[]) => any) {
        const controllerDecorators = getClassDecoratorInfos(controller).filter(
            (i) => i.name === 'controller'
        );
        controllerDecorators.forEach((controllerInfo) => {
            const methodInfoObject = getPropertyDecoratorInfos(
                controller.prototype
            );
            for (let property in methodInfoObject) {
                const methodInfs = (methodInfoObject[property] || []).filter(
                    (i) => i.name === 'method'
                );
                methodInfs.forEach((methodInfo) => {
                    const type = (methodInfo.args[0] as string).toUpperCase();
                    const url = join(
                        `/${controllerInfo.args[0] || '/'}/${
                            methodInfo.args[1] || '/'
                        }`
                    );
                    switch (type) {
                        case 'GET':
                            this.router?.get(
                                url,
                                this.handlerWithFilter(
                                    controller,
                                    methodInfo,
                                    url
                                )
                            );
                            break;
                        case 'POST':
                            this.router?.post(
                                url,
                                this.handlerWithFilter(
                                    controller,
                                    methodInfo,
                                    url
                                )
                            );
                            break;
                        case 'DELETE':
                            this.router?.delete(
                                url,
                                this.handlerWithFilter(
                                    controller,
                                    methodInfo,
                                    url
                                )
                            );
                            break;
                        case 'ALL':
                        default:
                            this.router?.all(
                                url,
                                this.handlerWithFilter(
                                    controller,
                                    methodInfo,
                                    url
                                )
                            );
                    }
                });
            }
        });
    }

    private initPlugins() {
        const plugins = this.getPlugins();
        plugins.forEach((plugin) => this.app.use(plugin(this.app)));
    }
    getHost() {
        return this.option.host;
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
    }
}
