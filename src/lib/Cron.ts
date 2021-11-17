import schedule from "node-schedule";
import { Wechaty } from "wechaty";
import { getPoint } from "../interceptor/method/poetry/api";
import caiyunWeather, { skyconDict } from "../interceptor/method/weather/caiyunapi";
import { place } from "./APIs/CaiyunAPI";

export function initCron(bot: Wechaty) {
  schedule.scheduleJob("10 9 * * *", async () => {
    let room = await bot.Room.find({ topic: '纵贯线' });
    try {
      const text = await getPoint();
      await room.say(text);
    } catch (e) {
      console.log(e.message);
    }
  });

  schedule.scheduleJob("0 0 8 * * *", async () => {
    let room = await bot.Room.find({ topic: '纵贯线' });
    try {
      const text = await weather('朝阳区');
      await room.say(text);
    } catch (e) {
      console.log(e.message);
    }
  });

  schedule.scheduleJob("1 0 8 * * *", async () => {
    let room = await bot.Room.find({ topic: '纵贯线' });
    try {
      const text = await weather('福田区');
      await room.say(text);
    } catch (e) {
      console.log(e.message);
    }
  });

  schedule.scheduleJob("2 0 8 * * *", async () => {
    let room = await bot.Room.find({ topic: '纵贯线' });
    try {
      const text = await weather('永康');
      await room.say(text);
    } catch (e) {
      console.log(e.message);
    }
  });
}

async function weather(pos) {
  const location = await place(pos);
  const data = await caiyunWeather(location.location.lng, location.location.lat);
  const str = `${location.name}（${location.address}）的实时天气情况：\n${skyconDict[data.result.realtime.skycon]}\n温度：${data.result.realtime.temperature}℃\n体感温度：${data.result.realtime.apparent_temperature}℃\n空气质量：${data.result.realtime.air_quality.aqi.chn}（${data.result.realtime.air_quality.description.chn}）}\n舒适指数：${data.result.realtime.life_index.comfort.index}（${data.result.realtime.life_index.comfort.desc}）}\n紫外线指数：${data.result.realtime.life_index.ultraviolet.index}（${data.result.realtime.life_index.ultraviolet.desc}）}\n以上数据来源于彩云天气`;
  return str;
}