// @flow
import JiraClient from 'jira-connector'
import * as Config from '../config'

const jira = new JiraClient({
  host: Config.jira.host,
  basic_auth: {
    username: Config.jira.username,
    password: Config.jira.password,
  },
})

const looksLikeIssueKey = str => !!str.match(/[A-Za-z]+-[0-9]+/)

export type Issue = {
  key: string,
  summary: string,
  status: string,
  url: string,
}

const jiraRespMapper = (issue): Issue => ({
  key: issue.key,
  summary: issue.fields.summary,
  status: issue.fields.status.statusCategory.name,
  url: `https://${Config.jira.host}/browse/${issue.key}`,
})

export const getOrSearch = (str: string): Promise<any> =>
  Promise.all([
    looksLikeIssueKey(str)
      ? jira.issue.getIssue({
          issueKey: str,
          fields: ['key', 'summary', 'status'],
        })
      : new Promise(r => r()),
    jira.search.search({
      jql: `text ~ "${str}"`,
      fields: 'key,summary,status',
      method: 'GET',
      maxResults: 11,
    }),
  ]).then(([fromGet, fromSearch]) => {
    return [
      ...(fromGet ? [fromGet] : []),
      ...(fromSearch ? fromSearch.issues : []),
    ].map(jiraRespMapper)
  })

export const addComment = (issueKey: string, comment: string): Promise<any> =>
  jira.issue
    .addComment({
      issueKey,
      comment: { body: comment },
    })
    .then(
      ({ id }) =>
        `https://${Config.jira.host}/browse/${issueKey}?focusedCommentId=${id}`
    )
