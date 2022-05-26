/**
 * 二维码
 */

import Interceptor from "../../Interceptor";
import { FileBox } from 'file-box';

const qrcodeInterceptor = new Interceptor("qrcode", context => {
    context.template.add("qrcode.success", [
        "{content}",
    ])
    context.template.add("qrcode.failed", "哎呀，狗蛋获取二维码失败。等会再来试试？")
})
    .title("二维码")
    .usage("二维码")
    .check(async (context, message) => {
        const text = message.text();
        return text.startsWith('qr\n「');
    })
    .handler(async (context, message, checkerArgs) => {
        const text = message.text();
        const orginText = text.replace(/qr\n「.*：(.*\n*)」/, '$1');
        const fileBox = FileBox.fromQRCode(orginText)
        await message.say(fileBox)
        return '';
    })

export default qrcodeInterceptor
