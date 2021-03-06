/**
 * 讲笑话功能
 * 本文件提供讲笑话的实现，默认提供的是 聚合数据 API的实现。
 * 如果需要自己扩展实现，可以参照默认实现编写函数。
 */



import JuheAPIJoke from "./juheapi"
import Interceptor from "../../Interceptor";

const jokeInterceptor = new Interceptor("joke", context => {
    context.template.add("joke.success", [
        "{content}",
    ])
    context.template.add("joke.failed", "哎呀，狗蛋没找到合适的笑话。等会再来试试？")
})
    .title("讲笑话")
    .alias("笑话")
    .alias("讲段子")
    .alias("段子")
    .usage("讲个笑话吧")
    .check((context, message) => /^(狗蛋.*)讲个?(笑话|段子)/.test(message.text()))
    .handler(async context => {
        const result: string = await JuheAPIJoke()
        if (result && result.length > 0) {
            return context.template.use("joke.success", {
                content: result
            })
        } else {
            return context.template.use("joke.failed")
        }
    })
export default jokeInterceptor
