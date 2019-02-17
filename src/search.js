// @flow
import Bot from 'keybase-bot'
import { type Issue as JiraIssue } from './jira'
import { numToEmoji, statusToEmoji } from './emoji'
import type { SearchMessage, CommentMessage } from './message'
import type { Context } from './context'

const issueToLine = (issue, index) =>
  `${numToEmoji(index)} *${issue.key}* ${statusToEmoji(issue.status)} ${
    issue.summary
  } - ${issue.url}`

const buildSearchResultBody = (parsedMessage, issues, additional) => {
  if (!issues.length) {
    return 'I got nothing from Jira.'
  }
  const firstIssues = issues.slice(0, 11)
  const head =
    `@${parsedMessage.from} I got ${issues.length} tickets from Jira` +
    (issues > 11 ? '. Here are the first 11:\n\n' : ':\n\n')
  const body = firstIssues.map(issueToLine).join('\n')
  return additional ? head + body + '\n\n' + additional : head + body
}

export const getOrSearch = (
  context: Context,
  channel: Bot.ChatChannel,
  parsedMessage: SearchMessage | CommentMessage,
  additional?: string
): Promise<{ issues: Array<JiraIssue>, count: number, id: number }> =>
  context.jira.getOrSearch(parsedMessage.query).then(issues =>
    context.bot.chat
      .send(channel, {
        body: buildSearchResultBody(parsedMessage, issues, additional),
      })
      .then(({ id }) => ({
        count: issues.length > 11 ? 11 : issues.length,
        id,
        issues,
      }))
  )

export default (
  context: Context,
  channel: Bot.ChatChannel,
  parsedMessage: SearchMessage
) => getOrSearch(context, channel, parsedMessage)
