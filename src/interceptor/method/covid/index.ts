import Interceptor from "../../Interceptor";
import { getWhitelistGroupIds } from "../jd/api";
import { getCities, getCovidData, getPolicy } from "./api";

const covidInterceptor = new Interceptor("covid")
  .title("疫情查询")
  .alias("covid")
  .check(async (context, message) => {
    const groupIds = await getWhitelistGroupIds();
    const room = message.room();
    if (!room || (room && groupIds.includes(room.id))) {
      return /^(狗蛋.*)?(.*)疫情/.test(message.text());
    }
    return false
  })
  .handler(async (context, message) => {
    message.say('正在获取中...');
    const text = message.text();
    let city = text.replace('疫情', '');
    const hasPolicy = city.includes('政策');
    let policy = 'Tips: 查询出行政策可加上【政策】'
    city = city.replace('政策', '');

    if (hasPolicy) {
      const cities = getCities();
      const cid = cities[city];
      policy = await getPolicy(cid);
    }

    const covid = await getCovidData();
    const data = covid[city];
    if (data) {
      const grade = data.total.grade || '风险未确认';
      const msg = `${city} 新冠肺炎疫情情况  (${grade})\n\n😔新增确诊：${data.today.confirm}\n☢️现存确诊：${data.total.nowConfirm}\n\n${policy}`;
      message.say(msg);
    } else {
      message.say('只限查询国内城市或你地理没学好。');
    }

    return ''
  });

export default covidInterceptor
