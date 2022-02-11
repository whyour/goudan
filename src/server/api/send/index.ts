import { RouteHandler } from "../../router/routes";
import { success } from "../../ResponseGenerator";
import { startAt, wechaty } from "../../../bot";
import { mp } from "../../../interceptor";

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
    let sayer: any = wechaty.Contact;
    if (args.type === 1) sayer = wechaty.Room;
    result = await sayer.find({ id: args.to });
    result.say(args.content);
  }

  return success({
    result
  })
}

export default handler
