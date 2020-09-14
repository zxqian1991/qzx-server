export interface IControllerOption {
  path: string;
}

export interface IControllerMethodStore {
  [prop: string]: IControllerMethodObj;
}

export interface IControllerMethodObj {
  type: ENUM_OF_METHOD_TYPE; // 请求的方法类型
  propertyName: string; // 需要调用的属性方法
}

export enum ENUM_OF_METHOD_TYPE {
  GET = "get",
  POST = "post",
  DELETE = "delete",
  PUT = "put",
  ALL = "all",
}
