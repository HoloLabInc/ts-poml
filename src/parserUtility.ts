const splitArrayRegex = /[,\s]+/g

const splitArrayString = (text: string): string[] => {
  return text.split(splitArrayRegex).filter((x) => x !== '')
}

export const parseAsNumberArray = (
  text: string | undefined
): number[] | undefined => {
  if (!text) {
    return undefined
  }

  const tokens = splitArrayString(text)

  const numbers = []
  for (let i = 0; i < tokens.length; i++) {
    const num = Number(tokens[i])
    if (Number.isNaN(num)) {
      break
    }
    numbers.push(num)
  }

  return numbers
}
