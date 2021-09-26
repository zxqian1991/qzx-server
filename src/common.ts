import koa from 'koa';
import { Ioc } from './Injectable';
export const CONTROLLER_URL_PATH = Symbol();
export const METHOD_METADATA = Symbol();
export const PARAM_METADATA = Symbol();
export const SET_METADATA = Symbol();

export enum METHOD_TYPE {
    ALL = 'ALL',
    GET = 'GET',
    POST = 'POST',
    DELETE = 'DELETE',
}

export enum PARAM_TYPE {
    CTX,
    QUERY,
    PARAM,
    BODY,
}

export interface ControllerInfo {
    url?: string;
}
export interface MethodInfo {
    property: string; // 属性名称
    method: METHOD_TYPE; // 支持的方法类型
    path: string; // 支持的路径
}
export interface ParamInfo {
    type: PARAM_TYPE; // 属性注入的类型
    paramType: any; // 属性的类型
    index: number; // 属性的下标
}

function joinPath(...paths: string[]) {
    return paths.join('/').replace(/\/{2,}/gi, '/');
}

export function analyseController(
    controller: new (...args: any[]) => any,
    onPath: (
        type: METHOD_TYPE,
        path: string,
        h: (
            ctx: koa.Context,
            next: koa.Next,
            filter?: (ctx: {
                getMetadata: <T>(key: string) => T; // 获取metadata
                method: METHOD_TYPE; // 方法
                path: string;
                context: koa.Context;
            }) => boolean
        ) => any
    ) => any
) {
    const controllerInfo = getControllerInfo(controller);
    if (!controllerInfo) throw new Error('this is not a valid controller!');
    const methodsInfos = getMethodsInfo(controller);
    methodsInfos.forEach((methodInfo) => {
        // 路由路径
        const path = joinPath(
            controllerInfo.url || '/',
            methodInfo.path || '/'
        );
        const metainfos = getMetaDatas(controller, methodInfo.property);
        onPath(methodInfo.method, path, async (ctx, next, filter) => {
            if (
                filter &&
                !filter({
                    getMetadata: <T>(key: string) =>
                        metainfos?.[key] as unknown as T,
                    method: methodInfo.method,
                    path: methodInfo.path,
                    context: ctx,
                })
            ) {
                await next();
                return;
            }
            const instance = getControllerInstance(controller);
            if (
                !instance[methodInfo.property] ||
                typeof instance[methodInfo.property] !== 'function'
            ) {
                throw new Error(`invalid handler for ${path}`);
            }
            ctx.body = await instance[methodInfo.property](
                ...getParamValues(controller, methodInfo.property, ctx)
            );
        });
    });
}

function getParamValues(
    controller: new (...args: any[]) => any,
    property: string,
    ctx: koa.Context
) {
    const paramInfos = getParamsInfos(controller);
    if (!paramInfos.hasOwnProperty(property)) return [];
    return paramInfos[property].map((p) => {
        if (!p) return undefined;
        switch (p.type) {
            case PARAM_TYPE.CTX:
                return ctx;
            case PARAM_TYPE.BODY:
                return ctx.request.body || {};
            case PARAM_TYPE.QUERY:
                return ctx.query || {};
            case PARAM_TYPE.PARAM:
                return ctx.params;
            default:
                return undefined;
        }
    });
}
function getControllerInstance(controller: new (...args: any[]) => any) {
    const controllerInfo = getControllerInfo(controller);
    return new controller(...controllerInfo.paramsTypes.map((i) => Ioc(i)));
}

function getControllerInfo(controller: new (...args: any[]) => any) {
    const prototype = controller.prototype;
    const controllerInfo = Reflect.getMetadata(
        CONTROLLER_URL_PATH,
        prototype
    ) as ControllerInfo & {
        paramsTypes: any[];
    };
    return controllerInfo;
}
function getMethodsInfo(controller: new (...args: any[]) => any) {
    const prototype = controller.prototype;
    const methodsInfos = Reflect.getMetadata(
        METHOD_METADATA,
        prototype
    ) as MethodInfo[];
    return methodsInfos || [];
}

function getParamsInfos(controller: new (...args: any[]) => any) {
    const prototype = controller.prototype;
    const paramInfos = Reflect.getMetadata(PARAM_METADATA, prototype) as {
        [prop: string]: ParamInfo[];
    };
    return paramInfos || {};
}

function getMetaDatas(
    controller: new (...args: any[]) => any,
    property: string
) {
    const prototype = controller.prototype;
    const metadatas = Reflect.getMetadata(SET_METADATA, prototype) as Record<
        string,
        any
    >;
    return metadatas?.[property];
}
