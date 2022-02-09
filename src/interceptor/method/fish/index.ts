import { FileBox } from "file-box";
import Interceptor from "../../Interceptor";
import { moyu } from "./api";

const fishInterceptor = new Interceptor("fish")
  .title("摸鱼")
  .alias("fish")
  .check((context, message) => /^(狗蛋.*)?(摸鱼)/.test(message.text()))
  .handler(async (context, message) => {
    const { image, text } = moyu();
    const fileBox = FileBox.fromUrl(image)
    await message.say(fileBox);
    await message.say(text);
    return '';
  });

export default fishInterceptor
