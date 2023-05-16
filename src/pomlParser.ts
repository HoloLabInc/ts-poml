import { XMLBuilder, XMLParser } from 'fast-xml-parser'
import {
  GeoLocation,
  PomlGeometry,
  LineGeometry,
  CoordinateReference,
  Poml,
  PomlElement,
  PomlEmptyElement,
  PomlGeometryElement,
  PomlImageElement,
  PomlModelElement,
  PomlTextElement,
  PomlVideoElement,
  PomlCesium3dTilesElement,
  Position,
  RelativePosition,
  Rotation,
  Scale,
  Scene,
  Meta,
  Display,
  ArDisplay,
  ScriptElement,
  PomlScreenSpaceElement,
  PomlUnknownElement,
} from '.'
import {
  FxElement,
  FxElementAttributesBase,
  FxGeometry,
  FxGeometryElementAttributes,
  FxImageElementAttributes,
  FxLineGeometry,
  FxModelElementAttributes,
  FxSpaceReferenceElementAttributes,
  FxPoml,
  FxPomlRoot,
  FxScene,
  FxMeta,
  FxTitle,
  FxTextElementAttributes,
  FxVideoElementAttributes,
  FxCesium3dTilesElementAttributes,
  isFxGeometry,
  FxGeoReferenceElementAttributes,
  FxScriptElementAttributes,
} from './fastXmlParserPomlType'

const parseAsBoolean = (text: string | undefined) => {
  if (!text) {
    return undefined
  }

  return text.toLocaleLowerCase() == 'true'
}

const buildBooleanString = (
  value: boolean | undefined,
  ignoreFalse: boolean = true
) => {
  if (value == undefined) {
    return undefined
  }

  if (value) {
    return 'true'
  } else {
    if (ignoreFalse) {
      return undefined
    } else {
      return 'false'
    }
  }
}

const parseAsBooleanOrNumber = (text: string | undefined) => {
  if (!text) {
    return undefined
  }

  if (text.toLocaleLowerCase() == 'true') {
    return true
  }

  return parseAsNumber(text)
}

const buildBooleanOrNumberString = (
  value: boolean | number | undefined,
  ignoreFalse: boolean = true
) => {
  if (value == undefined) {
    return undefined
  }

  if (typeof value == 'boolean') {
    return buildBooleanString(value, ignoreFalse)
  }

  return value.toString()
}

const parseAsNumber = (text: string | undefined) => {
  if (!text) {
    return undefined
  }

  const num = Number.parseFloat(text)
  if (Number.isNaN(num)) {
    return undefined
  } else {
    return num
  }
}

const parseAsVector3 = (text: string | undefined) => {
  if (!text) {
    return undefined
  }

  const r = /[,\s]+/g
  const tokens = text.split(r)

  if (tokens.length == 3) {
    const x = Number.parseFloat(tokens[0])
    const y = Number.parseFloat(tokens[1])
    const z = Number.parseFloat(tokens[2])

    if (!Number.isNaN(x) && !Number.isNaN(y) && !Number.isNaN(z)) {
      return {
        x,
        y,
        z,
      }
    }
  }

  return undefined
}

const parseAsQuaternion = (text: string | undefined) => {
  if (!text) {
    return undefined
  }

  const r = /[,\s]+/g
  const tokens = text.split(r)

  if (tokens.length == 4) {
    const x = Number.parseFloat(tokens[0])
    const y = Number.parseFloat(tokens[1])
    const z = Number.parseFloat(tokens[2])
    const w = Number.parseFloat(tokens[3])

    if (
      !Number.isNaN(x) &&
      !Number.isNaN(y) &&
      !Number.isNaN(z) &&
      !Number.isNaN(w)
    ) {
      return {
        x,
        y,
        z,
        w,
      }
    }
  }

  return undefined
}

const parseAsStringArray = (text: string | undefined): string[] => {
  if (!text) {
    return []
  }

  return text.trim().split(' ')
}

const parsePositionString = (text: string | undefined) => {
  return parseAsVector3(text)
}

const parseScaleString = (text: string | undefined) => {
  return parseAsVector3(text) ?? parseAsNumber(text)
}

const parseRotationString = (text: string | undefined) => {
  return parseAsQuaternion(text)
}

