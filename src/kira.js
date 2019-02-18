// @flow
import Bot from 'keybase-bot'
import * as Message from './message'
import search from './search'
import comment from './comment'
import reacji from './reacji'
import { type Context } from './context'

const sendHelp = (context, channel) =>
  context.bot.chat.send(channel, {
    body:
      'Usage: \n' +
      '  `!kira search <query>`\n' +
      '  `!kira comment <query> <your comment>`\n',
  })

const reactAck = (context, channel: Bot.ChatChannel, id: number) =>
  context.bot.chat.react(channel, id, ':eyes:')

const onMessage = (context, kbMessage) => {
  // console.debug(kbMessage)
  const parsedMessage = Message.parseMessage(kbMessage)
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
    default:
      console.error({ error: 'how could this happen' })
      return
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
