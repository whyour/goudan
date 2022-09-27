import axios from "axios";
import { FileBox } from "file-box";
import Interceptor from "../../Interceptor";
import { genText, getImage, getMoyuImage } from "./api";
import fs from "fs";

const fishInterceptor = new Interceptor("fish")
  .title("摸鱼")
  .alias("fish")
  .check((context, message) => /^(狗蛋.*)?(摸鱼)/.test(message.text()))
  .handler(async (context, message) => {
    try {
      const image = await getMoyuImage();
      const res = await axios.get(image, {
        responseType: 'arraybuffer',
      })
      await fs.promises.writeFile(`./test.png`, res.data, 'binary');
      const fileBox = FileBox.fromFile('./test.png')
      await message.say(fileBox);
    } catch (error) {
      console.log(error);
    }
    // const text = genText();
    // await message.say(text);
    return '';
  });

export default fishInterceptor
