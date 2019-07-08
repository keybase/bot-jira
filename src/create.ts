import BotChatClientTypes from 'keybase-bot/lib/chat-client/types'
import {numToEmoji} from './emoji'
import {getOrSearch} from './search'
import {CreateMessage} from './message'
import {Context} from './context'

export default (context: Context, channel: BotChatClientTypes.ChatChannel, parsedMessage: CreateMessage) =>
  context.jira
    .createIssue({
      assigneeJira: context.config.jira.usernameMapper[parsedMessage.assignee] || '',
      project: parsedMessage.project,
      name: parsedMessage.name,
      description: `Reported by [~${context.config.jira.usernameMapper[parsedMessage.from]}]: \n` + parsedMessage.description,
    })
    .then(url =>
      context.bot.chat.send(channel, {
        body: 'Ticket created' + (parsedMessage.assignee ? ` for @${parsedMessage.assignee}` : '') + `: ${url}`,
      })
    )
