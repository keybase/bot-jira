const maxExpand = 10

class Aliases {
  mappings: Map<string, string>

  constructor(mappings: {[key: string]: string}) {
    this.mappings = new Map(Object.entries(mappings).map(([from, to]) => [from.toLowerCase(), to]))
  }

  _expand(messageTextBody: string): string {
    const spaceIndex = messageTextBody.indexOf(' ')
    const from = messageTextBody.slice(0, spaceIndex).toLowerCase()
    const to = this.mappings.get(from)
    return to ? to + messageTextBody.slice(spaceIndex) : messageTextBody
  }

  expand(messageTextBody: string): string {
    let expanded = messageTextBody
    for (let i = 0; i < maxExpand; ++i) {
      const _expanded = this._expand(messageTextBody)
      if (expanded === _expanded) {
        return expanded
      }
    }
    return expanded
  }

  getMappings(): Array<{from: string; to: string}> {
    return Array.from(this.mappings.entries()).map(([from, to]) => ({from, to}))
  }
}

export default Aliases
