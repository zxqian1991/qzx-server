import { Injectable } from "qzx-ioc";
import { Get } from ".";
import { Controller } from "./@controller";
import { Inject, Param } from "./@param";
import { Server } from "./server";

@Injectable()
export class AAA {
  name = "qianzhixiang";
  age = 12;
}

@Controller("/")
class A {
  @Get("/:id")
  async qzx(@Inject() aaa: AAA) {
    console.log(aaa);
    return 123;
  }
}
const server = new Server();

server.start();
