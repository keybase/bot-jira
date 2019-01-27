// @flow
import Bot from 'keybase-bot'
import { username, paperkey } from '../config'

const bot = new Bot()

bot.init(username, paperkey, { verbose: false }).then(() => {
  console.log('init - done')
  console.log(bot)
  bot.deinit()
})
