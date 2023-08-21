import {
  LineGeometry,
  MaybePomlElement,
  Meta,
  PolygonGeometry,
  Poml,
  PomlCesium3dTilesElement,
  PomlEmptyElement,
  PomlGeometryElement,
  PomlImageElement,
  PomlModelElement,
  PomlScreenSpaceElement,
  PomlTextElement,
  PomlUnknown,
  PomlVideoElement,
  Scene,
} from '../src'
import { FxPomlRoot, FxUnknownElement } from '../src/fastXmlParserPomlType'
import { BuildOptions, PomlParser } from '../src/pomlParser'

const parse = (xml: string) => {
  const pomlParser = new PomlParser()
  const poml = pomlParser.parse(xml)
  return poml
}

const build = (poml: Poml, options?: BuildOptions) => {
  const pomlParser = new PomlParser()
  const xml = pomlParser.build(poml, options)
  return xml
}

describe('type assertion', () => {
  test('empty scene', () => {
    const obj = [{ poml: [{ scene: [] }] }] as FxPomlRoot
    expect(obj?.length).toBe(1)
    expect(obj?.[0].poml?.length).toBe(1)
  })
})

describe('parse', () => {
  test('parse no scene', () => {
    const xml = `
	  <poml>
	  </poml>
	  `

    const poml = parse(xml)
    expect(poml.scene.children?.length).toBe(0)
  })

  test('parse one element', () => {
    const xml = `
	  <poml>
	  	<scene>
        <element id="a"></element>
      </scene>
	  </poml>
	  `

    const poml = parse(xml)
    expect(poml.scene.children?.length).toBe(1)

    const element = poml.scene.children?.[0]
    expect(element.type).toBe('element')
    if (element.type != 'element') {
      fail()
    }
    expect(element.id).toBe('a')
  })

  test('parse two elements', () => {
    const xml = `
	  <poml>
	  	<scene>
        <element id="a"></element>
        <element id="b"></element>
      </scene>
	  </poml>
	  `

    const poml = parse(xml)
    expect(poml.scene.children?.length).toBe(2)

    const element0 = poml.scene.children?.[0]
    const element1 = poml.scene.children?.[1]
    if (element0?.type != 'element' || element1?.type != 'element') {
      fail()
    }

    expect(element0?.id).toBe('a')
    expect(element1?.id).toBe('b')
  })

  test('parse element and model', () => {
    const xml = `
	  <poml>
	  	<scene>
        <element id="a"></element>
        <model src="model1"></element>
        <element id="b"></element>
      </scene>
	  </poml>
	  `

    const poml = parse(xml)
    expect(poml.scene.children?.length).toBe(3)

    const element0 = poml.scene.children?.[0]
    const element1 = poml.scene.children?.[1]
    const element2 = poml.scene.children?.[2]
    if (
      element0?.type != 'element' ||
      element1?.type != 'model' ||
      element2?.type != 'element'
    ) {
      fail()
    }

    expect(element0.id).toBe('a')
    expect(element1.id).toBe(undefined)
    expect(element2.id).toBe('b')

    const modelElement = poml.scene.children?.[1]
    expect(modelElement?.type).toBe('model')
    if (modelElement?.type == 'model') {
      expect(modelElement.src).toBe('model1')
    }
  })

  test('parse model element with no attribute', () => {
    const xml = `
	  <poml>
	  	<scene>
        <model></model>
      </scene>
	  </poml>
	  `

    const poml = parse(xml)
    expect(poml.scene.children?.length).toBe(1)

    const element = poml.scene.children?.[0]
    expect(element?.type).toBe('model')
    if (element?.type != 'model') {
      throw new Error('failed')
    }

    expect(element.src).toBe(undefined)
  })

  test('parse model element with attributes', () => {
    const xml = `
	  <poml>
	  	<scene>
        <model src="model1"></model>
      </scene>
	  </poml>
	  `

    const poml = parse(xml)
    expect(poml.scene.children?.length).toBe(1)

    const element = poml.scene.children?.[0]
    expect(element?.type).toBe('model')
    if (element?.type != 'model') {
      throw new Error('failed')
    }

    expect(element.src).toBe('model1')
  })

  test('parse text element', () => {
    const xml = `
	  <poml>
	  	<scene>
        <text text="text1" font-size="1m" font-color="blue" background-color="red"></text>
      </scene>
	  </poml>
	  `

    const poml = parse(xml)
    expect(poml.scene.children?.length).toBe(1)

    const element = poml.scene.children?.[0]
    expect(element?.type).toBe('text')
    if (element?.type != 'text') {
      throw new Error('failed')
    }

    expect(element.text).toBe('text1')
    expect(element.fontSize).toBe('1m')
    expect(element.backgroundColor).toBe('red')
    expect(element.fontColor).toBe('blue')
  })

  test('parse image element', () => {
    const xml = `
    <poml>
      <scene>
        <image src="image1"></image>
      </scene>
    </poml>
    `

    const poml = parse(xml)
    expect(poml.scene.children?.length).toBe(1)

    const element = poml.scene.children?.[0]
    expect(element?.type).toBe('image')
    if (element?.type != 'image') {
      throw new Error('failed')
    }

    expect(element.src).toBe('image1')
  })

  test('parse video element', () => {
    const xml = `
    <poml>
      <scene>
        <video src="video1"></video>
      </scene>
    </poml>
    `

    const poml = parse(xml)
    expect(poml.scene.children?.length).toBe(1)

    const element = poml.scene.children?.[0]
    expect(element?.type).toBe('video')
    if (element?.type != 'video') {
      throw new Error('failed')
    }

    expect(element.src).toBe('video1')
  })

  test('parse geometry line element', () => {
    const xml = `
    <poml>
      <scene>
        <geometry id="geometry0" position-type="relative">
          <line start="1,2,3" end="4,5,6" color="red"/>
          <line start="7,8,9" end="10,11,12"/>
        </geometry>
        <geometry id="geometry1" position-type="geo-location">
          <line
            start="34.630549,135.0341387,18.65"
            end="34.6021554,135.0094035,18.65"
            color="green"/>
        </geometry>
      </scene>
    </poml>
    `

    const poml = parse(xml)
    expect(poml.scene.children.length).toBe(2)

    // test element of id="geometry0"
    const geometry0 = poml.scene.children[0]
    expect(geometry0.type).toBe('geometry')
    if (geometry0.type != 'geometry') {
      throw new Error('failed')
    }
    expect(geometry0.geometries.length).toBe(2)
    {
      const line0 = geometry0.geometries[0]
      expect(line0.type).toBe('line')
      if (line0.type != 'line') {
        throw new Error('failed')
      }
      expect(line0.positions.length).toBe(2)
      expect(line0.positions[0]).toStrictEqual({
        type: 'relative',
        x: 1,
        y: 2,
        z: 3,
      })
      expect(line0.positions[1]).toStrictEqual({
        type: 'relative',
        x: 4,
        y: 5,
        z: 6,
      })
      expect(line0.color).toBe('red')

      const line1 = geometry0.geometries[1]
      expect(line1.type).toBe('line')
      if (line1.type != 'line') {
        throw new Error('failed')
      }
      expect(line1.positions.length).toBe(2)
      expect(line1.positions[0]).toStrictEqual({
        type: 'relative',
        x: 7,
        y: 8,
        z: 9,
      })
      expect(line1.positions[1]).toStrictEqual({
        type: 'relative',
        x: 10,
        y: 11,
        z: 12,
      })
      expect(line1.color).toBe(undefined)
    }

    // test element of id="geometry1"
    const geometry1 = poml.scene.children[1]
    expect(geometry1.type).toBe('geometry')
    if (geometry1.type != 'geometry') {
      throw new Error('failed')
    }
    expect(geometry1.geometries.length).toBe(1)
    {
      const line = geometry1.geometries[0]
      expect(line.type).toBe('line')
      if (line.type != 'line') {
        throw new Error('failed')
      }
      expect(line.positions.length).toBe(2)
      expect(line.positions[0]).toStrictEqual({
        type: 'geo-location',
        latitude: 34.630549,
        longitude: 135.0341387,
        ellipsoidalHeight: 18.65,
      })
      expect(line.positions[1]).toStrictEqual({
        type: 'geo-location',
        latitude: 34.6021554,
        longitude: 135.0094035,
        ellipsoidalHeight: 18.65,
      })
      expect(line.color).toBe('green')
    }
  })

  test('parse geometry polygon element', () => {
    const xml = `
    <poml>
      <scene>
        <geometry id="geometry0" position-type="relative">
          <polygon vertices="1,2,3 4,5,6" color="red"/>
        </geometry>
        <geometry id="geometry1" position-type="geo-location">
          <polygon vertices="1,2,3 4,5,6" color="green"/>
        </geometry>
      </scene>
    </poml>
    `

    const poml = parse(xml)
    expect(poml.scene.children.length).toBe(2)

    // test element of id="geometry0"
    const geometry0 = poml.scene.children[0]
    expect(geometry0.type).toBe('geometry')
    if (geometry0.type != 'geometry') {
      throw new Error('failed')
    }
    expect(geometry0.geometries.length).toBe(1)
    {
      const polygon0 = geometry0.geometries[0]
      expect(polygon0.type).toBe('polygon')
      if (polygon0.type != 'polygon') {
        throw new Error('failed')
      }
      if (polygon0.vertices === undefined) {
        throw new Error('failed')
      }
      expect(polygon0.vertices.positions.length).toBe(2)
      expect(polygon0.vertices.type).toBe('relative')
      expect(polygon0.vertices.positions[0]).toStrictEqual({
        x: 1,
        y: 2,
        z: 3,
      })
      expect(polygon0.vertices.positions[1]).toStrictEqual({
        x: 4,
        y: 5,
        z: 6,
      })
      expect(polygon0.color).toBe('red')
    }

    // test element of id="geometry1"
    const geometry1 = poml.scene.children[1]
    expect(geometry1.type).toBe('geometry')
    if (geometry1.type != 'geometry') {
      throw new Error('failed')
    }
    expect(geometry1.geometries.length).toBe(1)
    {
      const polygon = geometry1.geometries[0]
      expect(polygon.type).toBe('polygon')
      if (polygon.type != 'polygon') {
        throw new Error('failed')
      }
      if (polygon.vertices === undefined) {
        throw new Error('failed')
      }
      expect(polygon.vertices.positions.length).toBe(2)
      expect(polygon.vertices.type).toBe('geo-location')
      expect(polygon.vertices.positions[0]).toStrictEqual({
        longitude: 1,
        latitude: 2,
        ellipsoidalHeight: 3,
      })
      expect(polygon.vertices.positions[1]).toStrictEqual({
        longitude: 4,
        latitude: 5,
        ellipsoidalHeight: 6,
      })
      expect(polygon.color).toBe('green')
    }
  })

  test('parse geometry element with placement and children', () => {
    const xml = `
    <poml>
      <scene>
        <geometry position-type="relative">
          <geo-placement
            id="placement-0" latitude="1"
            longitude="2" ellipsoidal-height="3"/>
          <line start="1,2,3" end="4,5,6"/>
          <element id="child-of-geometry"/>
        </geometry>
      </scene>
    </poml>
    `
    const poml = parse(xml)
    expect(poml.scene.children.length).toBe(1)
    const geometryElement = poml.scene.children[0]
    expect(geometryElement.type).toBe('geometry')
    if (geometryElement.type != 'geometry') {
      throw new Error('failed')
    }
    expect(geometryElement.coordinateReferences.length).toBe(1)
    const reference = geometryElement.coordinateReferences[0]
    expect(reference.type).toBe('geo-reference')
    if (reference.type != 'geo-reference') {
      throw new Error('failed')
    }
    expect(reference.id).toBe('placement-0')
    expect(reference.latitude).toBe(1)
    expect(reference.longitude).toBe(2)
    expect(reference.ellipsoidalHeight).toBe(3)
  })

  test('parse script element', () => {
    const xml = `
    <poml>
      <scene>
        <element>
          <script src="test.wasm" args="arg 0.1"></script>
        </element
      </scene>
    </poml>
    `

    const poml = parse(xml)

    expect(poml.scene.children?.length).toBe(1)
    const element = poml.scene.children?.[0]
    expect(element?.type).toBe('element')

    if (!('scriptElements' in element)) {
      fail()
    }
    expect(element.scriptElements?.length).toBe(1)
    const script = element.scriptElements?.[0]
    expect(script?.type).toBe('script')
    if (script.type != 'script') {
      throw new Error('failed')
    }
    expect(script.src).toBe('test.wasm')
    expect(script.args).toStrictEqual(['arg', '0.1'])
  })

  test('parse cesium3dtiles element', () => {
    const xml = `
    <poml>
      <scene>
        <cesium3dtiles src="tileset"></cesium3dtiles>
      </scene>
    </poml>
    `

    const poml = parse(xml)
    expect(poml.scene.children?.length).toBe(1)

    const element = poml.scene.children?.[0]
    expect(element?.type).toBe('cesium3dtiles')
    if (element?.type != 'cesium3dtiles') {
      throw new Error('failed')
    }

    expect(element.src).toBe('tileset')
  })

  test('parse screen-space element', () => {
    const xml = `
    <poml>
      <scene>
        <screen-space>
          <element></element>
        </screen-space>
      </scene>
    </poml>
    `

    const poml = parse(xml)

    expect(poml.scene.children?.length).toBe(1)
    const screenSpaceElement = poml.scene.children?.[0]
    expect(screenSpaceElement?.type).toBe('screen-space')

    if (!('children' in screenSpaceElement)) {
      fail()
    }
    expect(screenSpaceElement.children?.length).toBe(1)
  })

  test('parse common attributes', () => {
    const xml = `
	  <poml>
	  	<scene>
        <element position="1,2,3" scale="1"></element>
        <element position="1 2    3" scale="4 5 6"></element>
        <element position=" 1, 2 3  "></element>
        <element ar-display="none"></element>
        <element ar-display="occlusion"></element>
      </scene>
	  </poml>
	  `

    const poml = parse(xml)
    expect(poml.scene.children?.length).toBe(5)

    const elements = poml.scene.children ?? []
    if (
      elements[0].type != 'element' ||
      elements[1].type != 'element' ||
      elements[2].type != 'element' ||
      elements[3].type != 'element' ||
      elements[4].type != 'element'
    ) {
      fail()
    }

    expect(elements[0].position).toStrictEqual({ x: 1, y: 2, z: 3 })
    expect(elements[1].position).toStrictEqual({ x: 1, y: 2, z: 3 })
    expect(elements[2].position).toStrictEqual({ x: 1, y: 2, z: 3 })

    expect(elements[0]['scale']).toStrictEqual(1)
    expect(elements[1]['scale']).toStrictEqual({ x: 4, y: 5, z: 6 })

    expect(elements[0]['arDisplay']).toBeUndefined()
    expect(elements[3]['arDisplay']).toBe('none')
    expect(elements[4]['arDisplay']).toBe('occlusion')
  })

  test('parse id attribute', () => {
    const xml = `
	  <poml>
	  	<scene>
        <element id="aaa"></element>
        <element id="null"></element>
        <element id="undefined"></element>
        <element id=""></element>
        <element ></element>
      </scene>
	  </poml>
	  `
    const poml = parse(xml)
    expect(poml.scene.children?.length).toBe(5)

    const elements = poml.scene.children ?? []
    if (
      elements[0].type != 'element' ||
      elements[1].type != 'element' ||
      elements[2].type != 'element' ||
      elements[3].type != 'element' ||
      elements[4].type != 'element'
    ) {
      fail()
    }
    expect(elements[0].id).toBe('aaa')
    expect(elements[1].id).toBe('null')
    expect(elements[2].id).toBe('undefined')
    expect(elements[3].id).toBe('')
    expect(elements[4].id).toBe(undefined)
  })

  test('parse custom data', () => {
    const xml = `
    <poml>
      <scene _custom-attribute1="scene custom data 1" _custom-attribute2="scene custom data 2">
      <element _custom-attribute1="element custom data 1" _custom-attribute2="element custom data 2"></element>
      </scene>
    </poml>
	  `

    const poml = parse(xml)
    const sceneCustomAttributes = poml.scene.customAttributes
    expect(sceneCustomAttributes).toStrictEqual(
      new Map([
        ['custom-attribute1', 'scene custom data 1'],
        ['custom-attribute2', 'scene custom data 2'],
      ])
    )

    expect(poml.scene.children?.length).toBe(1)

    if (!('customAttributes' in poml.scene.children?.[0])) {
      fail()
    }
    const elementCustomAttributes = poml.scene.children[0].customAttributes
    expect(elementCustomAttributes).toStrictEqual(
      new Map([
        ['custom-attribute1', 'element custom data 1'],
        ['custom-attribute2', 'element custom data 2'],
      ])
    )
  })

  test('parse child element', () => {
    const xml = `
	  <poml>
	  	<scene>
        <element>
          <model>
          </model>
          <text>
          </text>
        </element>
      </scene>
	  </poml>
	  `

    const poml = parse(xml)
    const elements = poml.scene.children
    expect(elements?.length).toBe(1)
    if (!('children' in elements?.[0])) {
      fail()
    }
    expect(elements?.[0].children?.length).toBe(2)
  })

  test('parse geo reference', () => {
    const xml = `
	  <poml>
      <scene>
        <model>
          <geo-reference id="placement-0" latitude="1" longitude="2"
          ellipsoidal-height="3" enu-rotation="0.1,-0.2,-0.3,0.4" />
        </text>
      </scene>
	  </poml>
	  `

    const poml = parse(xml)
    expect(poml.scene.children?.length).toBe(1)

    const element = poml.scene.children?.[0]
    if (!('coordinateReferences' in element)) {
      fail()
    }
    const references = element?.coordinateReferences
    expect(references?.length).toBe(1)

    const reference = references?.[0]
    expect(reference).toStrictEqual({
      type: 'geo-reference',
      id: 'placement-0',
      latitude: 1,
      longitude: 2,
      ellipsoidalHeight: 3,
      enuRotation: { x: 0.1, y: -0.2, z: -0.3, w: 0.4 },
      originalAttrs: new Map<string, string>([
        ['id', 'placement-0'],
        ['latitude', '1'],
        ['longitude', '2'],
        ['ellipsoidal-height', '3'],
        ['enu-rotation', '0.1,-0.2,-0.3,0.4'],
      ]),
    })
  })

  test('parse geo placement', () => {
    const xml = `
	  <poml>
      <scene>
        <model>
          <geo-placement id="placement-0" latitude="1" longitude="2"
          ellipsoidal-height="3" enu-rotation="0.1,-0.2,-0.3,0.4" />
        </text>
      </scene>
	  </poml>
	  `

    const poml = parse(xml)
    expect(poml.scene.children?.length).toBe(1)

    const element = poml.scene.children?.[0]
    if (!('coordinateReferences' in element)) {
      fail()
    }
    const references = element?.coordinateReferences
    expect(references?.length).toBe(1)

    const reference = references?.[0]
    expect(reference).toStrictEqual({
      type: 'geo-reference',
      id: 'placement-0',
      latitude: 1,
      longitude: 2,
      ellipsoidalHeight: 3,
      enuRotation: { x: 0.1, y: -0.2, z: -0.3, w: 0.4 },
      originalAttrs: new Map<string, string>([
        ['id', 'placement-0'],
        ['latitude', '1'],
        ['longitude', '2'],
        ['ellipsoidal-height', '3'],
        ['enu-rotation', '0.1,-0.2,-0.3,0.4'],
      ]),
    })
  })

  test('parse space reference', () => {
    const xml = `
	  <poml>
      <scene>
        <model>
          <space-reference type="space" space-type="immersal" space-id="123" position="1 2 3" rotation="0.1,0.2,0.3,0.4"/>
        </text>
      </scene>
	  </poml>
	  `

    const poml = parse(xml)

    const element = poml.scene.children?.[0]
    if (!('coordinateReferences' in element)) {
      fail()
    }
    const references = element?.coordinateReferences
    expect(references?.length).toBe(1)

    const reference = references?.[0]
    expect(reference).toStrictEqual({
      type: 'space-reference',
      id: undefined,
      spaceType: 'immersal',
      spaceId: '123',
      position: { x: 1, y: 2, z: 3 },
      rotation: { x: 0.1, y: 0.2, z: 0.3, w: 0.4 },
      originalAttrs: new Map<string, string>([
        ['type', 'space'],
        ['space-type', 'immersal'],
        ['space-id', '123'],
        ['position', '1 2 3'],
        ['rotation', '0.1,0.2,0.3,0.4'],
      ]),
    })
  })

  test('parse space placement', () => {
    const xml = `
	  <poml>
      <scene>
        <model>
          <space-placement type="space" space-type="immersal" space-id="123" position="1 2 3" rotation="0.1,0.2,0.3,0.4"/>
        </text>
      </scene>
	  </poml>
	  `

    const poml = parse(xml)

    const element = poml.scene.children?.[0]
    if (!('coordinateReferences' in element)) {
      fail()
    }
    const references = element?.coordinateReferences
    expect(references?.length).toBe(1)

    const reference = references?.[0]
    expect(reference).toStrictEqual({
      type: 'space-reference',
      id: undefined,
      spaceType: 'immersal',
      spaceId: '123',
      position: { x: 1, y: 2, z: 3 },
      rotation: { x: 0.1, y: 0.2, z: 0.3, w: 0.4 },
      originalAttrs: new Map<string, string>([
        ['type', 'space'],
        ['space-type', 'immersal'],
        ['space-id', '123'],
        ['position', '1 2 3'],
        ['rotation', '0.1,0.2,0.3,0.4'],
      ]),
    })
  })

  test('parse ws-recv-url attribute', () => {
    const xml = `
    <poml>
      <scene ws-recv-url="ws://localhost:8000">
        <element></element>
      </scene>
    </poml>
    `
    const poml = parse(xml)
    expect(poml.scene.wsRecvUrl).toBe('ws://localhost:8000')
  })

  test('parse included poml', () => {
    const xml = `
    <html>
      <p>text</p>
      <div>
        <poml>
          <scene>
            <element position="1 2 3"></element>
            <model src="test"></model>
          </scene>
        </poml>
      </div>
    </html>
    `
    const poml = parse(xml)
    expect(poml.scene.children?.length).toBe(2)
  })

  test('unsupported element tag is treated as unknown element', () => {
    const xml = `
    <poml>
      <scene>
        <text></text>
        <unsupported-element></unsupported-element>
        <model src="test"></model>
      </scene>
    </poml>
    `
    const poml = parse(xml)

    expect(poml.scene.coordinateReferences.length).toBe(0)

    expect(poml.scene.children?.length).toBe(3)
    expect(poml.scene.children?.[0].type).toBe('text')

    expect(poml.scene.children?.[1].type).toBe('?')
    if (poml.scene.children?.[1].type != '?') {
      fail()
    }

    expect(poml.scene.children?.[1].original).toHaveProperty(
      'unsupported-element'
    )

    expect(poml.scene.children?.[2].type).toBe('model')
  })

  test('elements under unsupported element tag are contained in original property', () => {
    const xml = `
    <poml>
      <scene>
        <unsupported-element>
          <model src="test"></model>
        </unsupported-element>
      </scene>
    </poml>
    `
    const poml = parse(xml)

    expect(poml.scene.coordinateReferences.length).toBe(0)

    expect(poml.scene.children?.length).toBe(1)

    if (poml.scene.children?.[0].type != '?') {
      fail()
    }

    expect(poml.scene.children?.[0].original).toHaveProperty(
      'unsupported-element'
    )

    if (!('unsupported-element' in poml.scene.children?.[0].original)) {
      fail()
    }

    const children = (poml.scene.children?.[0].original as any)[
      'unsupported-element'
    ]
    expect(children.length).toBe(1)
    expect(children[0]).toHaveProperty('model')
    expect(children[0][':@']).toHaveProperty('@_src', 'test')
  })

  test('unsupported attributes', () => {
    const xml = `
<poml>
  <scene>
    <space-reference abcde="12345">
    </space-reference>
    <element unsupported-attr="test">
    </element>
    <script src="test.wasm" unsupported-attr="xyz">
    </script>
  </scene>
</poml>
`
    const poml = parse(xml)
    const child0 = poml.scene.children[0]
    if (child0.type !== 'element') {
      fail()
    }
    expect(child0.originalAttrs?.get('unsupported-attr')).toBe('test')
    expect(
      poml.scene.scriptElements[0].originalAttrs?.get('unsupported-attr')
    ).toBe('xyz')
    expect(poml.scene.coordinateReferences[0].originalAttrs?.get('abcde')).toBe(
      '12345'
    )

    // unsupported attributes are retained when re-created
    const xml2 = build(poml)
    expect(xml2.trim()).toBe(xml.trim())
  })

  test('meta tag', () => {
    expect(parse(`<poml></poml>`).meta).toBe(undefined)
    expect(parse(`<poml><meta/></poml>`).meta).not.toBe(undefined)
  })

  test('title in meta tag', () => {
    const poml1 = parse(`
    <poml>
      <meta>
        <title>hello poml</title>
      </meta>
    </poml>
    `)
    expect(poml1.meta?.title).toBe('hello poml')

    const poml2 = parse(`
    <poml>
      <meta>
        <title></title>
      </meta>
    </poml>
    `)
    expect(poml2.meta).not.toBe(undefined)
    expect(poml2.meta!.title).toBe(undefined)
  })

  test('display and ar-display attribute', () => {
    const poml = parse(`
    <poml>
      <scene>
        <element display="none" />
        <element display="visible" />
        <element display="occlusion" />
        <element />
        <element ar-display="none" />
        <element ar-display="visible" />
        <element ar-display="occlusion" />
        <element ar-display="same-as-display" />
        <element />
      </scene>
    </poml>
    `)
    if (
      poml.scene.children[0].type != 'element' ||
      poml.scene.children[1].type != 'element' ||
      poml.scene.children[2].type != 'element' ||
      poml.scene.children[3].type != 'element' ||
      poml.scene.children[4].type != 'element' ||
      poml.scene.children[5].type != 'element' ||
      poml.scene.children[6].type != 'element' ||
      poml.scene.children[7].type != 'element' ||
      poml.scene.children[8].type != 'element'
    ) {
      fail()
    }
    expect(poml.scene.children[0].display).toBe('none')
    expect(poml.scene.children[1].display).toBe('visible')
    expect(poml.scene.children[2].display).toBe('occlusion')
    expect(poml.scene.children[3].display).toBe(undefined)
    expect(poml.scene.children[4].arDisplay).toBe('none')
    expect(poml.scene.children[5].arDisplay).toBe('visible')
    expect(poml.scene.children[6].arDisplay).toBe('occlusion')
    expect(poml.scene.children[7].arDisplay).toBe('same-as-display')
    expect(poml.scene.children[8].arDisplay).toBe(undefined)
  })

  test('build options ignore custom attributes', () => {
    const originalPoml = {
      scene: Poml.scene({
        children: [
          new PomlEmptyElement({
            customAttributes: new Map([
              ['custom-attr', 'custom element data'],
              ['custom-attr2', 'custom element data 2'],
            ]),
            children: [
              new PomlEmptyElement({
                customAttributes: new Map([
                  ['custom-attr', 'custom element data'],
                  ['custom-attr2', 'custom element data 2'],
                ]),
              }),
            ],
          }),
        ],
        customAttributes: new Map([
          ['custom-attr', 'custom scene data'],
          ['custom-attr2', 'custom scene data 2'],
        ]),
      }),
    }
    const options = { ignoreCustomAttributes: true }
    const pomlString = build(originalPoml, options)
    const poml = parse(pomlString)

    expect(poml.scene.customAttributes.size).toBe(0)

    const element = poml.scene.children[0]
    if ('customAttributes' in element) {
      expect(element.customAttributes.size).toBe(0)
    } else {
      fail()
    }

    if ('customAttributes' in element.children[0]) {
      expect(element.children[0].customAttributes.size).toBe(0)
    } else {
      fail()
    }
  })

  test('comments test', () => {
    const poml = parse(`
    <poml>
      <scene>
        <element/>
        <!-- comment -->
        <element/>
      </scene>
    </poml>
    `)
    expect(poml.scene.children.length).toBe(3)
    expect(poml.scene.children[0].type).toBe('element')

    if (poml.scene.children[1].type != '?') {
      fail()
    }
    expect(poml.scene.children[1].original).toEqual({
      '#comment': [{ '#text': ' comment ' }],
    })

    expect(poml.scene.children[2].type).toBe('element')

    expect(poml.scene.coordinateReferences.length).toBe(0)
  })

  test('comment under element tag test', () => {
    const poml = parse(`
    <poml>
      <scene>
        <element>
          <!-- comment -->
        </element>
      </scene>
    </poml>
    `)
    expect(poml.scene.children.length).toBe(1)

    if (poml.scene.children[0].type != 'element') {
      fail()
    }

    expect(poml.scene.children[0].coordinateReferences.length).toBe(0)

    if (poml.scene.children[0].children[0].type != '?') {
      fail()
    }

    expect(poml.scene.children[0].children[0].original).toEqual({
      '#comment': [{ '#text': ' comment ' }],
    })
  })

  // build and parse tests

  test.each([
    {
      scene: Poml.scene({
        children: [
          Poml.emptyElement({
            position: { x: 1, y: 2, z: 3 },
            scale: { x: 4, y: 5, z: 6 },
            rotation: { x: 0.1, y: -0.2, z: -0.3, w: 0.4 },
          }),
        ],
      }),
    },
    {
      scene: Poml.scene({
        children: [
          Poml.emptyElement({
            scaleByDistance: true,
          }),
          Poml.emptyElement({
            scaleByDistance: 1.1,
          }),
          Poml.emptyElement({
            minScale: 0.1,
          }),
          Poml.emptyElement({
            minScale: { x: 2, y: 3, z: 4 },
          }),
          Poml.emptyElement({
            maxScale: 0.1,
          }),
          Poml.emptyElement({
            maxScale: { x: 2, y: 3, z: 4 },
          }),
        ],
      }),
    },
    {
      scene: Poml.scene({
        children: [
          new PomlEmptyElement({
            position: { x: 1, y: 2, z: 3 },
            scale: { x: 4, y: 5, z: 6 },
            rotation: { x: 0.1, y: -0.2, z: -0.3, w: 0.4 },
            arDisplay: 'none',
          }),
        ],
      }),
    },
    {
      scene: Poml.scene({
        children: [
          new PomlEmptyElement({
            customAttributes: new Map([
              ['custom-attr', 'custom element data'],
              ['custom-attr2', 'custom element data 2'],
            ]),
          }),
        ],
        customAttributes: new Map([
          ['custom-attr', 'custom scene data'],
          ['custom-attr2', 'custom scene data 2'],
        ]),
      }),
    },
    {
      scene: Poml.scene({
        children: [
          new PomlModelElement({
            src: 'model1',
          }),
        ],
      }),
    },
    {
      scene: Poml.scene({
        children: [
          new PomlTextElement({
            text: 'text1',
            fontSize: '0.1m',
            fontColor: '#FFFFFF',
            backgroundColor: '#123456',
            webLink: 'http://hololab.co.jp',
          }),
        ],
      }),
    },
    {
      scene: Poml.scene({
        children: [
          new PomlImageElement({
            src: 'image1',
          }),
        ],
      }),
    },
    {
      scene: Poml.scene({
        children: [
          new PomlEmptyElement({
            children: [
              new PomlModelElement(),
              new PomlTextElement(),
              new PomlVideoElement(),
            ],
          }),
          new PomlModelElement(),
        ],
      }),
    },
    {
      scene: Poml.scene({
        coordinateReferences: [
          {
            type: 'geo-reference',
            latitude: 1,
            longitude: 2,
            ellipsoidalHeight: 3,
            enuRotation: { x: 0.1, y: 0.2, z: 0.3, w: 0.4 },
          },
        ],
      }),
    },
    {
      scene: Poml.scene({
        children: [
          new PomlEmptyElement({
            coordinateReferences: [
              {
                type: 'geo-reference',
                id: 'placement-0',
                latitude: 1,
                longitude: 2,
                ellipsoidalHeight: 3,
                enuRotation: { x: 0.1, y: 0.2, z: 0.3, w: 0.4 },
              },
              {
                type: 'space-reference',
                spaceType: 'VuforiaAreaTarget',
                spaceId: 'sampleSpace',
              },
              {
                type: 'space-reference',
                spaceType: 'Immersal',
                spaceId: 'sampleSpace2',
                position: { x: 1, y: 2, z: 3 },
                rotation: { x: 0.1, y: 0.2, z: 0.3, w: 0.4 },
              },
            ],
          }),
        ],
      }),
    },
    {
      scene: Poml.scene({
        children: [
          new PomlEmptyElement({
            scriptElements: [
              {
                type: 'script',
                src: 'test0.wasm',
                args: [],
                filename: 'name0',
              },
            ],
          }),
        ],
        scriptElements: [
          {
            type: 'script',
            src: 'test1.wasm',
            args: ['a', 'b'],
            filename: 'name1',
          },
        ],
      }),
    },
    {
      scene: Poml.scene({
        children: [
          new PomlEmptyElement({
            id: 'test_element',
            children: [
              new PomlModelElement({
                id: 'test_model1',
              }),
              new PomlTextElement({
                id: 'test_text',
              }),
            ],
          }),
          new PomlModelElement({
            id: 'test_model2',
          }),
        ],
      }),
    },

    {
      scene: Poml.scene({
        wsRecvUrl: 'ws://localhost:8000',
        children: [
          Poml.emptyElement({
            position: { x: 1, y: 2, z: 3 },
            scale: { x: 4, y: 5, z: 6 },
            rotation: { x: 0.1, y: -0.2, z: -0.3, w: 0.4 },
          }),
        ],
      }),
    },
    {
      scene: Poml.scene({
        children: [
          new PomlGeometryElement({
            geometries: [
              new LineGeometry({
                type: 'line',
                positions: [
                  { type: 'relative', x: 1, y: 2, z: 3 },
                  { type: 'relative', x: 4, y: 5, z: 6 },
                ],
                color: 'blue',
              }),
            ],
            children: [
              new PomlEmptyElement({ id: 'aaa' }),
              new PomlEmptyElement({ id: 'bbb' }),
            ],
          }),
        ],
      }),
    },
    {
      scene: Poml.scene({
        children: [
          new PomlGeometryElement({
            geometries: [
              new PolygonGeometry({
                type: 'polygon',
                vertices: {
                  type: 'relative',
                  positions: [
                    { x: 1, y: 2, z: 3 },
                    { x: 4, y: 5, z: 6 },
                  ],
                },
                color: 'blue',
              }),
            ],
          }),
          new PomlGeometryElement({
            geometries: [
              new PolygonGeometry({
                type: 'polygon',
                vertices: {
                  type: 'geo-location',
                  positions: [
                    { longitude: 1, latitude: 2, ellipsoidalHeight: 3 },
                    { longitude: 4, latitude: 5, ellipsoidalHeight: 6 },
                  ],
                },
                color: 'blue',
              }),
            ],
          }),
        ],
      }),
    },
    {
      scene: Poml.scene({
        children: [
          new PomlModelElement({
            src: 'srcUrl',
            filename: 'srcFilename',
          }),
        ],
      }),
    },
    {
      scene: Poml.scene({
        children: [
          new PomlCesium3dTilesElement({
            src: 'tileset',
          }),
        ],
      }),
    },
    {
      scene: Poml.scene({
        children: [
          new PomlScreenSpaceElement({
            children: [new PomlEmptyElement()],
          }),
        ],
      }),
    },
    {
      meta: new Meta(),
      scene: Poml.scene({}),
    },
    {
      meta: new Meta({
        title: 'poml title',
      }),
      scene: Poml.scene({}),
    },
    {
      scene: Poml.scene({
        children: [
          new PomlEmptyElement({ arDisplay: 'none' }),
          new PomlEmptyElement({ arDisplay: 'visible' }),
          new PomlEmptyElement({ arDisplay: 'occlusion' }),
          new PomlEmptyElement({ arDisplay: 'same-as-display' }),
          new PomlEmptyElement({ arDisplay: undefined }),
        ],
      }),
    },
    {
      scene: Poml.scene({
        children: [
          new PomlEmptyElement({ display: 'none' }),
          new PomlEmptyElement({ display: 'visible' }),
          new PomlEmptyElement({ display: 'occlusion' }),
          new PomlEmptyElement({ display: undefined }),
        ],
      }),
    },
    {
      scene: Poml.scene({
        children: [
          new PomlEmptyElement(),
          new PomlUnknown({
            '#comment': [{ '#text': 'comment' }],
          } as FxUnknownElement),
          new PomlEmptyElement(),
          new PomlEmptyElement({
            children: [
              new PomlUnknown({
                '#comment': [{ '#text': 'comment2' }],
              } as FxUnknownElement),
            ],
          }),
        ],
      }),
    },
    {
      scene: Poml.scene({
        children: [
          new PomlEmptyElement(),
          new PomlUnknown({
            'unsupported-tag': [],
            ':@': { '@_unsuppreted-attr': 'value' },
          } as FxUnknownElement),
        ],
      }),
    },
    {
      scene: Poml.scene({
        children: [
          new PomlUnknown({
            'unsupported-tag': [
              {
                model: [],
                ':@': {
                  '@_src': 'value1',
                  '@_unsuppreted-attr': 'value2',
                },
              },
            ],
            ':@': { '@_unsuppreted-attr': 'value3' },
          } as FxUnknownElement),
        ],
      }),
    },
  ])('build and parse %o', (poml) => {
    const xml = build(poml as Poml)
    const parsedPoml = parse(xml)

    // remove originalAttrs from parsedPoml (only for test)
    const recurseChildren: (
      children: MaybePomlElement[]
    ) => MaybePomlElement[] = (children) =>
      children.flatMap((element) =>
        element.type === '?'
          ? [element]
          : [element, ...recurseChildren(element.children)]
      )

    parsedPoml.scene.originalAttrs = undefined
    parsedPoml.scene.scriptElements.forEach(
      (s) => (s.originalAttrs = undefined)
    )
    parsedPoml.scene.coordinateReferences.forEach(
      (s) => (s.originalAttrs = undefined)
    )
    recurseChildren(parsedPoml.scene.children).forEach((element) => {
      if (element.type !== '?') {
        element.originalAttrs = undefined
        element.scriptElements.forEach((s) => (s.originalAttrs = undefined))
        element.coordinateReferences.forEach(
          (c) => (c.originalAttrs = undefined)
        )
      }
    })

    expect(parsedPoml).toEqual(poml)
  })
})
