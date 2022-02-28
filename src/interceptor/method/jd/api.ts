import Axios, { AxiosResponse } from "axios";
import dayjs from "dayjs";
import { getAPIKey } from "../../../lib/APIs/ZhetaokeAPI";

const axios = Axios.create();

export async function getPromotion(shareUrl: string) {
    const apiKey = getAPIKey("zhetaoke");
    const unionId = getAPIKey("unionId");
    const url = `https://api.zhetaoke.com:10001/api/open_jing_union_open_promotion_byunionid_get.ashx?appkey=${apiKey}&materialId=${shareUrl}&unionId=${unionId}&positionId=&chainType=3`;
    const { data } = await axios.post(
        url,
    );
    if (data.jd_union_open_promotion_byunionid_get_response) {
        const body = JSON.parse(data.jd_union_open_promotion_byunionid_get_response.result);
        if (body.code === 200) {
            return body.data;
        }
    }
    return null;
}

export async function getHistoryPrice(shareUrl: string) {
    const url = "https://apapia-history.manmanbuy.com/ChromeWidgetServices/WidgetServices.ashx";
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 13_1_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 - mmbWebBrowse - ios",
    }
    const body = `methodName=getHistoryTrend&p_url=${shareUrl}`
    const { data } = await axios.post(
        url,
        body,
        { headers }
    );
    if (data.ok == 1 && data.single) {
        const lower = lowerMsgs(data.single);
        const detail = priceSummary(data);
        const currentPrice =  data.recentlyZK ? `当前价 ¥${data.recentlyZK.originprice}   到手价 ¥${data.recentlyZK.currentprice}` : ''
        return {
            lowerestPrice: `${lower}\n`,
            historyDetail: detail.substring(1),
            current: `【${data.single.zk_scname}】\n${data.single.title}\n\n${currentPrice}`
        };
    }
    if (data.ok == 0 && data.msg.length > 0) {
        let e = `😳 ${data.msg}`;
        return e;
    }

    return '';
}

function lowerMsgs(data) {
    const lower = data.lowerPriceyh;
    const lowerDate = dayjs(parseInt(data.lowerDateyh.replace("/Date(", "").replace(")/", ""), 10)).format('YYYY-MM-DD');
    const lowerMsg = `〽️ 历史最低  ${lower}   ${lowerDate}`;
    return lowerMsg;
}

function priceSummary(data) {
    let summary = "";
    let listPriceDetail = data.PriceRemark.ListPriceDetail.slice(2, 4);
    let list = listPriceDetail.concat(historySummary(data.single));
    for (const item of list) {
        let price = parseInt(item.Price.substr(1));
        summary += `\n${item.Name}  ${isNaN(price) ? "-" : "¥" + price}   ${item.Date}`;
    }
    return summary;
}

function historySummary(single) {
    const rexMatch = /\[.*?\]/g;
    const rexExec = /\[(.*),(.*),"(.*)".*\]/;
    let currentPrice, lowest30, lowest90, lowest180;
    let list = single.jiagequshiyh.match(rexMatch).reverse().slice(0, 360);
    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (item.length > 0) {
            const result = rexExec.exec(item);
            const date = dayjs(eval(result[1])).format('YYYY-MM-DD');
            let price = parseFloat(result[2]);
            if (i == 0) {
                currentPrice = price;
                lowest30 = {
                    Name: "30天最低",
                    Price: `¥${String(price)}`,
                    Date: date,
                    Difference: difference(currentPrice, price),
                    price,
                };
                lowest90 = {
                    Name: "90天最低",
                    Price: `¥${String(price)}`,
                    Date: date,
                    Difference: difference(currentPrice, price),
                    price,
                };
                lowest180 = {
                    Name: "180天最低",
                    Price: `¥${String(price)}`,
                    Date: date,
                    Difference: difference(currentPrice, price),
                    price,
                };
            }
            if (i < 30 && price < lowest30.price) {
                lowest30.price = price;
                lowest30.Price = `¥${String(price)}`;
                lowest30.Date = date;
                lowest30.Difference = difference(currentPrice, price);
            }
            if (i < 90 && price < lowest90.price) {
                lowest90.price = price;
                lowest90.Price = `¥${String(price)}`;
                lowest90.Date = date;
                lowest90.Difference = difference(currentPrice, price);
            }
            if (i < 180 && price < lowest180.price) {
                lowest180.price = price;
                lowest180.Price = `¥${String(price)}`;
                lowest180.Date = date;
                lowest180.Difference = difference(currentPrice, price);
            }
        }
    }
    return [lowest30, lowest90, lowest180];
}

function difference(currentPrice: number, price: number) {
    let arg1Arr = currentPrice.toString().split(".");
    let arg2Arr = price.toString().split(".");
    let d1 = arg1Arr.length == 2 ? arg1Arr[1] : "";
    let d2 = arg2Arr.length == 2 ? arg2Arr[1] : "";
    const maxLen = Math.max(d1.length, d2.length);
    const m = Math.pow(10, maxLen);
    const differencePrice = Number(((currentPrice * m - price * m) / m));
    if (differencePrice === 0) {
        return "-";
    } else {
        return `${differencePrice > 0 ? "↑" : "↓"}${differencePrice.toFixed(maxLen).slice(1)}`;
    }
}
