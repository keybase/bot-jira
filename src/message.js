// @flow
import Bot from 'keybase-bot'
import yargs from 'yargs-parser'
import * as Utils from './utils'

type UnknownMessage = {|
  type: 'unknown',
|}

type HelpMessage = {|
  type: 'help',
|}

export type SearchMessage = {|
  from: string,
  type: 'search',
  query: string,
  project: string,
  status: string,
|}

export type CommentMessage = {|
  from: string,
  type: 'comment',
  query: string,
  project: string,
  status: string,
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
  string: ['project', 'status'],
}

export const parseMessage = (message: Bot.Message): ?Message => {
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

  switch (parsed._[1]) {
    case 'help':
      return { type: 'help' }
    case 'search':
      if (parsed._.length < 3) {
        return { type: 'unknown' }
      }
      return {
        from: message.sender.username,
        type: 'search',
        query: parsed._.slice(2).join(' '),
        project: parsed.project,
        status: parsed.status,
      }
    case 'comment':
      if (parsed._.length < 4) {
        return { type: 'unknown' }
      }
      return {
        from: message.sender.username,
        type: 'comment',
        query: parsed._[2],
        project: parsed.project,
        status: parsed.status,
        comment: parsed._.slice(3).join(' '),
      }
    default:
      return { type: 'unknown' }
  }
}
