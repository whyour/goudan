import Axios, { AxiosResponse } from "axios";

const axios = Axios.create()

export async function sentence() {
  const url = "https://v2.jinrishici.com/sentence"
  const headers = {
    "X-User-Token": "GLhYWRbpB6e6bV0hrDElpGarj0LTWGpM",
  };
  const { data: { data } } = await axios.get(url, { headers });
  return data.content;
}

export async function getPoint() {
  const url = "https://avoscloud.com/1.1/call/getChannelPosts2";
  const headers = {
    Accept: "application/json",
    "Accept-Encoding": "gzip",
    Connection: "keep-alive",
    "Content-Type": "application/json; charset=utf-8",
    Host: "avoscloud.com",
    "X-LC-Sign": "0476b2be2d819ab7c1a9fb11685bf2e5,1614227265474",
    "Accept-Language": "zh-Hans-CN;q=1, en-CN;q=0.9",
    "User-Agent": "LeanCloud-Objc-SDK/12.3.0",
    "X-LC-Id": "9pq709je4y36ubi10xphdpovula77enqrz27idozgry7x644",
    "X-LC-Prod": "1",
  };
  const body = {
    tr: false,
    perPage: 15,
    channelId: "56ebd926f3609a00545a5a73",
    page: 1,
  };
  const { data: { result } } = await axios.post(
    url,
    body,
    { headers }
  );
  return result[0].text;
}
