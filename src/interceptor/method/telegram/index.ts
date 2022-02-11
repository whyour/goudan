import Interceptor from "../../Interceptor";
import { getGroupIds, sendBotMessage } from "./api";

const telegramInterceptor = new Interceptor("telegram")
  .title("电报")
  .alias("telegram")
  .check((context, message) => true)
  .handler(async (context, message) => {
    const text = message.text();
    const room = message.room();
    const contact = message.listener();
    if (room) {
      const groupIds = await getGroupIds();
      console.log('群组ID', room.id);
      if (groupIds.includes(room.id)) {
        sendBotMessage(text);
      }
    } else {
      console.log('联系人ID', contact.id);
    }
    return '';
  });

export default telegramInterceptor
