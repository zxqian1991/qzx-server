import Application from "koa";

export interface IControllerOption {
  path: string;
  notUsePrefix?: string;
}

export interface IControllerInfo {
  [prop: string]: {
    target: any;
    methods: IControllerMethodObj;
  };
}

export interface IControllerMethodStore {
  [prop: string]: IControllerMethodObj;
}

export type IControllerMethodObj = {
  // type: ENUM_OF_METHOD_TYPE; // 请求的方法类型
  // propertyName: string; // 需要调用的属性方法
  [i in ENUM_OF_METHOD_TYPE]?: string;
};

export enum ENUM_OF_METHOD_TYPE {
  GET = "get",
  POST = "post",
  DELETE = "delete",
  PUT = "put",
  ALL = "all",
}

export interface IServerOption {
  controllers?: Array<object>;
  plugins?: ((app: Application) => Application.Middleware)[];
  transform?: (v: any) => any;
  host?: string;
  port?: number;
  prefix?: string; // 控制器前缀
}
