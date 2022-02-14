import Axios, { AxiosResponse } from "axios";
import fs from "fs";
import path from "path";
import { __data_dir } from "../../../bot";

const axios = Axios.create()

export async function getPolicy(uid: string) {
  const url = `https://r.inews.qq.com/api/trackmap/citypolicy?&city_id=${uid}`;
  const { data: { message, result } } = await axios.get(url);

  if (message !== 'success') {
    return '数据获取失败！';
  } else {
    try {
      const data = result.data[0];
      const msg = `出行(${data['leave_policy_date']})\n${data['leave_policy']}\n\
      ------\n\
      进入(${data['back_policy_date']})\n${data['back_policy']}`
    } catch (IndexError) {
      return '暂无政策信息';
    }
  }
}

export function getCities() {
  const cities = fs.readFileSync(path.join(__data_dir, "./city/city.json"), "utf-8");
  const cityData = (JSON.parse(cities) as any);
  return cityData;
}

export async function getCovidData() {
  const url = "https://view.inews.qq.com/g2/getOnsInfo?name=disease_h5"
  let { data: { ret, data } } = await axios.get(url);
  data = JSON.parse(data);
  const areaData = data.areaTree;
  const covid = {};

  for (let area of areaData) {
    const { children, name } = area;
    covid[name] = area;
    if (children && children.length > 0) {
      for (let _area of children) {
        const _name = _area.name;
        covid[_name] = _area;
      }
    }
  }

  return covid;
}
