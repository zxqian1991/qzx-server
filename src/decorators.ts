import {
    CONTROLLER_URL_PATH,
    METHOD_METADATA,
    PARAM_METADATA,
    MethodInfo,
    METHOD_TYPE,
    PARAM_TYPE,
    ControllerInfo,
} from './common';
import 'reflect-metadata';
import { ParamInfo } from './common';

/**
 * 将注解的信息保存在  CONTROLLER_URL_PATH   中
 * @param option \
 * @returns
 */
export function Controller<T extends new (...args: any[]) => any>(
    option: ControllerInfo['url'] | ControllerInfo = {}
) {
    return (target: T) => {
        const prototype = target.prototype;
        const paramsTypes =
            Reflect.getMetadata('design:paramtypes', target) || [];
        Reflect.defineMetadata(
            CONTROLLER_URL_PATH,
            typeof option === 'string'
                ? { url: option, paramsTypes }
                : Object.assign({ url: '/', paramsTypes }, option || {}),
            prototype
        );
    };
}

export function Get(path: string = '') {
    return methodSet(path, METHOD_TYPE.GET);
}

export function Post(path: string = '') {
    return methodSet(path, METHOD_TYPE.POST);
}

/**
 * 将所有的方法信息保存到   METHOD_METADATA   中去
 * 每个item记录 方法类型 属性名称 和允许的路径
 * @param path
 * @param method
 * @returns
 */
function methodSet(path: string, method: METHOD_TYPE) {
    return (
        target: Object,
        property: string,
        descriptor: PropertyDescriptor
    ) => {
        if (!Reflect.hasMetadata(METHOD_METADATA, target)) {
            Reflect.defineMetadata(METHOD_METADATA, [], target);
        }
        const data = Reflect.getMetadata(
            METHOD_METADATA,
            target
        ) as MethodInfo[];
        data.push({
            property,
            method,
            path,
        });
        // 存储属性名称
    };
}
export function Ctx() {
    return ParamsSet(PARAM_TYPE.CTX);
}

export function Body() {
    return ParamsSet(PARAM_TYPE.BODY);
}

export function Query() {
    return ParamsSet(PARAM_TYPE.QUERY);
}

export function Param() {
    return ParamsSet(PARAM_TYPE.PARAM);
}

/**
 * 将参数的数据放入 PARAM_METADATA 中去
 * PARAM_METADATA 中存放的是一个对象  属性是有参数的控制的方法的名称 值就是每个参数的属性
 * 属性包括参数类型 值类型 和所在位置
 * @param type
 * @returns
 */
function ParamsSet(type: PARAM_TYPE) {
    return (target: any, property: string, index: number) => {
        if (!Reflect.hasMetadata(PARAM_METADATA, target)) {
            Reflect.defineMetadata(PARAM_METADATA, {}, target);
        }
        const obj: {
            [prop: string]: ParamInfo[];
        } = Reflect.getMetadata(PARAM_METADATA, target);
        if (!obj[property]) {
            obj[property] = [];
        }
        // 获取类型
        const paramType = Reflect.getMetadata(
            'design:paramtypes',
            target,
            property
        )[index];
        obj[property][index] = {
            type,
            paramType,
            index,
        };
    };
}
