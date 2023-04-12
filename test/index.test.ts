import { Poml, PomlEmptyElement, Scene } from '../src'

describe('poml element initialization', () => {
  test('poml empty element', () => {
    const el = new PomlEmptyElement()
    expect(el.children?.length).toBe(0)
    expect(el.coordinateReferences?.length).toBe(0)
    expect(el.position).toBeUndefined()
    expect(el.scale).toBeUndefined()
    expect(el.rotation).toBeUndefined()
  })

  test('poml element with position', () => {
    const el = new PomlEmptyElement({
      position: { x: 1, y: 2, z: 3 },
    })
    expect(el.position).toStrictEqual({ x: 1, y: 2, z: 3 })
  })

  test('poml element whth children', () => {
    const el = new PomlEmptyElement({
      children: [new PomlEmptyElement()],
    })
    expect(el.children?.length).toBe(1)
    expect(el.children?.[0].children?.length).toBe(0)
  })
})
