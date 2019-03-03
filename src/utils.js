// @flow

const quotes = {
  '"': '"',
  "'": "'",
  '`': '`',
  '“': '”',
  '‘': '’',
}

const spaces = [' ', '\n', '\t']

// splits a string by white space, but respect quotes
export const split2 = (s: string) => {
  const { list, current } = s.split('').reduce(
    ({ list, current, quote }, c) => {
      if (quote) {
        return c === quote
          ? { list: [...list, current], current: '', quote: '' }
          : { list, current: current + c, quote }
      }
      if (quotes[c]) {
        return { list, current: '', quote: quotes[c] }
      }
      if (spaces.includes(c)) {
        return current
          ? { list: [...list, current], current: '', quote: '' }
          : { list, current, quote: '' }
      }
      return { list, current: current + c, quote: '' }
    },
    { list: [], current: '', quote: '' }
  )
  return current ? [...list, current] : list
}
