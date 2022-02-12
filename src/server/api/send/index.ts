import { RouteHandler } from "../../router/routes";
import { success } from "../../ResponseGenerator";
import { startAt, wechaty } from "../../../bot";

const parse = (str: string) => {
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}

const handler: RouteHandler = async (req, res, data) => {
  const args = data ? parse(typeof data === "string" ? data : data.toString("utf-8")) : {}
  let result = null;
  if (args.to && args.content) {
    if (args.type === 1) {
      result = await wechaty.Room.find({ id: args.to });
    } else {
      result = await wechaty.Contact.find({ id: args.to });
    }
    console.log('send', result, args);
    result && result.say(args.content);
  }

  return success({
    result
  })
}

export default handler