const buildPositionString = (position: Position | undefined) => {
  return position ? `${position.x} ${position.y} ${position.z}` : undefined
}

const buildScaleString = (position: Scale | undefined) => {
  if (position === undefined) {
    return undefined
  } else if (typeof position === 'number') {
    return position.toString()
  }
  return `${position.x} ${position.y} ${position.z}`
}

const buildRotationString = (rotation: Rotation | undefined) => {
  if (rotation === undefined) {
    return undefined
  }
  return `${rotation.x} ${rotation.y} ${rotation.z} ${rotation.w}`
}

const parseGeoLocationString = (
  text: string | undefined
): GeoLocation | undefined => {
  const vec = parseAsVector3(text)
  if (vec === undefined) {
    return undefined
  }
  return {
    type: 'geo-location',
    latitude: vec.x,
    longitude: vec.y,
    ellipsoidalHeight: vec.z,
  }
}

const parseRelativePositionString = (
  text: string | undefined
): RelativePosition | undefined => {
  const p = parsePositionString(text)
  if (p === undefined) {
    return undefined
  }
  return {
    type: 'relative',
    ...p,
  }
}

const parseCustomAttributes = (attributeObjet: object): Map<string, string> => {
  const customAttributes = new Map<string, string>()
  for (const [key, value] of Object.entries(attributeObjet)) {
    if (key.startsWith('@__')) {
      const mapKey = key.substring(3)
      customAttributes.set(mapKey, value)
    }
  }
  return customAttributes
}

const buildGeoLocationOrRelativeString = (
  p: GeoLocation | RelativePosition
) => {
  switch (p.type) {
    case 'geo-location': {
      return `${p.latitude} ${p.longitude} ${p.ellipsoidalHeight}`
    }
    case 'relative': {
      return `${p.x} ${p.y} ${p.z}`
    }
  }
}

const buildArgsString = (args: string[]) => {
  if (args.length === 0) {
    return undefined
  }
  return args.join(' ')
}

export type BuildOptions = {
  ignoreCustomAttributes?: boolean
}

export class PomlParser {
  readonly emptyPoml = { scene: { elements: [] } }

  parse(poml: string): Poml {
    const fxPoml = this.parseToFxPomlRoot(poml)
    const pomlObject = this.fxPomlToPoml(fxPoml)
    return pomlObject
  }

  build(poml: Poml, options?: BuildOptions): string {
    const fxPomlRoot = this.pomlToFxPomlRoot(poml, options)
    const pomlString = this.buildFromFxPomlRoot(fxPomlRoot)
    return pomlString
  }

  private parseToFxPomlRoot(poml: string) {
    const options = {
      ignoreAttributes: false,
      preserveOrder: true,
    }

    const parser = new XMLParser(options)
    const result = parser.parse(poml)
    const fxPoml = this.findPomlRoot(result[0])
    return fxPoml
  }

  private findPomlRoot(obj: any): FxPoml | undefined {
    if ('poml' in obj) {
      return obj as FxPoml
    }
    for (const key in obj) {
      if (key.startsWith('#')) {
        continue
      }
      if (key.startsWith(':')) {
        continue
      }
      const children = obj[key]
      for (const child of children) {
        const root = this.findPomlRoot(child)
        if (root !== undefined) {
          return root
        }
      }
    }
    return undefined
  }

  private buildFromFxPomlRoot(fxPomlRoot: FxPomlRoot): string {
    const options = {
      ignoreAttributes: false,
      preserveOrder: true,
      format: true,
    }

    const builder = new XMLBuilder(options)
    const result = builder.build(fxPomlRoot).trim()
    return result
  }

  private fxPomlToPoml(fxPoml: FxPoml | undefined): Poml {
    if (fxPoml === undefined) {
      return new Poml()
    }

    const fxScene = fxPoml.poml.find((x): x is FxScene => 'scene' in x)
    const fxElements = fxScene?.scene ?? []
    const sceneAttr = fxScene?.[':@']

    let meta: Meta | undefined = undefined
    const fxMeta = fxPoml.poml.find((x): x is FxMeta => 'meta' in x)
    if (fxMeta) {
      const fxTitle = fxMeta.meta.find((x): x is FxTitle => 'title' in x)
      const title = fxTitle?.title[0]?.['#text']

      meta = new Meta({
        title: title,
      })
    }
    const wsRecvUrl = sceneAttr?.['@_ws-recv-url']
    const customAttributes =
      sceneAttr !== undefined
        ? parseCustomAttributes(sceneAttr)
        : new Map<string, string>()

    const { children, coordinateReferences, scriptElements } =
      this.parseChildren(fxElements)

    const poml: Poml = {
      scene: new Scene({
        children: children,
        coordinateReferences: coordinateReferences,
        scriptElements: scriptElements,
        wsRecvUrl: wsRecvUrl,
        customAttributes: customAttributes,
      }),
      meta: meta,
    }
    return poml
  }

