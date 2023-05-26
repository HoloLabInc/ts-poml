import { XMLParser } from 'fast-xml-parser'

const parse = (xml: string) => {
  const options = {
    ignoreAttributes: false,
    preserveOrder: true,
    commentPropName: '#comment',
  }
  const parser = new XMLParser(options)
  const result = parser.parse(xml)
  return result
}

describe('parse', () => {
  test('parse no scene', () => {
    const xml = `<element position="0,1,2"/>`
    const result = parse(xml)
    expect(result).toEqual([{ ':@': { '@_position': '0,1,2' }, element: [] }])
  })

  test('empty scene', () => {
    const xml = `
    <poml>
      <scene></scene>
    </poml>`

    const result = parse(xml)
    expect(result).toEqual([{ poml: [{ scene: [] }] }])
  })

  test('empty scene and resource', () => {
    const xml = `
    <poml>
      <scene></scene>
      <resource></resource>
    </poml>`

    const result = parse(xml)
    expect(result).toEqual([{ poml: [{ scene: [] }, { resource: [] }] }])
  })
  test('one element', () => {
    const xml = `
    <poml>
      <scene>
        <element/>
      </scene>
    </poml>`

    const result = parse(xml)
    expect(result).toEqual([{ poml: [{ scene: [{ element: [] }] }] }])
  })

  test('two element', () => {
    const xml = `
    <poml>
      <scene>
        <element/>
        <element/>
      </scene>
    </poml>`

    const result = parse(xml)

    expect(result).toEqual([
      { poml: [{ scene: [{ element: [] }, { element: [] }] }] },
    ])
  })

  test('empty and model element', () => {
    const xml = `
    <poml>
      <scene>
        <element/>
        <model src="model1"/>
        <element/>
        <model src="model2"/>
      </scene>
    </poml>`

    const result = parse(xml)

    expect(result).toEqual([
      {
        poml: [
          {
            scene: [
              { element: [] },
              { model: [], ':@': { '@_src': 'model1' } },
              { element: [] },
              { model: [], ':@': { '@_src': 'model2' } },
            ],
          },
        ],
      },
    ])
  })

  test('comment test', () => {
    const xml = `
    <poml>
      <scene>
        <element/>
        <text/>
        <!--This is a comment-->
        <!--aaa bbb ccc-->
      </scene>
    </poml>
    `
    const result = parse(xml)
    expect(result).toEqual([
      {
        poml: [
          {
            scene: [
              { element: [] },
              { text: [] },
              {
                '#comment': [{ '#text': 'This is a comment' }],
              },
              {
                '#comment': [{ '#text': 'aaa bbb ccc' }],
              },
            ],
          },
        ],
      },
    ])
  })
})
