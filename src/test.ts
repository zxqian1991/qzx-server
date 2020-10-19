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
  constructor(private aaa: AAA) {}
  @Get("/:id")
  async qzx(@Inject() aaa: AAA) {
    return 123;
  }
}
const server = new Server();

server.start();
