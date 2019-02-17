// @flow
import Bot from 'keybase-bot'
import { numToEmoji } from './emoji'
import { getOrSearch } from './search'
import type { CommentMessage } from './message'
import type { Context } from './context'

const reactNum = (context: Context, channel, id, num, until) =>
  num < until &&
  context.bot.chat
    .react(channel, id, numToEmoji(num))
    .then(() => reactNum(context, channel, id, num + 1, until))

export default (
  context: Context,
  channel: Bot.ChatChannel,
  parsedMessage: CommentMessage
) =>
  getOrSearch(
    context,
    channel,
    parsedMessage,
    'To confirm commenting, click on emojis below in the next 2 minutes:'
  ).then(({ count, id, issues }) => {
    context.comment.add(id, parsedMessage, issues)
    reactNum(context, channel, id, 0, count)
  })
