/**
 * 热搜查询
 * 提供新浪微博实时热搜查询，默认提供的是挖数据（wapi）和天行数据（TianAPI）的实现。
 */
const Emoji = require("node-emoji")

export interface HotKey {
    key: string
    hot: number             // 热搜指数
    isHot?: boolean         // 热
    isExplosive?: boolean   // 爆
    isBoiled?: boolean      // 沸
    isNew?: boolean         // 新
}

// 默认使用WAPI查询。如果需要自定义查询实现，请参照WAPI实现或TianAPI实现编写。
import WAPIHotSearch from "./wapi"
import Interceptor from "../../Interceptor";
// import TianAPIWeiboHot from "./tianapi"

const weiboInterceptor = new Interceptor("weibo", context => {
    context.template.add("weibo.success", [
        "微博热搜有哪些：\n{hotSearch}",
        "现在的微博热搜：\n{hotSearch}",
    ])
})
    .title("微博热搜")
    .alias("看热搜")
    .alias("查热搜")
    .alias("热搜")
    .usage("查看最新最热的微博爆款热搜")
    .check((context, message) => {
        if (/^狗蛋/.test(message.text()) && /[查看有]?(微博)?热搜/.test(message.text())) return true
    }).handler(async (context) => {
        const hotSearchList = await WAPIHotSearch()
        // const hotSearchList = await TianAPIWeiboHot()
        return context.template.use("weibo.success", {
            hotSearch: hotSearchList
                .map(h => `${h.key}${h.isNew ? Emoji.get("new") : ""}${h.isHot ? Emoji.get("fire") : ""}${h.isExplosive ? Emoji.get("boom") : ""}${h.isBoiled ? Emoji.get("hotsprings") : ""}`)
                .join("\n")
        })
    })
export default weiboInterceptor
