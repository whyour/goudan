import schedule from "node-schedule";
import { Wechaty } from "wechaty";
import { getPoint } from "../interceptor/method/poetry/api";

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
}