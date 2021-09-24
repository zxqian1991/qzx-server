# 轻量的基于 KOA 的后端框架

> NEST.JS 整体感觉还是太重，而且集成太深，不是很灵活，koa 最原始，也最灵活，但是没有较好的注解支持。 此库就是对 koa 做了一层简易的安装，支持基本的注解，其余使用均与 koa 无差别。

## 使用

### 新建服务

```typescript
import Server from 'qzx-server';
const server = new Server({
    host: '0.0.0.0',
    port: 9999,
    plugins: [],
    controllers: [],
});
server.start();
```

### 新建 Controller

```typescript
import { Controller, Post, Get } from 'qzx-server';
@Controller('/a')
export class CTest {
    @Post('/b')
    t1() {
        return 1234;
    }

    @Get('/c')
    t2() {
        return 2345;
    }
}
```

### 依赖注入

同样的，我们也支持依赖注入的操作.

```typescript
import {Injectable,Ioc, Controller, Post, Get} from 'qzx-server';
@Injectable()
export class InjectTest {
  count =1;
}

@Injectable()
export class InjectTest1 {
  constructor(private test: InjectTest) {
    console.log(this.test.count);
  }
}
@Controller('/a')
export class CTest {
  	constructor(private test: InjectTest) {}
    @Post('/b')
    t1() {
	      console.log(this.test);
        return 1234;
    }
}
const test = Ioc(InjectTest)
```
