import Interceptor from "../../Interceptor";
import { getCities, getCovidData, getPolicy } from "./api";

const covidInterceptor = new Interceptor("covid")
  .title("疫情查询")
  .alias("covid")
  .check((context, message) => /^(狗蛋.*)?(.*)疫情/.test(message.text()))
  .handler(async (context, message) => {
    message.say('正在获取中...');
    const text = message.text();
    let city = text.replace('疫情', '');
    const hasPolicy = city.includes('政策');
    let policy = 'Tips: 查询出行政策可加上 `政策`'
    city = city.replace('政策', '');

    if (hasPolicy) {
      const cities = getCities();
      const cid = cities[city];
      policy = await getPolicy(cid);
    }

    const covid = getCovidData();
    const data = covid[city];
    if (data) {
      const grade = data.total.grade || '风险未确认';
      const msg = `**${city} 新冠肺炎疫情情况**  (${grade})\n\n😔新增确诊：${data.today.confirm}\n☢️现存确诊：${data.total.nowConfirm}\n\n${policy}`;
      message.say(msg);
    } else {
      message.say('只限查询国内城市或你地理没学好。');
    }
    
  });

export default covidInterceptor
