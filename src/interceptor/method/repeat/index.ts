import Interceptor from "../../Interceptor";
import { __tmp_dir } from "../../../bot";
import xml2js from 'xml2js';
import xmldom from 'xmldom';

const fishInterceptor = new Interceptor("repeat")
  .title("复读机")
  .alias("repeat")
  .check(async (context, message) => {
    const text = message.text();
    try {
      const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
      const result = await parser.parseStringPromise(text);
      if ((result.msg.appmsg.title.startsWith('re ')) && result.msg.appmsg.refermsg) {
        return { appMsg: result.msg.appmsg };
      }
    } catch (error) { }
    return false;
  })
  .handler(async (context, message, checkerArgs) => {
    const { appMsg: { refermsg, title } } = checkerArgs
    const regx = /re (\d+)/;
    if (regx.test(title)) {
      let content = refermsg.content
      if (content.includes('<msg>')) {
        const xmlStringSerialized = new xmldom.DOMParser().parseFromString(content, "text/xml");
        const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
        const refContent = await parser.parseStringPromise(xmlStringSerialized);
        content = refContent?.msg?.appmsg?.title
      }
      const times = parseInt(title.match(regx)[1], 10);
      for (let i = 0; i < times; i++) {
        await message.say(content);
      }
    }
    return '';
  });

export default fishInterceptor
