// @flow
import type { ReacjiMessage } from './message'
import { emojiToNum } from './emoji'
import Bot from 'keybase-bot'
import type { Context } from './context'

const kb2jira = (context, kb) => context.config.jira.usernameMapper[kb] || kb

export default (
  context: Context,
  channel: Bot.ChatChannel,
  parsedMessage: ReacjiMessage
) => {
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
    `Comment by ${kb2jira(context, item.message.from)}` +
    (item.message.from === parsedMessage.from
      ? ': '
      : ` (confirmed by ${kb2jira(context, parsedMessage.from)}): `) +
    item.message.comment
  return context.jira.addComment(issueKey, comment).then(url =>
    context.bot.chat.send(channel, {
      body: `@${parsedMessage.from} Done! ${url}`,
    })
  )
}