  private pomlToFxPomlRoot(poml: Poml, options?: BuildOptions): FxPomlRoot {
    const fxPomlChildren: FxPoml['poml'] = []

    if (poml.meta) {
      const metaChildren: FxMeta['meta'] = []
      if (poml.meta.title !== undefined) {
        metaChildren.push({
          title: [{ '#text': poml.meta.title }],
        })
      }
      fxPomlChildren.push({
        meta: metaChildren,
      })
    }

    // scene to FxScene
    const scene = poml.scene
    const placements = this.coordinateReferencesToFxElements(
      scene.coordinateReferences
    )
    const childElements = this.childrenToFxElements(scene.children, options)
    const scriptElements = this.scriptElementsToFxElements(scene.scriptElements)

    let sceneAttributes: FxElementAttributesBase = {}

    if (options?.ignoreCustomAttributes !== true) {
      PomlParser.setCustomAttributes(
        sceneAttributes as { [key: string]: string },
        scene.customAttributes
      )
    }

    const fxScene: FxScene = {
      scene: [...placements, ...childElements, ...scriptElements],
      ':@': sceneAttributes,
    }

    fxPomlChildren.push(fxScene)

    const fxPoml: FxPoml = {
      poml: fxPomlChildren,
    }

    if (poml.scene.wsRecvUrl) {
      Object.assign(fxPoml.poml[0], {
        ':@': {
          '@_ws-recv-url': poml.scene.wsRecvUrl,
        },
      })
    }

    return [fxPoml]
  }

  private parseChildren = (childElements: FxElement[]) => {
    const elements = childElements.map(this.fxElementToPomlElement.bind(this))

    return {
      children: this.filterPomlElements(elements),
      coordinateReferences: this.filterCoordinateReferences(elements),
      scriptElements: this.filterScriptElements(elements),
    }
  }

  private filterPomlElements = (
    childElements: (PomlElement | CoordinateReference | ScriptElement)[]
  ): PomlElement[] => {
    return childElements.filter((x): x is PomlElement => 'children' in x)
  }

  private filterCoordinateReferences = (
    childElements: (PomlElement | CoordinateReference | ScriptElement)[]
  ): CoordinateReference[] => {
    return childElements.filter(
      (x): x is CoordinateReference => !('children' in x) && !('src' in x)
    )
  }

  private filterScriptElements = (
    childElements: (PomlElement | CoordinateReference | ScriptElement)[]
  ): ScriptElement[] => {
    return childElements.filter(
      (x): x is ScriptElement => !('children' in x) && 'src' in x
    )
  }

