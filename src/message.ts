import ChatTypes from 'keybase-bot/lib/types/chat1'
// @ts-ignore
import yargs from 'yargs-parser'
import * as Utils from './utils'
import {Context} from './context'

export enum BotMessageType {
  Unknown = 'unknown',
  Help = 'help',
  Create = 'create',
  Search = 'search',
  Comment = 'comment',
  Reacji = 'reacji',
}

type UnknownMessage = {
  type: BotMessageType.Unknown
  error?: string
}

type HelpMessage = {
  type: BotMessageType.Help
}

export type CreateMessage = {
  from: string
  type: BotMessageType.Create
  name: string
  project: string
  assignee: string
  description: string
}

export type SearchMessage = {
  from: string
  type: BotMessageType.Search
  query: string
  project: string
  status: string
  assignee: string
}

export type CommentMessage = {
  from: string
  type: BotMessageType.Comment
  query: string
  project: string
  status: string
  assignee: string
  comment: string
}

export type ReacjiMessage = {
  from: string
  type: BotMessageType.Reacji
  reactToID: number
  emoji: string
}

export type Message = UnknownMessage | HelpMessage | SearchMessage | CommentMessage | ReacjiMessage | CreateMessage

const cmdRE = new RegExp(/(?:!jira)\s+(\S+)(?:\s+(\S+))?(?:\s+(.*))?/)

const getTextMessage = (message: ChatTypes.MsgSummary): ChatTypes.MessageText | undefined =>
  message && message.content && message.content.type === 'text' && message.content.text && typeof message.content.text.body === 'string'
    ? message.content.text
    : undefined

const getReactionMessage = (message: ChatTypes.MsgSummary): ChatTypes.MessageReaction =>
  (message && message.content && message.content.type === 'reaction' && message.content.reaction) || undefined

const yargsOptions = {
  alias: {
    project: ['p'],
  },
  string: ['project', 'status', 'assignee'],
}

const validateOptions = (context: Context, parsed: Message) => {
  // @ts-ignore
  const project = parsed.project ? parsed.project.toLowerCase() : ''
  // @ts-ignore
  const status = parsed.status ? parsed.status.toLowerCase() : ''
  // @ts-ignore
  const assignee = parsed.assignee ? parsed.assignee.toLowerCase() : ''
  if (project && !context.config.jira.projects.includes(project)) {
    return {
      project: '',
      status: '',
      assignee: '',
      error: `invalid project: ${project} is not one of ${Utils.humanReadableArray(context.config.jira.projects)}`,
    }
  }

  if (status && !context.config.jira.status.includes(status)) {
    return {
      project: '',
      status: '',
      assignee: '',
      error: `invalid status: ${status} is not one of ${Utils.humanReadableArray(context.config.jira.status)}`,
    }
  }

  if (assignee && !context.config.jira.usernameMapper[assignee]) {
    return {
      project: '',
      status: '',
      assignee: '',
      error: `invalid assignee: ${assignee} is not one of ${Utils.humanReadableArray(Object.keys(context.config.jira.usernameMapper))}`,
    }
  }

  return {project, status, assignee}
}

export const parseMessage = (context: Context, kbMessage: ChatTypes.MsgSummary): null | Message => {
  const reactionMessage = getReactionMessage(kbMessage)
  if (reactionMessage) {
    return {
      from: kbMessage.sender.username,
      type: BotMessageType.Reacji,
      reactToID: reactionMessage.m,
      emoji: reactionMessage.b,
    }
  }

  const textMessage = getTextMessage(kbMessage)
  if (!textMessage) {
    return null
  }

  const expandedMessageTextBody = context.aliases.expand(textMessage.body)

  if (!expandedMessageTextBody.startsWith('!jira')) {
    return null
  }

  const parsed = yargs(Utils.split2(expandedMessageTextBody), yargsOptions)

  const {project, status, assignee, error} = validateOptions(context, parsed)

  if (error) {
    return {type: BotMessageType.Unknown, error}
  }

  switch (parsed._[1]) {
    case 'help':
      return {type: BotMessageType.Help}
    case 'search':
      if (parsed._.length < 3) {
        return {type: BotMessageType.Unknown, error: 'search need at least 1 arg'}
      }
      return {
        from: kbMessage.sender.username,
        type: BotMessageType.Search,
        query: parsed._.slice(2).join(' '),
        project,
        assignee,
        status,
      }
    case 'comment':
      if (parsed._.length < 4) {
        return {type: BotMessageType.Unknown, error: 'comment need at least 2 args'}
      }
      return {
        from: kbMessage.sender.username,
        type: BotMessageType.Comment,
        query: parsed._[2],
        project,
        assignee,
        status,
        comment: parsed._.slice(3).join(' '),
      }
    case 'create':
      if (parsed._.length < 4) {
        return {type: BotMessageType.Unknown, error: 'create need at least 2 args'}
      }
      if (!project) {
        return {type: BotMessageType.Unknown, error: 'create requires --project'}
      }
      return {
        from: kbMessage.sender.username,
        type: BotMessageType.Create,
        name: parsed._[2],
        project,
        assignee,
        description: parsed._.slice(3).join(' '),
      }
    default:
      return {type: BotMessageType.Unknown}
  }
}
