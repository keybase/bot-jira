import BotChatClientTypes from 'keybase-bot/lib/chat-client/types'
import {numToEmoji} from './emoji'
import {getOrSearch} from './search'
import {CommentMessage} from './message'
import {Context} from './context'

const reactNum = (context: Context, channel: BotChatClientTypes.ChatChannel, id: number, num: number, until: number): void => {
  num < until && context.bot.chat.react(channel, id, numToEmoji(num)).then(() => reactNum(context, channel, id, num + 1, until))
}

export default (context: Context, channel: BotChatClientTypes.ChatChannel, parsedMessage: CommentMessage) =>
  getOrSearch(context, channel, parsedMessage, 'To confirm commenting, click on emojis below in the next 2 minutes:').then(
    ({count, id, issues}) => {
      context.comment.add(id, parsedMessage, issues)
      reactNum(context, channel, id, 0, count)
    }
  )
