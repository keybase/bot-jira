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

  getOrSearch({
    query,
    project,
    status,
    assigneeJira,
  }: {
    query: string,
    project: string,
    status: string,
    assigneeJira: string,
  }): Promise<any> {
    const jql =
      (project ? `project = "${project}" AND ` : '') +
      (status ? `status = "${status}" AND ` : '') +
      (assigneeJira ? `assignee = "${assigneeJira}" AND ` : '') +
      `text ~ "${query}"`
    console.debug({ msg: 'getOrSearch', jql })
    return (
      Promise.all([
        looksLikeIssueKey(query)
          ? this._jira.issue.getIssue({
              issueKey: query,
              //fields: ['key', 'summary', 'status'],
            })
          : new Promise(r => r()),
        this._jira.search.search({
          jql,
          fields: 'key,summary,status',
          method: 'GET',
          maxResults: 11,
        }),
      ])
        /*
      .then(a => {
        console.log(a)
        return a
      })
      */
        .then(([fromGet, fromSearch]) => ({
          jql,
          issues: [
            ...(fromGet ? [fromGet] : []),
            ...(fromSearch ? fromSearch.issues : []),
          ].map(this.jiraRespMapper),
        }))
    )
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

  createIssue({
    assigneeJira,
    project,
    name,
    description,
  }: {
    assigneeJira: string,
    project: string,
    name: string,
    description: string,
  }): Promisie<any> {
    console.log({
      msg: 'createIssue',
      assigneeJira,
      project,
      name,
      description,
    })
    return (
      this._jira.issue
        .createIssue({
          fields: {
            assignee: assigneeJira ? { name: assigneeJira } : undefined,
            project: { key: project.toUpperCase() },
            issuetype: { name: 'Story' }, // TODO make this configurable?
            summary: name,
            description,
          },
        })
        /*
      .then(a => {
        console.log(a)
        return a
      })
      */
        .then(({ key }) => `https://${this._config.jira.host}/browse/${key}`)
    )
  }
}
