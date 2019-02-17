// @flow
import JiraClient from 'jira-connector'
import type { Config } from './config'
import type { Context } from './context'

const looksLikeIssueKey = str => !!str.match(/[A-Za-z]+-[0-9]+/)

export type Issue = {
  key: string,
  summary: string,
  status: string,
  url: string,
}

export default class {
  _config: Config
  _jira: Object

  constructor(config: Config) {
    this._config = config
    this._jira = new JiraClient({
      host: config.jira.host,
      basic_auth: {
        username: config.jira.username,
        password: config.jira.password,
      },
    })
  }

  jiraRespMapper = (issue: Object): Issue => ({
    key: issue.key,
    summary: issue.fields.summary,
    status: issue.fields.status.statusCategory.name,
    url: `https://${this._config.jira.host}/browse/${issue.key}`,
  })

  getOrSearch(str: string): Promise<any> {
    return Promise.all([
      looksLikeIssueKey(str)
        ? this._jira.issue.getIssue({
            issueKey: str,
            fields: ['key', 'summary', 'status'],
          })
        : new Promise(r => r()),
      this._jira.search.search({
        jql: `text ~ "${str}"`,
        fields: 'key,summary,status',
        method: 'GET',
        maxResults: 11,
      }),
    ]).then(([fromGet, fromSearch]) => {
      return [
        ...(fromGet ? [fromGet] : []),
        ...(fromSearch ? fromSearch.issues : []),
      ].map(this.jiraRespMapper)
    })
  }

  addComment(issueKey: string, comment: string): Promise<any> {
    return this._jira.issue
      .addComment({
        issueKey,
        comment: { body: comment },
      })
      .then(
        ({ id }) =>
          `https://${
            this._config.jira.host
          }/browse/${issueKey}?focusedCommentId=${id}`
      )
  }
}