  private fxElementToPomlElement(
    fxElement: FxElement
  ): PomlElement | CoordinateReference | ScriptElement {
    const commonAttr = fxElement[':@'] ?? {}

    // read common attributes
    const rotationMode = commonAttr['@_rotation-mode']
    const position = parsePositionString(commonAttr['@_position'])
    const scale = parseScaleString(commonAttr['@_scale'])
    const rotation = parseRotationString(commonAttr['@_rotation'])

    const scaleByDistance = parseAsBooleanOrNumber(
      commonAttr['@_scale-by-distance']
    )
    const minScale = parseScaleString(commonAttr['@_min-scale'])
    const maxScale = parseScaleString(commonAttr['@_max-scale'])
    const display: Display | undefined = (() => {
      switch (commonAttr['@_display']) {
        case 'none':
          return 'none'
        case 'occlusion':
          return 'occlusion'
        case 'visible':
          return 'visible'
        default:
          return undefined
      }
    })()
    const arDisplay: ArDisplay | undefined = (() => {
      switch (commonAttr['@_ar-display']) {
        case 'none':
          return 'none'
        case 'occlusion':
          return 'occlusion'
        case 'visible':
          return 'visible'
        case 'same-as-display':
          return 'same-as-display'
        default:
          return undefined
      }
    })()
    const id = commonAttr['@_id']
    const webLink = commonAttr['@_web-link']
    const wsRecvUrl = commonAttr['@_ws-recv-url']

    const customAttributes = parseCustomAttributes(commonAttr)

    let commonElement = {
      rotationMode,
      position,
      scale,
      rotation,
      scaleByDistance,
      minScale,
      maxScale,
      display,
      arDisplay,
      id,
      webLink,
      wsRecvUrl,
      customAttributes,
    }

    // model tag
    if ('model' in fxElement) {
      const attr = fxElement[':@'] ?? {}
      const src = attr['@_src']
      const filename = attr['@_filename']

      const childElements = this.parseChildren(fxElement.model)

      return new PomlModelElement({
        ...commonElement,
        ...childElements,
        src,
        filename,
      })
    }

    // text tag
    if ('text' in fxElement) {
      const attr = fxElement[':@'] ?? {}
      const text = attr['@_text']
      const fontSize = attr['@_font-size']
      const fontColor = attr['@_font-color']
      const backgroundColor = attr['@_background-color']

      const childElements = this.parseChildren(fxElement.text)

      return new PomlTextElement({
        ...commonElement,
        ...childElements,
        text,
        fontSize,
        fontColor,
        backgroundColor,
      })
    }

    // image tag
    if ('image' in fxElement) {
      const attr = fxElement[':@'] ?? {}
      const src = attr['@_src']
      const filename = attr['@_filename']

      const childElements = this.parseChildren(fxElement.image)

      return new PomlImageElement({
        ...commonElement,
        ...childElements,
        src,
        filename,
      })
    }

    // video tag
    if ('video' in fxElement) {
      const attr = fxElement[':@'] ?? {}
      const src = attr['@_src']
      const filename = attr['@_filename']
      const childElements = this.parseChildren(fxElement.video)

      return new PomlVideoElement({
        ...commonElement,
        ...childElements,
        src,
        filename,
      })
    }

    // cesium3dtiles tag
    if ('cesium3dtiles' in fxElement) {
      const attr = fxElement[':@'] ?? {}
      const src = attr['@_src']
      const filename = attr['@_filename']
      const childElements = this.parseChildren(fxElement.cesium3dtiles)

      return new PomlCesium3dTilesElement({
        ...commonElement,
        ...childElements,
        src,
        filename,
      })
    }

    // geometry tag
    if ('geometry' in fxElement) {
      const attr = fxElement[':@'] ?? {}
      const positionType = (() => {
        const positionTypeStr = attr['@_position-type']
        switch (positionTypeStr) {
          case 'relative':
          case 'geo-location': {
            return positionTypeStr
          }
          default: {
            return 'relative'
          }
        }
      })()

      const geometries: PomlGeometry[] = []
      const fxChildren: FxElement[] = []
      fxElement.geometry.forEach((fxChild) => {
        if (isFxGeometry(fxChild)) {
          const g = this.fxGeometryToGeometry(fxChild, positionType)
          if (g) {
            geometries.push(g)
          }
        } else {
          fxChildren.push(fxChild)
        }
      })
      const childElements = this.parseChildren(fxChildren)
      return new PomlGeometryElement({
        ...commonElement,
        ...childElements,
        geometries: geometries,
      })
    }

    // space-reference, space-placement tag
    if ('space-reference' in fxElement || 'space-placement' in fxElement) {
      const attr = fxElement[':@'] ?? {}
      const spaceId = attr['@_space-id']
      const spaceType = attr['@_space-type']
      return {
        type: 'space-reference',
        id,
        spaceType,
        spaceId,
        position,
        rotation,
      }
    }

    // geo-reference, geo-placement tag
    if ('geo-reference' in fxElement || 'geo-placement' in fxElement) {
      const attr = fxElement[':@'] ?? {}
      const latitude = parseAsNumber(attr['@_latitude'])
      const longitude = parseAsNumber(attr['@_longitude'])
      const ellipsoidalHeight = parseAsNumber(attr['@_ellipsoidal-height'])
      const enuRotation = parseRotationString(attr['@_enu-rotation'])
      return {
        type: 'geo-reference',
        id,
        latitude,
        longitude,
        ellipsoidalHeight,
        enuRotation,
      }
    }

    // script tag
    if ('script' in fxElement) {
      const attr = fxElement[':@'] ?? {}
      const src = attr['@_src']
      const filename = attr['@_filename']
      const args = parseAsStringArray(attr['@_args'])
      return {
        type: 'script',
        id,
        src,
        filename,
        args,
      }
    }

    // screen-space tag
    if ('screen-space' in fxElement) {
      const childElements = this.parseChildren(fxElement['screen-space'] ?? [])

      return new PomlScreenSpaceElement({
        ...commonElement,
        ...childElements,
      })
    }

    if ('element' in fxElement) {
      const childElements = this.parseChildren(fxElement.element ?? [])

      return new PomlEmptyElement({
        ...commonElement,
        ...childElements,
      })
    }

    {
      // unkown elements
      // For example, tagname is 'foo' if the element is `<foo></foo>`

      const tagname: string | undefined = Object.keys(fxElement)[0]
      if (tagname !== undefined) {
        const array: any = (fxElement as any)[tagname]
        if (array instanceof Array) {
          const childElements = this.parseChildren(array as FxElement[])
          console.log(childElements)
          return new PomlUnknownElement({
            ...commonElement,
            ...childElements,
          })
        } else {
          return new PomlUnknownElement({
            ...commonElement,
          })
        }
      }
    }

    throw new Error('invalid xml')
  }

