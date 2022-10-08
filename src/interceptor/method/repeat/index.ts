import Interceptor from "../../Interceptor";
import { __tmp_dir } from "../../../bot";
import xml2js from 'xml2js';

const fishInterceptor = new Interceptor("fish")
  .title("复读机")
  .alias("repeat")
  .check(async (context, message) => {
    const text = message.text();
    try {
      const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
      const result = await parser.parseStringPromise(text);
      if ((result.msg.appmsg.title.startsWith('re ')) && result.msg.appmsg.refermsg) {
        return { refMsg: result.msg.appmsg.refermsg };
      }
    } catch (error) { }
    return false;
  })
  .handler(async (context, message, checkerArgs) => {
    const text = message.text();
    const regx = /re (\d+)/;
    if (regx.test(text)) {
      const times = parseInt(text.match(regx)[1], 10);
      for (let i = 0; i < times; i++) {
        await message.say(checkerArgs.refMsg);
      }
    }
    return '';
  });

export default fishInterceptor
