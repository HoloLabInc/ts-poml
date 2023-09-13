import {
  parseAsNumber,
  parseAsNumberArray,
  parseAsVector3,
  parseAsQuaternion,
} from '../src/parserUtility'

describe('parseAsNumber', () => {
  test('return undefined when input is not a number', () => {
    const result = parseAsNumber('abc')
    expect(result).toBeUndefined()
  })

  test('parse valid number', () => {
    const result = parseAsNumber('3.14')
    expect(result).toEqual(3.14)
  })
})

describe('parseAsNumberArray', () => {
  test('return undefined when input is empty string', () => {
    const result = parseAsNumberArray('')
    expect(result).toBeUndefined()
  })

  test('split with commas', () => {
    const result = parseAsNumberArray('-1,2.5,3')
    expect(result).toEqual([-1, 2.5, 3])
  })

  test('split with spaces', () => {
    const result = parseAsNumberArray('-1 2.5 3')
    expect(result).toEqual([-1, 2.5, 3])
  })

  test('split with commans and spaces', () => {
    const result = parseAsNumberArray(',,,-1  , , 2.5 , ,, 3,,,')
    expect(result).toEqual([-1, 2.5, 3])
  })

  test('numbers after invalid charactors are ignored', () => {
    const result = parseAsNumberArray('-1 2.5 a 3')
    expect(result).toEqual([-1, 2.5])
  })
})

describe('parseAsVector3', () => {
  test('return undefined when input is empty string', () => {
    const result = parseAsVector3('')
    expect(result).toBeUndefined()
  })

  test('return undefined when input is not a valid vector3', () => {
    const result = parseAsVector3('1,2,3,4')
    expect(result).toBeUndefined()
  })

  test('parse valid vector3', () => {
    const result = parseAsVector3('1,2,3')
    expect(result).toEqual({ x: 1, y: 2, z: 3 })
  })

  test('parse valid vector3', () => {
    const result = parseAsVector3(' 1 2 3 ')
    expect(result).toEqual({ x: 1, y: 2, z: 3 })
  })
})

describe('parseAsQuaternion', () => {
  test('return undefined when input is empty string', () => {
    const result = parseAsQuaternion('')
    expect(result).toBeUndefined()
  })

  test('return undefined when input is not a valid quaternion', () => {
    const result = parseAsQuaternion('1,2,3,4,5')
    expect(result).toBeUndefined()
  })

  test('parse valid quaternion', () => {
    const result = parseAsQuaternion('1,2,3,4')
    expect(result).toEqual({ x: 1, y: 2, z: 3, w: 4 })
  })

  test('parse valid quaternion', () => {
    const result = parseAsQuaternion(' 1 2 3 4 ')
    expect(result).toEqual({ x: 1, y: 2, z: 3, w: 4 })
  })
})
