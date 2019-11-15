import ChatTypes from 'keybase-bot/lib/types/chat1'
import {ReacjiMessage} from './message'
import {emojiToNum} from './emoji'
import {Context} from './context'

const kb2jiraMention = (context: Context, kb: string) =>
  context.config.jira.usernameMapper[kb] ? `[~${context.config.jira.usernameMapper[kb]}]` : kb

export default (context: Context, channel: ChatTypes.ChatChannel, parsedMessage: ReacjiMessage) => {
  const item = context.comment.get(parsedMessage.reactToID)
  if (!item) {
    return
  }

  if (parsedMessage.from === context.config.keybase.username) {
    // We never get our own reacji as of now, but just in case ...
    return
  }

  const num = emojiToNum(parsedMessage.emoji)
  if (typeof num !== 'number') {
    return
  }
  if (num >= item.issues.length) {
    return
  }

  const issueKey = item.issues[num].key
  const comment =
    `Comment by ${kb2jiraMention(context, item.message.from)}` +
    (item.message.from === parsedMessage.from ? ': ' : ` (confirmed by ${kb2jiraMention(context, parsedMessage.from)}): `) +
    item.message.comment
  return context.jira.addComment(issueKey, comment).then(url =>
    context.bot.chat.send(channel, {
      body: `@${parsedMessage.from} Done! ${url}`,
    })
  )
}
