import Axios from 'axios';
import fs from 'fs';
import path from 'path';
import { mkdirSync } from '../src/lib/Util';
const axios = Axios.create();

async function getCities(): Promise<any> {
  const covid = {};
  const url = 'https://r.inews.qq.com/api/trackmap/citylist';
  const {
    data: { result },
  } = await axios.get(url);
  for (let province of result) {
    const { list } = province;
    if (list && list.length > 0) {
      for (let city of list) {
        const cid = city.id;
        const name = city.name;
        covid[name] = cid;
      }
    }
  }
  return covid;
}

getCities().then((covid) => {
  mkdirSync(path.join(__dirname, '../data/city'));
  fs.writeFileSync(
    path.join(__dirname, '../data/city/city.json'),
    JSON.stringify(covid),
    {
      encoding: 'utf-8',
    },
  );
  console.log(`已写入 ${Object.keys(covid).length} 个城市。`);
});
