// @flow
import Bot from 'keybase-bot'
import * as Message from './message'
import search from './search'
import comment from './comment'
import reacji from './reacji'
import create from './create'
import { type Context } from './context'
import * as Utils from './utils'

const sendHelp = (context, channel) =>
  context.bot.chat.send(channel, {
    body:
      'Usage: \n' +
      '  `!kira search <query>`\n' +
      '  `!kira comment <query|"multi word query"> <your comment>`\n' +
      '  `!kira create --project=<PROJECT> [--assignee=<kb username>] <summary|"multi word summary"> <description>`\n' +
      'Options: \n' +
      '  `-p`, `--project`: only search for specific project ' +
      `${Utils.humanReadableArray(context.config.jira.projects)}\n` +
      '  `--status`: only search for tickets in specific status ' +
      `${Utils.humanReadableArray(context.config.jira.status)}\n` +
      '  `--assignee`: only search for tickets assigned to specified person (keybase username) ' +
      `${Utils.humanReadableArray(
        Object.keys(context.config.jira.usernameMapper)
      )}\n`,
  })

const reactAck = (context, channel: Bot.ChatChannel, id: number) =>
  context.bot.chat.react(channel, id, ':eyes:')

const onMessage = (context, kbMessage) => {
  try {
    //console.debug(kbMessage)
    const parsedMessage = Message.parseMessage(context, kbMessage)
    console.debug({ msg: 'got message', parsedMessage })
    if (!parsedMessage) {
      // not a kira message
      return
    }
    switch (parsedMessage.type) {
      case 'unknown':
      case 'help':
        sendHelp(context, kbMessage.channel)
        return
      case 'search':
        reactAck(context, kbMessage.channel, kbMessage.id)
        search(context, kbMessage.channel, parsedMessage)
        return
      case 'comment':
        reactAck(context, kbMessage.channel, kbMessage.id)
        comment(context, kbMessage.channel, parsedMessage)
        return
      case 'reacji':
        reacji(context, kbMessage.channel, parsedMessage)
        return
      case 'create':
        create(context, kbMessage.channel, parsedMessage)
        return
      default:
        console.error({ error: 'how could this happen' })
        return
    }
  } catch (err) {
    console.error(err)
  }
}

const equalChatChannel = (c1, c2) =>
  ['name', 'public', 'membersType', 'topicType', 'topicName'].reduce(
    (equal, key) => c1[key] === c2[key],
    true
  )

export default (context: Context) => {
  context.bot.chat.watchAllChannelsForNewMessages(
    message =>
      context.config.keybase.channels.some(channel =>
        equalChatChannel(channel, message.channel)
      ) && onMessage(context, message)
  )
}
