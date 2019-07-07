import * as Message from './message'
import search from './search'
import comment from './comment'
import reacji from './reacji'
import create from './create'
import {Context} from './context'
import * as Utils from './utils'

const sendHelp = (context, channel) =>
  context.bot.chat.send(channel, {
    body:
      '*Usage*: \n' +
      '    `!kira search <query>`\n' +
      '    `!kira comment <query|"multi word query"> <your comment>`\n' +
      '    `!kira create --project=<PROJECT> [--assignee=<kb username>] <summary|"multi word summary"> <description>`\n\n' +
      '*Options*: \n' +
      '    `-p`, `--project`: only search for specific project ' +
      `${Utils.humanReadableArray(context.config.jira.projects)}\n` +
      '    `--status`: only search for tickets in specific status ' +
      `${Utils.humanReadableArray(context.config.jira.status)}\n` +
      '    `--assignee`: only search for tickets assigned to specified person (keybase username) ' +
      `${Utils.humanReadableArray(Object.keys(context.config.jira.usernameMapper))}\n\n` +
      '*Examples*:\n' +
      '    `!kira search Rekey` -- single word keyword search\n' +
      '    `!kira search black bar` -- multiple word works too\n' +
      '    `!kira search --project desktop black bar` -- search in only DESKTOP\n' +
      '    `!kira search --assignee songgao black bar` -- search for only ones assigned to Song\n' +
      '    `!kira comment "TestBlahBlah" another flake: https://example.com` -- comment on ticket(s). I\'ll ask for confirmation before posting.\n' +
      '    `!kira comment KBFS-1234 test comment` -- issue key works too\n' +
      '    `!kira comment "TestBlahBlah flake" another flake: https://example.com` -- if non-last-argument is multi-word, just quote it\n' +
      '    `!kira comment --project kbfs --assignee songgao "TestBlahBlah" another flake: https://example.com` -- same args for search work here too\n' +
      '    `!kira create --project kbfs "ignore me this is a test" this is ticket descriptiong` -- create an unassigned ticket\n' +
      '    `!kira create --project kbfs --assignee songgao "ignore me this is a test" this is ticket description` -- create a ticket and assign to Song\n' +
      '',
  })

const reportError = (context, channel, parsedMessage) =>
  context.bot.chat.send(channel, {
    body: (parsedMessage.error ? `Invalid command: ${parsedMessage.error}` : 'Unknown command') + '\nNeed help? Try `!kira help`',
  })

const reactAck = (context, channel: Bot.ChatChannel, id: number) => context.bot.chat.react(channel, id, ':eyes:')

const onMessage = (context, kbMessage) => {
  try {
    //console.debug(kbMessage)
    const parsedMessage = Message.parseMessage(context, kbMessage)
    console.debug({msg: 'got message', parsedMessage})
    if (!parsedMessage) {
      // not a kira message
      return
    }
    switch (parsedMessage.type) {
      case 'unknown':
        reportError(context, kbMessage.channel, parsedMessage)
        return
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
