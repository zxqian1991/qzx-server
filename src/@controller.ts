import { getControllerMethodStore } from "./util";
/**
 * @author [qianzhixiang]
 * @email [zxqian199@163.com]
 * @create date 2020-09-14 14:32:34
 * @modify date 2020-09-14 14:32:34
 * @desc [
 *    路由控制器，
 *   1. 根据请求路径匹配对应的处理方法
 *   2. 依赖注入
 *   3. 注解式获取参数
 *   4. 拦截器
 *   5. typeorm
 * ]
 */

import { IControllerOption } from "./interfaces/controller";
import { COMMON_OF_CONTROLLER_INFO } from "./common";

export function Controller(option?: string | IControllerOption) {
  const tempOption =
    typeof option === "object" ? option : { path: option || "/" };
  // 接下来要记录controller
  return (target: any) => {
    COMMON_OF_CONTROLLER_INFO.push([tempOption, target]);
  };
}
