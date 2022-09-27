import axios from "axios";
import { FileBox } from "file-box";
import Interceptor from "../../Interceptor";
import { genText, getImage, getMoyuImage } from "./api";
import fs from "fs";
import path from "path";
import { __tmp_dir } from "../../../bot";

const fishInterceptor = new Interceptor("fish")
  .title("摸鱼")
  .alias("fish")
  .check((context, message) => /^(狗蛋.*)?(摸鱼)/.test(message.text()))
  .handler(async (context, message) => {
    const image = await getMoyuImage();
    const res = await axios.get(image, {
      responseType: 'arraybuffer',
    })
    const uid = Date.now()
    const filePath = path.join(__tmp_dir, `${uid}.png`);
    await fs.promises.writeFile(filePath, res.data, 'binary');
    const fileBox = FileBox.fromFile(filePath)
    await message.say(fileBox);
    await fs.promises.unlink(filePath);
    return '';
  });

export default fishInterceptor