  private fxGeometryToGeometry(
    geometry: FxGeometry,
    positionType: 'relative' | 'geo-location'
  ): PomlGeometry | undefined {
    if ('line' in geometry) {
      const attr = geometry[':@'] ?? {}
      const defaultRelative = () => {
        return {
          type: 'relative' as const,
          x: 0,
          y: 0,
          z: 0,
        }
      }
      const defaultGeoLocation = () => {
        return {
          type: 'geo-location' as const,
          latitude: 0,
          longitude: 0,
          ellipsoidalHeight: 0,
        }
      }
      const parsePositions =
        positionType === 'relative'
          ? (s?: string, e?: string) =>
              [
                parseRelativePositionString(s) ?? defaultRelative(),
                parseRelativePositionString(e) ?? defaultRelative(),
              ] as const
          : (s?: string, e?: string) =>
              [
                parseGeoLocationString(s) ?? defaultGeoLocation(),
                parseGeoLocationString(e) ?? defaultGeoLocation(),
              ] as const
      const line = new LineGeometry({
        positions: parsePositions(attr['@_start'], attr['@_end']),
        color: attr['@_color'],
      })
      return line
    }

    return undefined
  }

  private setAttribute<T, K extends keyof T, U extends T[K]>(
    obj: T,
    key: K,
    value: U
  ) {
    if (value != undefined) {
      obj[key] = value
    }
  }

  private static setCustomAttributes(
    obj: { [key: string]: string },
    customAttributes: Map<string, string>
  ) {
    customAttributes.forEach((value, key) => {
      obj[`@__${key}`] = value
    })
  }

  private coordinateReferencesToFxElements(
    coordinateReferences: CoordinateReference[]
  ): FxElement[] {
    return coordinateReferences.map(
      this.coordinateReferencesToFxElement.bind(this)
    )
  }

  private scriptElementsToFxElements(
    scriptElements: ScriptElement[]
  ): FxElement[] {
    return scriptElements.map(this.scriptElementToFxElement.bind(this))
  }

  private childrenToFxElements(
    children: PomlElement[],
    options?: BuildOptions
  ): FxElement[] {
    return children.map((x) => this.pomlElementToFxElement(x, options))
  }

