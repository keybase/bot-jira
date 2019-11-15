import ChatTypes from 'keybase-bot/lib/types/chat1'
import * as Message from './message'
import search from './search'
import comment from './comment'
import reacji from './reacji'
import create from './create'
import {Context} from './context'
import * as Utils from './utils'

const sendHelp = (context: Context, channel: ChatTypes.ChatChannel) =>
  context.bot.chat.send(channel, {
    body:
      '*Usage*: \n' +
      '    `!jira search <query>`\n' +
      '    `!jira comment <query|"multi word query"> <your comment>`\n' +
      '    `!jira create --project=<PROJECT> [--assignee=<kb username>] <summary|"multi word summary"> <description>`\n\n' +
      '*Options*: \n' +
      '    `-p`, `--project`: only search for specific project ' +
      `${Utils.humanReadableArray(context.config.jira.projects)}\n` +
      '    `--status`: only search for tickets in specific status ' +
      `${Utils.humanReadableArray(context.config.jira.status)}\n` +
      '    `--assignee`: only search for tickets assigned to specified person (keybase username) ' +
      `${Utils.humanReadableArray(Object.keys(context.config.jira.usernameMapper))}\n\n` +
      '*Examples*:\n' +
      '    `!jira search Rekey` -- single word keyword search\n' +
      '    `!jira search black bar` -- multiple word works too\n' +
      '    `!jira search --project desktop black bar` -- search in only DESKTOP\n' +
      '    `!jira search --assignee songgao black bar` -- search for only ones assigned to Song\n' +
      '    `!jira comment "TestBlahBlah" another flake: https://example.com` -- comment on ticket(s). I\'ll ask for confirmation before posting.\n' +
      '    `!jira comment KBFS-1234 test comment` -- issue key works too\n' +
      '    `!jira comment "TestBlahBlah flake" another flake: https://example.com` -- if non-last-argument is multi-word, just quote it\n' +
      '    `!jira comment --project kbfs --assignee songgao "TestBlahBlah" another flake: https://example.com` -- same args for search work here too\n' +
      '    `!jira create --project kbfs "ignore me this is a test" this is ticket descriptiong` -- create an unassigned ticket\n' +
      '    `!jira create --project kbfs --assignee songgao "ignore me this is a test" this is ticket description` -- create a ticket and assign to Song\n' +
      '*Aliases*: 🆕\n' +
      context.aliases
        .getMappings()
        .map(({from, to}) => `    \`${from}\` => \`${to}\``)
        .join('\n') +
      '\n',
  })

const reportError = (context: Context, channel: ChatTypes.ChatChannel, parsedMessage: Message.Message) =>
  context.bot.chat.send(channel, {
    body:
      (parsedMessage.type === 'unknown' ? `Invalid command: ${parsedMessage.error}` : 'Unknown command') + '\nNeed help? Try `!jira help`',
  })

const reactAck = (context: Context, channel: ChatTypes.ChatChannel, id: number) => context.bot.chat.react(channel, id, ':eyes:')

const onMessage = (context: Context, kbMessage: ChatTypes.MsgSummary) => {
  try {
    // console.debug(kbMessage)
    const parsedMessage = Message.parseMessage(context, kbMessage)
    console.debug({msg: 'got message', parsedMessage})
    if (!parsedMessage) {
      // not a kira message
      return
    }
    switch (parsedMessage.type) {
      case Message.BotMessageType.Unknown:
        reportError(context, kbMessage.channel, parsedMessage)
        return
      case Message.BotMessageType.Help:
        sendHelp(context, kbMessage.channel)
        return
      case Message.BotMessageType.Search:
        reactAck(context, kbMessage.channel, kbMessage.id)
        search(context, kbMessage.channel, parsedMessage)
        return
      case Message.BotMessageType.Comment:
        reactAck(context, kbMessage.channel, kbMessage.id)
        comment(context, kbMessage.channel, parsedMessage)
        return
      case Message.BotMessageType.Reacji:
        reacji(context, kbMessage.channel, parsedMessage)
        return
      case Message.BotMessageType.Create:
        reactAck(context, kbMessage.channel, kbMessage.id)
        create(context, kbMessage.channel, parsedMessage)
        return
      default:
        console.error({error: 'how could this happen'})
        return
    }
  } catch (err) {
    // otherwise keybase-bot seems to swallow exceptions
    console.error(err)
  }
}

export default (context: Context) =>
  context.config.keybase.channels.forEach(channel =>
    context.bot.chat.watchChannelForNewMessages(channel, message => onMessage(context, message))
  )
