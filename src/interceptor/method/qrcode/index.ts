/**
 * 二维码
 */

import Interceptor from '../../Interceptor';
import { FileBox } from 'file-box';
import xml2js from 'xml2js';
import xmldom from 'xmldom';
import QrScanner from 'qr-scanner';

const qrcodeInterceptor = new Interceptor('qrcode', (context) => {
  context.template.add('qrcode.success', ['{content}']);
  context.template.add(
    'qrcode.failed',
    '哎呀，狗蛋获取二维码失败。等会再来试试？',
  );
})
  .title('二维码')
  .usage('二维码')
  .check(async (context, message) => {
    const text = message.text();
    let url = '';
    try {
      const parser = new xml2js.Parser({
        explicitArray: false,
        ignoreAttrs: true,
      });
      const result = await parser.parseStringPromise(text);
      return (
        (result.msg.appmsg.title === 'eq' ||
          result.msg.appmsg.title === 'uq') &&
        result.msg.appmsg.refermsg
      );
    } catch (error) {}
    return false;
  })
  .handler(async (context, message, checkerArgs) => {
    const text = message.text();
    try {
      const parser = new xml2js.Parser({
        explicitArray: false,
        ignoreAttrs: true,
      });
      const result = await parser.parseStringPromise(text);
      let content = result.msg.appmsg.refermsg.content;
      const isEncode = result.msg.appmsg.title === 'eq';

      let res = content;
      try {
        const xmlStringSerialized = new xmldom.DOMParser().parseFromString(
          content,
          'text/xml',
        );
        const refContent = await parser.parseStringPromise(xmlStringSerialized);
        res = isEncode
          ? refContent.msg.appmsg && refContent.msg.appmsg.url
          : refContent.msg;
      } catch (error) {}

      if (isEncode) {
        const fileBox = FileBox.fromUrl(
          `https://api.oick.cn/qrcode/api.php?text=${encodeURIComponent(res)}`,
        );
        await message.say(fileBox);
      } else {
        const text = await QrScanner.scanImage(res);
        await message.say(text);
      }
    } catch (error) {}
    return '';
  });

export default qrcodeInterceptor;
