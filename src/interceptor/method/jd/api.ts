import Axios, { AxiosResponse } from 'axios';
import dayjs from 'dayjs';
import { getAPIKey } from '../../../lib/APIs/ZhetaokeAPI';

const axios = Axios.create();

export async function getWhitelistGroupIds() {
  const apiKey = getAPIKey('whitelistGroupIds');
  return apiKey.split(',');
}

export async function getPromotion(shareUrl: string) {
  const unionId = getAPIKey('unionId');
  const url = `https://api.jingpinku.com/get_powerful_coup_link/api?appid=2202081357006193&appkey=fnetlFHIz45dEYBFNOcBGn17X5nOlLft&union_id=${unionId}&content=${shareUrl}`;
  const { data } = await axios.get(url);
  if (data.code === 0 && data.content) {
    return { shortURL: data.content };
  }
  return {
    shortURL: '',
  };
}

export async function getHistoryPrice(shareUrl: string) {
  const url =
    'https://apapia-history.manmanbuy.com/ChromeWidgetServices/WidgetServices.ashx';
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    'User-Agent':
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_1_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 - mmbWebBrowse - ios',
  };
  const body = `methodName=getHistoryTrend&p_url=${shareUrl}`;
  const { data } = await axios.post(url, body, { headers });
  if (data.ok == 1 && data.single) {
    const detail = priceSummary(data);
    return {
      title: `【${data.single.zk_scname}】\n${data.single.title}`,
      history: detail.substring(1),
    };
  }
  return { title: '', history: '' };
}

function priceSummary(data) {
  let summary = '';
  let listPriceDetail = data.PriceRemark.ListPriceDetail;
  for (const item of listPriceDetail) {
    summary += `\n${item.Name}  ${item.Price}  ${item.Date}`;
  }
  return summary;
}
