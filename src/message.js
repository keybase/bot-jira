// @flow
import Bot from 'keybase-bot'

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
|}

export type CommentMessage = {|
  from: string,
  type: 'comment',
  query: string,
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

  const matches = message.content.text.body.match(cmdRE)
  if (!matches || matches.length < 2) {
    return { type: 'unknown' }
  }

  switch (matches[1]) {
    case 'help':
      return { type: 'help' }
    case 'search':
      if (matches.length < 3) {
        return { type: 'unknown' }
      }
      return {
        from: message.sender.username,
        type: 'search',
        query: matches[2],
      }
    case 'comment':
      if (matches.length < 4) {
        return { type: 'unknown' }
      }
      return {
        from: message.sender.username,
        type: 'comment',
        query: matches[2],
        comment: matches[3],
      }
    default:
      return { type: 'unknown' }
  }
}
