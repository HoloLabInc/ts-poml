const splitArrayRegex = /[,\s]+/g

const splitArrayString = (text: string): string[] => {
  return text.split(splitArrayRegex)
}

export const parseAsNumberArray = (
  text: string | undefined
): number[] | undefined => {
  if (!text) {
    return undefined
  }

  const tokens = splitArrayString(text)

  const numbers = tokens
    .map((x) => Number.parseFloat(x))
    .filter((x) => !Number.isNaN(x))

  return numbers
}
