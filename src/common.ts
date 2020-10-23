import { IControllerOption } from "./interfaces/controller";
export const COMMON_OF_CONTROLLER_INFO: Array<[IControllerOption, any]> = [];

// 存储 get post等注解的方法
export const CONTROLLER_URL_PROPERTY_NAME = Symbol("controller_url_prop_name");

//
export const SYMBOL_OF_CONTROLLER_PROPERY_DECORATOR = Symbol(
  "controller_property_decorator"
);
