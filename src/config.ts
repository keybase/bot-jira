import ChatTypes from 'keybase-bot/lib/types/chat1'

export type Config = {
  keybase: {
    username: string
    paperkey: string
    channels: Array<ChatTypes.ChatChannel>
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
    console.error('unexpect obj type', typeof obj)
    return null
  }

  if (typeof obj.keybase !== 'object') {
    console.error('unexpect obj.keybase type', typeof obj.keybase)
    return null
  }
  if (typeof obj.keybase.username !== 'string') {
    console.error('unexpect obj.keybase.username type', typeof obj.keybase.username)
    return null
  }
  if (typeof obj.keybase.paperkey !== 'string') {
    console.error('unexpect obj.keybase.paperkey type', typeof obj.keybase.paperkey)
    return null
  }
  if (!Array.isArray(obj.keybase.channels)) {
    console.error('unexpect obj.keybase.channels type: not an array', obj.keybase.channels)
    return null
  }
  for (let channel of obj.keybase.channels) {
    if (typeof channel !== 'object') {
      console.error('unexpect channel type', typeof channel)
      return null
    }
  }

  if (typeof obj.jira !== 'object') {
    console.error('unexpect obj.jira type', typeof obj.jira)
    return null
  }
  if (typeof obj.jira.host !== 'string') {
    console.error('unexpect obj.jira.host type', typeof obj.jira.host)
    return null
  }
  if (typeof obj.jira.email !== 'string') {
    console.error('unexpect obj.jira.email type', typeof obj.jira.email)
    return null
  }
  if (typeof obj.jira.apiToken !== 'string') {
    console.error('unexpect obj.jira.apiToken type', typeof obj.jira.apiToken)
    return null
  }
  if (!Array.isArray(obj.jira.projects)) {
    console.error('unexpect obj.jira.projects type: not an array', obj.jira.projects)
    return null
  }
  if (!Array.isArray(obj.jira.status)) {
    console.error('unexpect obj.jira.status type: not an array', obj.jira.status)
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
