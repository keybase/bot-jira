// @flow
import Bot from 'keybase-bot'
import type { Issue } from './jira'
import type { CommentMessage } from './message'
import util from 'util'

const setTimeoutPromise = util.promisify(setTimeout)

type CommentContextItem = {
  message: CommentMessage,
  issues: Array<Issue>,
}

class CommentContext {
  _respMsgIDToCommentMessage = new Map()

  add = (responseID: number, message: CommentMessage, issues: Array<Issue>) => {
    this._respMsgIDToCommentMessage.set(responseID, { message, issues })
    setTimeoutPromise(1000 * 120 /* 2min */).then(() =>
      this._respMsgIDToCommentMessage.delete(responseID)
    )
  }

  get = (responseID: number): ?CommentContextItem =>
    this._respMsgIDToCommentMessage.get(responseID)
}

export type Context = {
  bot: Bot.Bot,
  comment: CommentContext,
}

export default (): Context => ({
  bot: new Bot(),
  comment: new CommentContext(),
})
