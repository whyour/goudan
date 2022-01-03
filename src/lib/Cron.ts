import schedule from "node-schedule";
import { Wechaty } from "wechaty";
import { FileBox } from 'file-box'
import { getPoint } from "../interceptor/method/poetry/api";
import caiyunWeather, { skyconDict, toWindDirectionDesc, toWindSpeedDesc } from "../interceptor/method/weather/caiyunapi";
import { place } from "./APIs/CaiyunAPI";

const timeImages = {
  1: "https://s4.ax1x.com/2021/12/29/T2FjZ8.jpg",
  2: "https://s4.ax1x.com/2021/12/29/T2FxIg.jpg",
  3: "https://s4.ax1x.com/2021/12/29/T2FLsP.jpg",
  4: "https://s4.ax1x.com/2021/12/29/T2FvdS.jpg",
  5: "https://s4.ax1x.com/2021/12/29/T2FOqf.jpg",
  6: "https://s4.ax1x.com/2021/12/29/T2kSiQ.jpg",
  7: "https://s4.ax1x.com/2021/12/29/T2kpGj.jpg",
  8: "https://s4.ax1x.com/2021/12/29/T2k9Rs.jpg",
  9: "https://s4.ax1x.com/2021/12/29/T2kCzn.jpg",
  10: "https://s4.ax1x.com/2021/12/29/T2kiMq.jpg",
  11: "https://s4.ax1x.com/2021/12/29/T2kFs0.jpg",
  12: "https://s4.ax1x.com/2021/12/29/T2kkLV.jpg"
};

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

  schedule.scheduleJob("0 30 7 * * *", async () => {
    let room = await bot.Room.find({ topic: '纵贯线' });
    try {
      const text = await weather('朝阳区');
      await room.say(text);
    } catch (e) {
      console.log(e.message);
    }
  });

  schedule.scheduleJob("1 30 7 * * *", async () => {
    let room = await bot.Room.find({ topic: '纵贯线' });
    try {
      const text = await weather('福田区');
      await room.say(text);
    } catch (e) {
      console.log(e.message);
    }
  });

  schedule.scheduleJob("2 30 7 * * *", async () => {
    let room = await bot.Room.find({ topic: '纵贯线' });
    try {
      const text = await weather('永康');
      await room.say(text);
    } catch (e) {
      console.log(e.message);
    }
  });

  schedule.scheduleJob("0 0 8-22 * * *", async () => {
    let room = await bot.Room.find({ topic: '纵贯线' });
    try {
      let hour = new Date().getHours();
      if (hour > 12) hour = hour - 12;
      const fileBox = FileBox.fromUrl(timeImages[hour]);
      await room.say(fileBox)
    } catch (e) {
      console.log(e.message);
    }
  });

} 

async function weather(pos) {
  const location = await place(pos);
  const data = await caiyunWeather(location.location.lng, location.location.lat);
  const str = `${location.name}（${location.address}）的实时天气情况：\n${skyconDict[data.result.realtime.skycon]}\n温度：${data.result.realtime.temperature}℃\n体感温度：${data.result.realtime.apparent_temperature}℃\n空气质量：${data.result.realtime.air_quality.aqi.chn}（${data.result.realtime.air_quality.description.chn}）\n舒适指数：${data.result.realtime.life_index.comfort.index}（${data.result.realtime.life_index.comfort.desc}）\n紫外线指数：${data.result.realtime.life_index.ultraviolet.index}（${data.result.realtime.life_index.ultraviolet.desc}）\n风力：${toWindSpeedDesc(data.result.realtime.wind.speed)}\n风向：${toWindDirectionDesc(data.result.realtime.wind.direction)}\n以上数据来源于彩云天气`;
  return str;
}
