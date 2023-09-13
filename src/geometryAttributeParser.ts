import { GeodeticPositions, RelativePositions } from '.'
import { parseAsNumberArray } from './parserUtility'

export const parseGeometryPositionsString = (
  text: string
): RelativePositions | GeodeticPositions | undefined => {
  const { key, value } = parseGeometryPositionsStringKeyValue(text)

  switch (key) {
    case 'geodetic':
      return parseGeodeticPositionsString(value)
    case '':
    case 'relative':
      return parseRelativePositionsString(value)
    default:
      return undefined
  }
}

const keyValueRegex = /^\s*(\w+?)\s*:/

const parseGeometryPositionsStringKeyValue = (
  text: string
): { key: string; value: string } => {
  const match = keyValueRegex.exec(text)
  if (match === null) {
    return { key: '', value: text }
  }

  const key = match[1]
  const value = text.slice(match[0].length)

  return { key, value }
}

const parseGeodeticPositionsString = (
  text: string
): GeodeticPositions | undefined => {
  const numbers = parseAsNumberArray(text)
  if (numbers === undefined) {
    return undefined
  }

  const positions = []
  const length = Math.floor(numbers.length / 3)
  for (let i = 0; i < length; i++) {
    const longitude = numbers[i * 3]
    const latitude = numbers[i * 3 + 1]
    const ellipsoidalHeight = numbers[i * 3 + 2]
    positions.push({ longitude, latitude, ellipsoidalHeight })
  }

  return {
    type: 'geodetic',
    positions: positions,
  }
}

const parseRelativePositionsString = (
  text: string
): RelativePositions | undefined => {
  const numbers = parseAsNumberArray(text)
  if (numbers === undefined) {
    return undefined
  }

  const positions = []
  const length = Math.floor(numbers.length / 3)
  for (let i = 0; i < length; i++) {
    const x = numbers[i * 3]
    const y = numbers[i * 3 + 1]
    const z = numbers[i * 3 + 2]
    positions.push({ x, y, z })
  }

  return {
    type: 'relative',
    positions: positions,
  }
}
