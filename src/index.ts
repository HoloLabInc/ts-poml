import { FxUnknownElement } from './fastXmlParserPomlType'

export { parseGeometryPositionsString } from './geometryAttributeParser'

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
  originalAttrs?: Map<string, string>

  constructor(
    init: Partial<PomlElementBase>,
    originalAttrs: Map<string, string> | undefined
  ) {
    Object.assign(this, init)
    this.children ??= []
    this.coordinateReferences ??= []
    this.scriptElements ??= []
    this.customAttributes ??= new Map<string, string>()
    this.originalAttrs = originalAttrs
  }
}

export class Scene extends PomlElementBase {
  constructor(
    init?: Partial<Scene>,
    originalAttrs: Map<string, string> | undefined = undefined
  ) {
    super(init ?? {}, originalAttrs)
  }
}

type PomlElementUnion =
  | PomlEmptyElement
  | PomlTextElement
  | PomlModelElement
  | PomlImageElement
  | PomlVideoElement
  | PomlGeometryElement
  | PomlCesium3dTilesElement
  | PomlScreenSpaceElement

/**
 * PomlElement is a union type of all element types.
 *
 * - `PomlElement<'text'>` is `PomlTextElement`
 * - `PomlElement` is `PomlEmptyElement | PomlTextElement | ... `, which is the same as union of all types.
 *
 * @typeParam T - element type
 *
 */
export type PomlElement<
  T extends PomlElementUnion['type'] = PomlElementUnion['type']
> = T extends PomlEmptyElement['type']
  ? PomlEmptyElement
  : T extends PomlTextElement['type']
  ? PomlTextElement
  : T extends PomlModelElement['type']
  ? PomlModelElement
  : T extends PomlImageElement['type']
  ? PomlImageElement
  : T extends PomlVideoElement['type']
  ? PomlVideoElement
  : T extends PomlGeometryElement['type']
  ? PomlGeometryElement
  : T extends PomlCesium3dTilesElement['type']
  ? PomlCesium3dTilesElement
  : T extends PomlScreenSpaceElement['type']
  ? PomlScreenSpaceElement
  : never

type IsNever<T> = [T] extends [never] ? true : false
type AssertTrue<T extends true> = never

{
  // static type assertion.
  // PomlElement is same as PomlElementUnion
  let _: AssertTrue<IsNever<Exclude<PomlElement, PomlElementUnion>>>
  let __: AssertTrue<IsNever<Exclude<PomlElementUnion, PomlElement>>>
}

/**
 * `PomlElement` or `PomlUnknown`
 *
 * - `MaybePomlElement<'text'>` is `PomlTextElement`
 * - `MaybePomlElement<'?'>` is `PomlUnknown`
 * - `MaybePomlElement` is `PomlElement | PomlUnknown`
 */
export type MaybePomlElement<
  T extends PomlElement['type'] | PomlUnknown['type'] =
    | PomlElement['type']
    | PomlUnknown['type']
> = T extends PomlUnknown['type']
  ? PomlUnknown
  : PomlElement<Exclude<T, PomlUnknown['type']>>

export class PomlEmptyElement extends PomlElementBase {
  type: 'element' = 'element'

  constructor(
    init?: Partial<PomlEmptyElement>,
    originalAttrs: Map<string, string> | undefined = undefined
  ) {
    super(init ?? {}, originalAttrs)
  }
}

export class PomlTextElement extends PomlElementBase {
  type: 'text' = 'text'

  text?: string
  fontSize?: string
  fontColor?: string
  backgroundColor?: string

  constructor(
    init?: Partial<PomlTextElement>,
    originalAttrs: Map<string, string> | undefined = undefined
  ) {
    super(init ?? {}, originalAttrs)
  }
}

export class PomlModelElement extends PomlElementBase {
  type: 'model' = 'model'
  src?: string
  filename?: string

  constructor(
    init?: Partial<PomlModelElement>,
    originalAttrs: Map<string, string> | undefined = undefined
  ) {
    super(init ?? {}, originalAttrs)
  }
}

export class PomlImageElement extends PomlElementBase {
  type: 'image' = 'image'
  src?: string
  filename?: string

  constructor(
    init?: Partial<PomlImageElement>,
    originalAttrs: Map<string, string> | undefined = undefined
  ) {
    super(init ?? {}, originalAttrs)
  }
}

export class PomlVideoElement extends PomlElementBase {
  type: 'video' = 'video'
  src?: string
  filename?: string

  constructor(
    init?: Partial<PomlVideoElement>,
    originalAttrs: Map<string, string> | undefined = undefined
  ) {
    super(init ?? {}, originalAttrs)
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
  originalAttrs?: Map<string, string>
}

export interface GeoReference {
  type: 'geo-reference'
  id?: string
  latitude?: number
  longitude?: number
  ellipsoidalHeight?: number
  enuRotation?: Rotation
  originalAttrs?: Map<string, string>
}

export interface ScriptElement {
  type: 'script'
  id?: string
  src?: string
  filename?: string
  args: string[]
  originalAttrs?: Map<string, string>
}

export class PomlGeometryElement extends PomlElementBase {
  type: 'geometry' = 'geometry'
  geometries: PomlGeometry[]

  constructor(
    init?: Partial<PomlGeometryElement>,
    originalAttrs: Map<string, string> | undefined = undefined
  ) {
    super(init ?? {}, originalAttrs)
    this.geometries ??= []
  }
}

export abstract class GeometryBase {
  constructor(init: Partial<GeometryBase>) {
    Object.assign(this, init)
  }
}

export type PomlGeometry = LineGeometry | PolygonGeometry

export type GeometryPositions = string | RelativePositions | GeodeticPositions

export type RelativePositions = {
  type: 'relative'
  positions: Position[]
}

export type GeodeticPositions = {
  type: 'geodetic'
  positions: {
    longitude: number
    latitude: number
    ellipsoidalHeight: number
  }[]
}

export type GeometryIndices = string | number[]

export class LineGeometry extends GeometryBase {
  type: 'line' = 'line'
  vertices?: GeometryPositions
  color?: string

  constructor(init: Partial<LineGeometry>) {
    super(init)
  }
}

export class PolygonGeometry extends GeometryBase {
  type: 'polygon' = 'polygon'
  vertices?: GeometryPositions
  indices?: GeometryIndices
  color?: string

  constructor(init: Partial<PolygonGeometry>) {
    super(init)
  }
}

export class PomlCesium3dTilesElement extends PomlElementBase {
  type: 'cesium3dtiles' = 'cesium3dtiles'
  src?: string
  filename?: string

  constructor(
    init?: Partial<PomlCesium3dTilesElement>,
    originalAttrs: Map<string, string> | undefined = undefined
  ) {
    super(init ?? {}, originalAttrs)
  }
}

export class PomlScreenSpaceElement extends PomlElementBase {
  type: 'screen-space' = 'screen-space'

  constructor(
    init?: Partial<PomlScreenSpaceElement>,
    originalAttrs: Map<string, string> | undefined = undefined
  ) {
    super(init ?? {}, originalAttrs)
  }
}

export class PomlUnknown {
  type: '?' = '?'
  original: FxUnknownElement

  constructor(original: FxUnknownElement) {
    this.original = original
  }
}
