// @flow
import type { ChatChannel } from 'keybase-bot'

export type Config = {
  keybase: {
    username: string,
    paperkey: string,
    channels: Array<ChatChannel>,
  },
  jira: {
    host: string,
    username: string,
    password: string,
    projects: Array<string>,
    status: Array<string>,
    usernameMapper: {
      [string]: string,
    },
  },
}

const checkConfig = (obj): ?Config => {
  if (typeof obj !== 'object') {
    return null
  }

  if (typeof obj.keybase !== 'object') {
    return null
  }
  if (typeof obj.keybase.username !== 'string') {
    return null
  }
  if (typeof obj.keybase.paperkey !== 'string') {
    return null
  }
  if (!Array.isArray(obj.keybase.channels)) {
    return null
  }
  for (let channel of obj.keybase.channels) {
    if (typeof channel !== 'object') {
      return null
    }
  }

  if (typeof obj.jira !== 'object') {
    return null
  }
  if (typeof obj.jira.host !== 'string') {
    return null
  }
  if (typeof obj.jira.username !== 'string') {
    return null
  }
  if (typeof obj.jira.password !== 'string') {
    return null
  }
  if (!Array.isArray(obj.jira.projects)) {
    return null
  }
  if (!Array.isArray(obj.jira.status)) {
    return null
  }

  // case-insensitive
  obj.jira.projects = obj.jira.projects.map(project => project.toLowerCase())
  obj.jira.status = obj.jira.status.map(status => status.toLowerCase())

  // TODO validate usernameMapper maybe

  return (obj: Object)
}

export const parse = (base64Config: string): ?Config => {
  try {
    return checkConfig(
      JSON.parse(Buffer.from(base64Config, 'base64').toString())
    )
  } catch (e) {
    console.error(e)
    return null
  }
}