  private coordinateReferencesToFxElement(
    coordinateReferences: CoordinateReference
  ): FxElement {
    if (coordinateReferences.type === 'space-reference') {
      let attrs: FxSpaceReferenceElementAttributes = {}
      this.setAttribute(attrs, '@_id', coordinateReferences.id)
      this.setAttribute(attrs, '@_space-id', coordinateReferences.spaceId)
      this.setAttribute(attrs, '@_space-type', coordinateReferences.spaceType)

      const position = buildPositionString(coordinateReferences.position)
      this.setAttribute(attrs, '@_position', position)

      const rotation = buildRotationString(coordinateReferences.rotation)
      this.setAttribute(attrs, '@_rotation', rotation)

      return {
        'space-reference': [],
        ':@': attrs,
      }
    }
    if (coordinateReferences.type === 'geo-reference') {
      let attrs: FxGeoReferenceElementAttributes = {}
      const lat = coordinateReferences.latitude?.toString()
      const lon = coordinateReferences.longitude?.toString()
      const height = coordinateReferences.ellipsoidalHeight?.toString()
      const rotation = buildRotationString(coordinateReferences.enuRotation)

      this.setAttribute(attrs, '@_id', coordinateReferences.id)
      this.setAttribute(attrs, '@_latitude', lat)
      this.setAttribute(attrs, '@_longitude', lon)
      this.setAttribute(attrs, '@_ellipsoidal-height', height)
      this.setAttribute(attrs, '@_enu-rotation', rotation)
      return {
        'geo-reference': [],
        ':@': attrs,
      }
    }

    return {
      'space-reference': [],
      ':@': {},
    }
  }

  private scriptElementToFxElement(scriptElement: ScriptElement): FxElement {
    let attrs: FxScriptElementAttributes = {}
    this.setAttribute(attrs, '@_id', scriptElement.id)
    this.setAttribute(attrs, '@_src', scriptElement.src)
    this.setAttribute(attrs, '@_filename', scriptElement.filename)
    this.setAttribute(attrs, '@_args', buildArgsString(scriptElement.args))
    return {
      script: [],
      ':@': attrs,
    }
  }

