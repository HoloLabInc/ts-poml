import { parseGeometryPositionsString } from '../src/geometryAttributeParser'

describe('parseGeometryPositionsString', () => {
  test('return undefined when input is empty string', () => {
    const result = parseGeometryPositionsString('')
    expect(result).toBeUndefined()
  })

  test('return relative positions when type key is not specified', () => {
    const result = parseGeometryPositionsString('1.5,-2,3 4,5,6')
    expect(result?.type).toBe('relative')

    if (result?.type !== 'relative') {
      throw new Error('result?.type is not relative')
    }

    expect(result?.positions).toEqual([
      { x: 1.5, y: -2, z: 3 },
      { x: 4, y: 5, z: 6 },
    ])
  })

  test('return relative positions when type key relative', () => {
    const result = parseGeometryPositionsString('relative: 1.5,-2,3 4,5,6')
    expect(result?.type).toBe('relative')

    if (result?.type !== 'relative') {
      throw new Error('result?.type is not relative')
    }

    expect(result?.positions).toEqual([
      { x: 1.5, y: -2, z: 3 },
      { x: 4, y: 5, z: 6 },
    ])
  })

  test('return relative positions when type key geodetic', () => {
    const result = parseGeometryPositionsString('geodetic: 1.5,-2,3 4,5,6')
    expect(result?.type).toBe('geodetic')

    if (result?.type !== 'geodetic') {
      throw new Error('result?.type is not geodetic')
    }

    expect(result?.positions).toEqual([
      { longitude: 1.5, latitude: -2, ellipsoidalHeight: 3 },
      { longitude: 4, latitude: 5, ellipsoidalHeight: 6 },
    ])
  })

  test('spaces are ignored', () => {
    const result = parseGeometryPositionsString(
      '  relative   :   1.5 ,  -2, 3   4,5,6'
    )
    expect(result?.type).toBe('relative')

    if (result?.type !== 'relative') {
      throw new Error('result?.type is not relative')
    }

    expect(result?.positions).toEqual([
      { x: 1.5, y: -2, z: 3 },
      { x: 4, y: 5, z: 6 },
    ])
  })
})
