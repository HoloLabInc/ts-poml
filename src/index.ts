import { FxUnknownElement } from './fastXmlParserPomlType'

export class Poml {
  scene: Scene
  meta?: Meta

  constructor(init?: Partial<Poml>) {
    this.scene = init?.scene ?? new Scene()
  }

  static create(init?: Partial<Poml>): Poml {
    return new Poml(init)
  }

  static scene(init?: Partial<Scene>): Scene {
    return new Scene(init)
  }

  static emptyElement(init?: Partial<PomlEmptyElement>): PomlEmptyElement {
    return new PomlEmptyElement(init)
  }
}

export class Meta {
  title?: string
  constructor(init?: Partial<Meta>) {
    this.title = init?.title
  }
}

export type RotationMode = 'vertical-billboard' | 'billboard'
export type Display = 'visible' | 'none' | 'occlusion'
export type ArDisplay = 'visible' | 'none' | 'occlusion' | 'same-as-display'
export type Position = { x: number; y: number; z: number }
export type Scale = number | { x: number; y: number; z: number }
export type Rotation = { x: number; y: number; z: number; w: number }
export type ScaleByDistance = boolean | number

export abstract class PomlElementBase {
  children: MaybePomlElement[] = []
  coordinateReferences: CoordinateReference[] = []
  scriptElements: ScriptElement[] = []

  position?: Position
  scale?: Scale
  rotation?: Rotation

  scaleByDistance?: ScaleByDistance
  minScale?: Scale
  maxScale?: Scale

  rotationMode?: RotationMode
  display?: Display
  arDisplay?: ArDisplay
  id?: string
  webLink?: string
  wsRecvUrl?: string

  customAttributes: Map<string, string>

  constructor(init: Partial<PomlElementBase>) {
    Object.assign(this, init)
    this.children ??= []
    this.coordinateReferences ??= []
    this.scriptElements ??= []
    this.customAttributes ??= new Map<string, string>()
  }
}

export class Scene extends PomlElementBase {
  constructor(init?: Partial<Scene>) {
    super(init ?? {})
  }
}

export type PomlElement =
  | PomlEmptyElement
  | PomlTextElement
  | PomlModelElement
  | PomlImageElement
  | PomlVideoElement
  | PomlGeometryElement
  | PomlCesium3dTilesElement
  | PomlScreenSpaceElement

// MaybePomlElement is PomlElement or PomlUnknown
// MaybePomlElement<'element'> is PomlElement
// MaybePomlElement<'?'> is PomlUnknown
export type MaybePomlElement<
  T extends PomlElement['type'] | PomlUnknown['type'] =
    | PomlElement['type']
    | PomlUnknown['type']
> = T extends '?' ? PomlUnknown : PomlElement

export class PomlEmptyElement extends PomlElementBase {
  type: 'element' = 'element'

  constructor(init?: Partial<PomlEmptyElement>) {
    super(init ?? {})
  }
}

export class PomlTextElement extends PomlElementBase {
  type: 'text' = 'text'

  text?: string
  fontSize?: string
  fontColor?: string
  backgroundColor?: string

  constructor(init?: Partial<PomlTextElement>) {
    super(init ?? {})
  }
}

export class PomlModelElement extends PomlElementBase {
  type: 'model' = 'model'
  src?: string
  filename?: string

  constructor(init?: Partial<PomlModelElement>) {
    super(init ?? {})
  }
}

export class PomlImageElement extends PomlElementBase {
  type: 'image' = 'image'
  src?: string
  filename?: string

  constructor(init?: Partial<PomlImageElement>) {
    super(init ?? {})
  }
}

export class PomlVideoElement extends PomlElementBase {
  type: 'video' = 'video'
  src?: string
  filename?: string

  constructor(init?: Partial<PomlVideoElement>) {
    super(init ?? {})
  }
}

export type CoordinateReference = SpaceReference | GeoReference

export interface SpaceReference {
  type: 'space-reference'
  id?: string
  spaceType?: string
  spaceId?: string
  position?: Position
  rotation?: Rotation
}

export interface GeoReference {
  type: 'geo-reference'
  id?: string
  latitude?: number
  longitude?: number
  ellipsoidalHeight?: number
  enuRotation?: Rotation
}

export interface ScriptElement {
  type: 'script'
  id?: string
  src?: string
  filename?: string
  args: string[]
}

export class PomlGeometryElement extends PomlElementBase {
  type: 'geometry' = 'geometry'
  geometries: PomlGeometry[]

  constructor(init?: Partial<PomlGeometryElement>) {
    super(init ?? {})
    this.geometries ??= []
  }
}

export abstract class GeometryBase {
  constructor(init: Partial<GeometryBase>) {
    Object.assign(this, init)
  }
}

export type PomlGeometry = LineGeometry

export type GeoLocation = {
  type: 'geo-location'
  latitude: number
  longitude: number
  ellipsoidalHeight: number
}
export type RelativePosition = Position & { type: 'relative' }

export class LineGeometry extends GeometryBase {
  type: 'line' = 'line'
  positions:
    | readonly [RelativePosition, RelativePosition]
    | readonly [GeoLocation, GeoLocation]
  color?: string
  public get positionType(): LineGeometry['positions'][0]['type'] {
    return this.positions[0].type
  }

  constructor(
    init: Partial<LineGeometry> & { positions: LineGeometry['positions'] }
  ) {
    super(init)
    this.positions ??= [
      { type: 'relative', x: 0, y: 0, z: 0 },
      { type: 'relative', x: 0, y: 0, z: 0 },
    ]
  }
}

export class PomlCesium3dTilesElement extends PomlElementBase {
  type: 'cesium3dtiles' = 'cesium3dtiles'
  src?: string
  filename?: string

  constructor(init?: Partial<PomlCesium3dTilesElement>) {
    super(init ?? {})
  }
}

export class PomlScreenSpaceElement extends PomlElementBase {
  type: 'screen-space' = 'screen-space'

  constructor(init?: Partial<PomlScreenSpaceElement>) {
    super(init ?? {})
  }
}

export class PomlUnknown {
  type: '?' = '?'
  _original: FxUnknownElement

  constructor(original: FxUnknownElement) {
    this._original = original
  }
}

// export class PomlCommentElement {
//   type: '#comment' = '#comment'
//   text: string

//   constructor(text: string) {
//     this.text = text ?? ''
//   }
// }