  private pomlElementToFxElement(
    pomlElement: PomlElement,
    options?: BuildOptions
  ): FxElement {
    // common attributes
    let commonAttributes: FxElementAttributesBase = {}

    this.setAttribute(
      commonAttributes,
      '@_rotation-mode',
      pomlElement.rotationMode
    )
    const position = buildPositionString(pomlElement.position)
    this.setAttribute(commonAttributes, '@_position', position)

    const scale = buildScaleString(pomlElement.scale)
    this.setAttribute(commonAttributes, '@_scale', scale)

    const rotation = buildRotationString(pomlElement.rotation)
    this.setAttribute(commonAttributes, '@_rotation', rotation)

    const scaleByDistance = buildBooleanOrNumberString(
      pomlElement.scaleByDistance
    )
    this.setAttribute(commonAttributes, '@_scale-by-distance', scaleByDistance)

    const minScale = buildScaleString(pomlElement.minScale)
    this.setAttribute(commonAttributes, '@_min-scale', minScale)

    const maxScale = buildScaleString(pomlElement.maxScale)
    this.setAttribute(commonAttributes, '@_max-scale', maxScale)

    this.setAttribute(commonAttributes, '@_display', pomlElement.display)
    this.setAttribute(commonAttributes, '@_ar-display', pomlElement.arDisplay)

    this.setAttribute(commonAttributes, '@_id', pomlElement.id)
    this.setAttribute(commonAttributes, '@_web-link', pomlElement.webLink)
    this.setAttribute(commonAttributes, '@_ws-recv-url', pomlElement.wsRecvUrl)

    if (options?.ignoreCustomAttributes !== true) {
      PomlParser.setCustomAttributes(
        commonAttributes as { [key: string]: string },
        pomlElement.customAttributes
      )
    }

    const scriptElements = this.scriptElementsToFxElements(
      pomlElement.scriptElements
    )

    if (pomlElement.type == 'model') {
      let modelAttributes: FxModelElementAttributes = {
        ...commonAttributes,
      }
      this.setAttribute(modelAttributes, '@_src', pomlElement.src)
      this.setAttribute(modelAttributes, '@_filename', pomlElement.filename)
      return {
        model: [
          ...this.coordinateReferencesToFxElements(
            pomlElement.coordinateReferences
          ),
          ...this.childrenToFxElements(pomlElement.children, options),
          ...scriptElements,
        ],
        ':@': modelAttributes,
      }
    }

    if (pomlElement.type == 'text') {
      let textAttributes: FxTextElementAttributes = {
        ...commonAttributes,
      }
      this.setAttribute(textAttributes, '@_text', pomlElement.text)
      this.setAttribute(textAttributes, '@_font-size', pomlElement.fontSize)
      this.setAttribute(textAttributes, '@_font-color', pomlElement.fontColor)
      this.setAttribute(
        textAttributes,
        '@_background-color',
        pomlElement.backgroundColor
      )
      return {
        text: [
          ...this.coordinateReferencesToFxElements(
            pomlElement.coordinateReferences
          ),
          ...this.childrenToFxElements(pomlElement.children, options),
          ...scriptElements,
        ],
        ':@': textAttributes,
      }
    }

    if (pomlElement.type == 'image') {
      let imageAttributes: FxImageElementAttributes = {
        ...commonAttributes,
      }
      this.setAttribute(imageAttributes, '@_src', pomlElement.src)
      this.setAttribute(imageAttributes, '@_filename', pomlElement.filename)
      return {
        image: [
          ...this.coordinateReferencesToFxElements(
            pomlElement.coordinateReferences
          ),
          ...this.childrenToFxElements(pomlElement.children, options),
          ...scriptElements,
        ],
        ':@': imageAttributes,
      }
    }

    if (pomlElement.type == 'video') {
      let videoAttributes: FxVideoElementAttributes = {
        ...commonAttributes,
      }
      this.setAttribute(videoAttributes, '@_src', pomlElement.src)
      this.setAttribute(videoAttributes, '@_filename', pomlElement.filename)
      return {
        video: [
          ...this.coordinateReferencesToFxElements(
            pomlElement.coordinateReferences
          ),
          ...this.childrenToFxElements(pomlElement.children, options),
          ...scriptElements,
        ],
        ':@': videoAttributes,
      }
    }

    if (pomlElement.type == 'geometry') {
      let geometryAttributes: FxGeometryElementAttributes = {
        ...commonAttributes,
      }
      const positionType = pomlElement.geometries[0].positionType
      this.setAttribute(geometryAttributes, '@_position-type', positionType)
      const geometries: FxGeometry[] = []
      pomlElement.geometries.forEach((g) => {
        const fxGeometry = this.buildGeometry(g)
        if (fxGeometry !== undefined) {
          geometries.push(fxGeometry)
        }
      })
      return {
        geometry: [
          ...this.coordinateReferencesToFxElements(
            pomlElement.coordinateReferences
          ),
          ...this.childrenToFxElements(pomlElement.children, options),
          ...scriptElements,
          ...geometries,
        ],
        ':@': geometryAttributes,
      }
    }

    if (pomlElement.type == 'cesium3dtiles') {
      let cesium3dTilesAttributes: FxCesium3dTilesElementAttributes = {
        ...commonAttributes,
      }
      this.setAttribute(cesium3dTilesAttributes, '@_src', pomlElement.src)
      this.setAttribute(
        cesium3dTilesAttributes,
        '@_filename',
        pomlElement.filename
      )
      return {
        cesium3dtiles: [
          ...this.coordinateReferencesToFxElements(
            pomlElement.coordinateReferences
          ),
          ...this.childrenToFxElements(pomlElement.children, options),
          ...scriptElements,
        ],
        ':@': cesium3dTilesAttributes,
      }
    }

    if (pomlElement.type == 'screen-space') {
      return {
        'screen-space': [
          ...this.coordinateReferencesToFxElements(
            pomlElement.coordinateReferences
          ),
          ...this.childrenToFxElements(pomlElement.children, options),
          ...scriptElements,
        ],
        ':@': commonAttributes,
      }
    }

    return {
      element: [
        ...this.coordinateReferencesToFxElements(
          pomlElement.coordinateReferences
        ),
        ...this.childrenToFxElements(pomlElement.children, options),
        ...scriptElements,
      ],
      ':@': commonAttributes,
    }
  }

  private buildGeometry(geometry: PomlGeometry): FxGeometry | undefined {
    switch (geometry.type) {
      case 'line': {
        const attrs: FxLineGeometry[':@'] = {
          '@_start': buildGeoLocationOrRelativeString(geometry.positions[0]),
          '@_end': buildGeoLocationOrRelativeString(geometry.positions[1]),
        }
        this.setAttribute(attrs, '@_color', geometry.color)
        return {
          line: [],
          ':@': attrs,
        }
      }
      default: {
        return undefined
      }
    }
  }
}
