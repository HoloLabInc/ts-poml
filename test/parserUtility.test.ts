import { parseAsNumberArray } from '../src/parserUtility'

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
