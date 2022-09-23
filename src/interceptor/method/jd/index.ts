/**
 * 京东返利功能
 */

import Interceptor from "../../Interceptor";
import { getHistoryPrice, getPromotion, getWhitelistGroupIds } from "./api";
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
            // type 5 是转发链接， 36 是小程序链接
            if ([5, 36].includes(type)) {
                url = result.msg.appmsg.url;
            }
          
            // type 33 是直接从京东小程序分享链接
            if ([33].includes(type)) {
                const pagePath = result.msg.appmsg.weappinfo.pagepath;
                const pagePathRegx = /.*sku=(\d+)&/;
                if (pagePathRegx.test(pagePath)) {
                  url = `https://item.jd.com/${pagePath.match(pagePathRegx)[1]}.html`;
                }
            }
        } catch (error) {}
        // https://item.jd.com/100020837072.html
        // https://item.m.jd.com/product/52204923561.html
        // https://kpl.m.jd.com/product?wareId=43133951261
        // https://m.jingxi.com/item/view?sku=67677434900
        // https://wq.jd.com/item/view?sku=67677434900
        // https://u.jd.com/0CMGTMh
        // https://mitem.jkcsjd.com/product/66799436302.html
        // https://item.yiyaojd.com/2943430.html
        const jdRegx = /https:\/\/item.jd.com\/\d+\.html.*/
        const jdMobileRegx = /https:\/\/item.m.jd.com\/product\/\d+\.html.*/
        const jdKplRegx = /https:\/\/kpl.m.jd.com\/product\?wareId=\d+.*/
        const jxRegx = /https:\/\/m.jingxi.com\/item\/view\?sku=\d+.*/
        const jdRegx2 = /https:\/\/wq.jd.com\/item\/view\?sku=\d+.*/
        const jdUnionRegx = /https:\/\/u.jd.com\/.*/
        const jdHealthMobileRegx = /https:\/\/mitem.jkcsjd.com\/product\/\d+\.html.*/
        const jdHealthRegx = /https:\/\/item.yiyaojd.com\/\d+\.html.*/
        const regxs = [jdRegx, jdMobileRegx, jdKplRegx, jxRegx, jdRegx2, jdUnionRegx, jdHealthMobileRegx, jdHealthRegx];

        const groupIds = await getWhitelistGroupIds();
        const room = message.room();
        if (regxs.some(x => x.test(url)) && (!room || (room && groupIds.includes(room.id)))) {
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
        if (result || promotion) {
            let titleStr = '';
            if (result.title) {
                titleStr = `${result.title} \n\n`;
            }
            if (promotion.shortURL) {
                titleStr += `${promotion.shortURL}\n\n`;
            }
            msg += `${titleStr}${result.history}`;
            return context.template.use("jd.success", {
                content: msg
            });
        }
        return context.template.use("jd.failed");
    })

export default jdInterceptor
