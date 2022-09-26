import Interceptor from '../../Interceptor';
import { getGroupIds, sendBotMessage, getContactIds } from './api';

const telegramInterceptor = new Interceptor('telegram')
  .title('电报')
  .alias('telegram')
  .check((context, message) => true)
  .handler(async (context, message) => {
    const text = message.text();
    const room = message.room();
    const contact = message.talker();
    if (room) {
      const groupIds = await getGroupIds();
      console.log('群组ID', room.id);
      if (groupIds.includes(room.id)) {
        sendBotMessage(text);
      }
    } else {
      const contactIds = await getContactIds();
      console.log('联系人ID', contact.id);
      if (contactIds.includes(contact.id)) {
        sendBotMessage(text);
      }
    }
    return '';
  });

export default telegramInterceptor;
