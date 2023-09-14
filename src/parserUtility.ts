const splitArrayRegex = /[,\s]+/g

const splitArrayString = (text: string): string[] => {
  return text.split(splitArrayRegex).filter((x) => x !== '')
}

export const parseAsNumber = (text: string | undefined): number | undefined => {
  if (!text) {
    return undefined
  }

  const num = Number(text)
  if (Number.isNaN(num)) {
    return undefined
  } else {
    return num
  }
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

export const parseAsVector3 = (text: string | undefined) => {
  const numbers = parseAsNumberArray(text)

  if (numbers === undefined || numbers.length !== 3) {
    return undefined
  }

  return {
    x: numbers[0],
    y: numbers[1],
    z: numbers[2],
  }
}

export const parseAsQuaternion = (text: string | undefined) => {
  const numbers = parseAsNumberArray(text)

  if (numbers === undefined || numbers.length !== 4) {
    return undefined
  }

  return {
    x: numbers[0],
    y: numbers[1],
    z: numbers[2],
    w: numbers[3],
  }
}
