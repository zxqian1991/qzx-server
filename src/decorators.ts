import 'reflect-metadata';
import koa from 'koa';
import {
    createClassDecorator,
    createParamDecorator,
    createPropertyDecorator,
} from 'qzx-decorator';

/**
 * 依赖注入
 * @param option
 * @returns
 */
export const Injectable = (option: { bootstrap?: boolean } = {}) =>
    createClassDecorator('injectable', (info) => {
        if (option.bootstrap) {
            Ioc(info.constructor);
        }
    })(option);
const InjectableInstance = new WeakMap<any, any>();
export function Ioc<T>(
    constructor: T
): T extends new (...args: any[]) => infer D ? D : T {
    if (InjectableInstance.has(constructor))
        return InjectableInstance.get(constructor);
    if (!constructor || typeof constructor !== 'function') {
        return constructor as any;
    }
    const params = (
        (Reflect.getMetadata('design:paramtypes', constructor) as any[]) || []
    ).map((c) => Ioc(c));
    const instance = new (constructor as any)(...params);
    InjectableInstance.set(constructor, instance);
    return instance;
}

export const Controller = (path: string = '/') =>
    createClassDecorator('controller')(path);
export const Get = (path: string = '/') =>
    createPropertyDecorator('method')('get', path);
export const Post = (path: string = '/') =>
    createPropertyDecorator('method')('post', path);
export const Delete = (path: string = '/') =>
    createPropertyDecorator('method')('delete', path);
export const All = (path: string = '/') =>
    createPropertyDecorator('method')('all', path);

const metadataMap = new WeakMap<any, Map<string, any>>();
export const SetMetadata = (name: string, value: any) =>
    createPropertyDecorator(
        'set:metadata',
        ({ target, property }) => {
            if (!metadataMap.has(target)) {
                metadataMap.set(target, new Map());
            }
            if (!metadataMap.get(target)?.has(property)) {
                metadataMap.get(target)?.set(property, {});
            }
            metadataMap.get(target)!.get(property)![name] = value;
        },
        false
    )(name, value);
export const GetMetadata = (
    target: Record<string, any>,
    property: string,
    name: string
) => {
    return metadataMap.get(target)?.get(property)?.[name];
};
export const Ctx = () =>
    createParamDecorator('param', () => (ctx: koa.Context) => {
        return ctx;
    })('ctx');
export const Param = (property?: string) =>
    createParamDecorator(
        'param',
        () => (ctx: koa.Context) =>
            property ? ctx.params?.[property] : ctx.params
    )('param', property);
export const Query = (property?: string) =>
    createParamDecorator(
        'param',
        () => (ctx: koa.Context) => property ? ctx.query[property] : ctx.query
    )('query', property);
export const Body = (property?: string) =>
    createParamDecorator(
        'param',
        () => (ctx: koa.Context) =>
            property ? ctx.request.body?.[property] : ctx.request.body
    )('body', property);

export const File = (name = 'file') =>
    createParamDecorator(
        'param',
        () => (ctx: koa.Context) => (ctx.request as any).files?.[name]
    )('file', name);
export const Files = (name = 'files') =>
    createParamDecorator(
        'param',
        () => (ctx: koa.Context) => (ctx.request as any).files?.[name]
    )('files', name);
