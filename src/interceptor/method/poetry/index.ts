/**
 * 随机诗词功能
 */

import Interceptor from "../../Interceptor";
import { sentence } from "./api";

const jokeInterceptor = new Interceptor("poetry", context => {
    context.template.add("poetry.success", [
        "{content}",
    ])
    context.template.add("poetry.failed", "哎呀，狗蛋没找到合适的诗词。等会再来试试？")
})
    .title("诗词")
    .usage("来首诗")
    .check((context, message) => /^(狗蛋.*)?(诗|诗词)/.test(message.text()))
    .handler(async context => {
        const result: string = await sentence()
        if (result) {
            return context.template.use("poetry.success", {
                content: result
            })
        } else {
            return context.template.use("poetry.failed")
        }
    })

export default jokeInterceptor
