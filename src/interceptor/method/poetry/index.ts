/**
 * 随机诗词功能
 */

import Interceptor from "../../Interceptor";
import { sentence } from "./api";

const jokeInterceptor = new Interceptor("poetry", context => {
    context.template.add("poetry.success", [
        "好嘞，诗来了：<br/>{content}",
        "诗来咯：<br/>{content}",
    ])
    context.template.add("joke.failed", "哎呀，狗蛋没找到合适的笑话。等会再来试试？")
})
    .title("诗词")
    .usage("来首诗")
    .check((context, message) => /^(狗蛋.*)来首?(诗)/.test(message.text()))
    .handler(async context => {
        const result: string = await sentence()
        if (result && result.length > 0) {
            return context.template.use("joke.success", {
                content: result
            })
        } else {
            return context.template.use("joke.failed")
        }
    })
    
export default jokeInterceptor
