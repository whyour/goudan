import { RouteHandler } from "../../router/routes";
import { success } from "../../ResponseGenerator";
import { startAt, wechaty } from "../../../bot";
import { FileBox } from 'wechaty';
// import { FileBox } from 'file-box';

const parse = (str: string) => {
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}

const handler: RouteHandler = async (req, res, data) => {
  let args = data ? parse(typeof data === "string" ? data : data.toString("utf-8")) : {}
  let result = null;
  if (!args) {
    args = {};
  }
  let content = args.image ? FileBox.fromBase64(args.image, '') : args.content;
  if (args.to && content) {
    if (args.type === 1) {
      result = await wechaty.Room.find({ id: args.to });
    } else {
      result = await wechaty.Contact.find({ id: args.to });
    }

    console.log('send', result);
    try {
      if (result) {
        await result.say(content);
      }
    } catch (error) {
      console.log('error', error);
    }
  }

  return success({
    result
  })
}

export default handler
