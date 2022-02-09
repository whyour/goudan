/**
 * 京东返利功能
 */

import Interceptor from "../../Interceptor";
import { getHistoryPrice, getPromotion } from "./api";
import xml2js from 'xml2js';

const jdInterceptor = new Interceptor("jd", context => {
    context.template.add("jd.success", [
        "{content}",
    ])
    context.template.add("jd.failed", "哎呀，狗蛋获取返利链接失败。等会再来试试？")
})
    .title("京东返利")
    .usage("京东返利")
    .check(async (context, message) => {
        const text = message.text();
        let url = text;
        try {
            const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
            const result = await parser.parseStringPromise(text);
            const type = parseInt(result.msg.appmsg.type, 10);
            if (type === 5) {
                url = result.msg.appmsg.url;
            }
        } catch (error) {}
        // https://item.jd.com/100020837072.html
        // https://item.m.jd.com/product/52204923561.html
        // https://kpl.m.jd.com/product?wareId=43133951261
        // https://m.jingxi.com/item/view?sku=67677434900
        // https://u.jd.com/0CMGTMh
        const jdRegx = /^https:\/\/item.jd.com\/\d+\.html.*/
        const jdMobileRegx = /^https:\/\/item.m.jd.com\/product\/\d+\.html.*/
        const jdKplRegx = /^https:\/\/kpl.m.jd.com\/product\?wareId=\d+.*/
        const jxRegx = /^https:\/\/m.jingxi.com\/item\/view\?sku=\d+.*/
        const jdUnionRegx = /^https:\/\/u.jd.com\/.*/
        const regxs = [jdRegx, jdMobileRegx, jdKplRegx, jxRegx, jdUnionRegx];
        if (regxs.some(x => x.test(url))) {
            return { url };
        }
        return false;
    })
    .handler(async (context, message, checkerArgs) => {
        message.say('正在查询，请稍后...');
        const { url } = checkerArgs;
        const encodeUrl = encodeURIComponent(url);
        let msg = '';
        const [promotion, result] = await Promise.all([getPromotion(encodeUrl), getHistoryPrice(encodeUrl)])
        if (typeof result === 'string') {
            msg += result;
            if (promotion.shortURL) { 
                return context.template.use("jd.success", {
                    content: `转链成功：${promotion.shortURL}`
                });
            }
            return context.template.use("jd.failed");
        } else {
            msg += `${result.current}\n购买入口：${promotion.shortURL}\n${result.lowerestPrice}\n${result.historyDetail}`;
            return context.template.use("jd.success", {
                content: msg
            });
        }
    })

export default jdInterceptor
