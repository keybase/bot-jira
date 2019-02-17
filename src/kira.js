// @flow
import Bot from 'keybase-bot'
import * as Config from '../config'
import * as Message from './message'
import search from './search'
import comment from './comment'
import reacji from './reacji'
import Context, { type Context as ContextType } from './context'

const sendHelp = (context, channel) =>
  context.bot.chat.send(channel, {
    body:
      'Usage: \n' +
      '  `!kira search <query>`\n' +
      '  `!kira comment <query> <your comment>`\n',
  })

const reactAck = (context, channel: Bot.ChatChannel, id: number) =>
  context.bot.chat.react(channel, id, ':eyes:')

const makeOnMessage = context => kbMessage => {
  console.debug(kbMessage)
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

export default (context: ContextType) =>
  context.bot
    .init(Config.keybase.username, Config.keybase.paperkey, { verbose: true })
    .then(() =>
      Config.keybase.channels.forEach(channel =>
        context.bot.chat.watchChannelForNewMessages(
          channel,
          makeOnMessage(context)
        )
      )
    )
