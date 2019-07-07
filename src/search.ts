import Bot from 'keybase-bot'
import {Issue as JiraIssue} from './jira'
import {numToEmoji, statusToEmoji} from './emoji'
import {SearchMessage, CommentMessage} from './message'
import {Context} from './context'

const issueToLine = (issue, index) => `${numToEmoji(index)} *${issue.key}* ${statusToEmoji(issue.status)} ${issue.summary} - ${issue.url}`

const buildSearchResultBody = (parsedMessage, jql, issues, additional) => {
  const begin = '```\n' + jql + '\n```'
  if (!issues.length) {
    return begin + 'I got nothing from Jira.'
  }
  const firstIssues = issues.slice(0, 11)
  const head = `@${parsedMessage.from} I got ${issues.length} tickets from Jira` + (issues > 11 ? '. Here are the first 11:\n\n' : ':\n\n')
  const body = firstIssues.map(issueToLine).join('\n')
  return begin + head + body + (additional ? '\n\n' + additional : '')
}

export const getOrSearch = (
  context: Context,
  channel: Bot.ChatChannel,
  parsedMessage: SearchMessage | CommentMessage,
  additional?: string
): Promise<{issues: Array<JiraIssue>; count: number; id: number}> =>
  context.jira
    .getOrSearch({
      query: parsedMessage.query,
      project: parsedMessage.project,
      status: parsedMessage.status,
      assigneeJira: context.config.jira.usernameMapper[parsedMessage.assignee] || '',
    })
    .then(({jql, issues}) =>
      context.bot.chat
        .send(channel, {
          body: buildSearchResultBody(parsedMessage, jql, issues, additional),
        })
        .then(({id}) => ({
          count: issues.length > 11 ? 11 : issues.length,
          id,
          issues,
        }))
    )

export default (context: Context, channel: Bot.ChatChannel, parsedMessage: SearchMessage) => getOrSearch(context, channel, parsedMessage)
