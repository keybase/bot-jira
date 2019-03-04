// @flow
import Bot from 'keybase-bot'
import yargs from 'yargs-parser'
import * as Utils from './utils'
import { type Context } from './context'

type UnknownMessage = {|
  type: 'unknown',
  error?: ?string,
|}

type HelpMessage = {|
  type: 'help',
|}

export type CreateMessage = {|
  from: string,
  type: 'create',
  name: string,
  project: string,
  assignee: string,
  description: string,
|}

export type SearchMessage = {|
  from: string,
  type: 'search',
  query: string,
  project: string,
  status: string,
  assignee: string,
|}

export type CommentMessage = {|
  from: string,
  type: 'comment',
  query: string,
  project: string,
  status: string,
  assignee: string,
  comment: string,
|}

export type ReacjiMessage = {|
  from: string,
  type: 'reacji',
  reactToID: number,
  emoji: string,
|}

export type Message =
  | UnknownMessage
  | HelpMessage
  | SearchMessage
  | CommentMessage
  | ReacjiMessage
  | CreateMessage

const cmdRE = new RegExp(/(?:!kira)\s+(\S+)(?:\s+(\S+))?(?:\s+(.*))?/)

const isKiraMessage = message =>
  message &&
  message.content &&
  message.content.type === 'text' &&
  typeof message.content.text.body === 'string' &&
  message.content.text.body.startsWith('!kira')

const isKiraReaction = message =>
  message && message.content && message.content.type === 'reaction'

const yargsOptions = {
  alias: {
    project: ['p'],
  },
  string: ['project', 'status', 'assignee'],
}

const validateOptions = (context, parsed) => {
  const project = parsed.project ? parsed.project.toLowerCase() : ''
  const status = parsed.status ? parsed.status.toLowerCase() : ''
  const assignee = parsed.assignee ? parsed.assignee.toLowerCase() : ''
  if (project && !context.config.jira.projects.includes(project)) {
    return {
      project: '',
      status: '',
      assignee: '',
      error: `invalid project: ${project} is not one of ${Utils.humanReadableArray(
        context.config.jira.projects
      )}`,
    }
  }

  if (status && !context.config.jira.status.includes(status)) {
    return {
      project: '',
      status: '',
      assignee: '',
      error: `invalid status: ${status} is not one of ${Utils.humanReadableArray(
        context.config.jira.status
      )}`,
    }
  }

  if (assignee && !context.config.jira.usernameMapper[assignee]) {
    return {
      project: '',
      status: '',
      assignee: '',
      error: `invalid assignee: ${assignee} is not one of ${Utils.humanReadableArray(
        Object.keys(context.config.jira.usernameMapper)
      )}`,
    }
  }

  return { project, status, assignee, error: null }
}

export const parseMessage = (
  context: Context,
  message: Bot.Message
): ?Message => {
  if (isKiraReaction(message)) {
    return {
      from: message.sender.username,
      type: 'reacji',
      reactToID: message.content.reaction.m,
      emoji: message.content.reaction.b,
    }
  }

  if (!isKiraMessage(message)) {
    return null
  }

  const parsed = yargs(Utils.split2(message.content.text.body), yargsOptions)

  const { project, status, assignee, error } = validateOptions(context, parsed)

  if (error) {
    return { type: 'unknown', error }
  }

  switch (parsed._[1]) {
    case 'help':
      return { type: 'help' }
    case 'search':
      if (parsed._.length < 3) {
        return { type: 'unknown', error: 'search need at least 1 arg' }
      }
      return {
        from: message.sender.username,
        type: 'search',
        query: parsed._.slice(2).join(' '),
        project,
        assignee,
        status,
      }
    case 'comment':
      if (parsed._.length < 4) {
        return { type: 'unknown', error: 'comment need at least 2 args' }
      }
      return {
        from: message.sender.username,
        type: 'comment',
        query: parsed._[2],
        project,
        assignee,
        status,
        comment: parsed._.slice(3).join(' '),
      }
    case 'create':
      if (parsed._.length < 4) {
        return { type: 'unknown', error: 'create need at least 2 args' }
      }
      if (!project) {
        return { type: 'unknown', error: 'create requires --project' }
      }
      return {
        from: message.sender.username,
        type: 'create',
        name: parsed._[2],
        project,
        assignee,
        description: parsed._.slice(3).join(' '),
      }
    default:
      return { type: 'unknown' }
  }
}
