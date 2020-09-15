# qzx-server 使用说明

**使用实例**

```typescript
import { Server } from "qzx-server";
const server = new Server({
  plugins: [],
  controllers: [],
});
server.start(9999);
```

## Plugin

> 同 koa 的 plugin

## Controller

```typescript
@Controller("/a")
class Test {
  @Get("/b")
  t(@Query() q: { id: number }, @Body() b: { dd: string }) {
    return { age: 100 };
  }
}
```
