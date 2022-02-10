import Interceptor from "../../Interceptor";
import { getGroupIds, sendBotMessage } from "./api";

const telegramInterceptor = new Interceptor("telegram")
  .title("电报")
  .alias("telegram")
  .check((context, message) => true)
  .handler(async (context, message) => {
    const text = message.text();
    const room = message.room();
    if (room) {
      const groupIds = await getGroupIds();
      console.log(room.id);
      if (groupIds.includes(room.id)) {
        sendBotMessage(text);
      }
    }
    return '';
  });

export default telegramInterceptor
