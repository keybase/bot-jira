import BotChatClientTypes from 'keybase-bot/lib/chat-client/types'

export type Config = {
  keybase: {
    username: string
    paperkey: string
    channels: Array<BotChatClientTypes.ChatChannel>
  }
  jira: {
    host: string
    email: string
    apiToken: string
    projects: Array<string>
    status: Array<string>
    usernameMapper: {
      [key: string]: string
    }
  }
  aliases: {
    // no space, has to be at beginning, replaced before parsing command
    [key: string]: string
  }
}

const checkConfig = (obj: any): null | Config => {
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
  if (typeof obj.jira.email !== 'string') {
    return null
  }
  if (typeof obj.jira.apiToken !== 'string') {
    return null
  }
  if (!Array.isArray(obj.jira.projects)) {
    return null
  }
  if (!Array.isArray(obj.jira.status)) {
    return null
  }

  // case-insensitive
  obj.jira.projects = obj.jira.projects.map((project: string) => project.toLowerCase())
  obj.jira.status = obj.jira.status.map((status: string) => status.toLowerCase())

  // TODO validate usernameMapper maybe

  return obj as Config
}

export const parse = (base64Config: string): null | Config => {
  try {
    return checkConfig(JSON.parse(Buffer.from(base64Config, 'base64').toString()))
  } catch (e) {
    console.error(e)
    return null
  }
}
