export type FxPomlRoot = FxPoml[] | undefined

export interface FxPoml {
  poml: (FxScene | FxResource | FxMeta)[]
}

export interface FxMeta {
  meta: FxTitle[]
}

export interface FxTitle {
  title: [{ '#text': string }] | []
}

export interface FxScene {
  ':@'?: FxElementAttributesBase
  scene?: FxElement[]
}

export interface FxResource {}

export type FxElement =
  | FxEmptyElement
  | FxModelElement
  | FxTextElement
  | FxImageElement
  | FxVideoElement
  | FxSpaceReferenceElement
  | FxSpacePlacementElement
  | FxGeoReferenceElement
  | FxGeoPlacementElement
  | FxGeometryElement
  | FxCesium3dTilesElement
  | FxScriptElement
  | FxScreenSpaceElement
  | FxUnknownElement

export interface FxEmptyElement {
  ':@'?: FxElementAttributesBase
  element: FxElement[]
}

export interface FxElementAttributesBase {
  '@_rotation-mode'?: 'vertical-billboard' | 'billboard'
  '@_scale'?: string
  '@_position'?: string
  '@_rotation'?: string
  '@_scale-by-distance'?: string
  '@_min-scale'?: string
  '@_max-scale'?: string
  '@_display'?: string
  '@_ar-display'?: string
  '@_id'?: string
  '@_web-link'?: string
  '@_ws-recv-url'?: string
}

export interface FxModelElement {
  ':@'?: FxModelElementAttributes
  model: FxElement[]
}

export interface FxModelElementAttributes extends FxElementAttributesBase {
  '@_src'?: string
  '@_filename'?: string
}

export interface FxGeometryElementAttributes extends FxElementAttributesBase {}

export interface FxTextElement {
  ':@'?: FxTextElementAttributes
  text: FxElement[]
}

export interface FxTextElementAttributes extends FxElementAttributesBase {
  '@_text'?: string
  '@_font-size'?: string
  '@_font-color'?: string
  '@_background-color'?: string
}

export interface FxMediaElementAttributes extends FxElementAttributesBase {
  '@_src'?: string
  '@_filename'?: string
  '@_width'?: string
  '@_height'?: string
}

export interface FxImageElementAttributes extends FxMediaElementAttributes {}

export interface FxImageElement {
  ':@'?: FxImageElementAttributes
  image: FxElement[]
}

export interface FxVideoElementAttributes extends FxMediaElementAttributes {}

export interface FxVideoElement {
  ':@'?: FxVideoElementAttributes
  video: FxElement[]
}

export interface FxGeometryElement {
  ':@'?: FxGeometryElementAttributes
  geometry: (FxGeometry | FxElement)[]
}

// space-reference
export interface FxSpaceReferenceElement {
  ':@'?: FxSpaceReferenceElementAttributes
  'space-reference': FxElement[]
}

// space-placement is deprecated
export interface FxSpacePlacementElement {
  ':@'?: FxSpaceReferenceElementAttributes
  'space-placement': FxElement[]
}

export interface FxSpaceReferenceElementAttributes
  extends FxElementAttributesBase {
  '@_space-id'?: string
  '@_space-type'?: string
}

// geo-reference
export interface FxGeoReferenceElement {
  ':@'?: FxGeoReferenceElementAttributes
  'geo-reference': FxElement[]
}

// geo-placement is deprecated
export interface FxGeoPlacementElement {
  ':@'?: FxGeoReferenceElementAttributes
  'geo-placement': FxElement[]
}

export interface FxGeoReferenceElementAttributes
  extends FxElementAttributesBase {
  '@_latitude'?: string
  '@_longitude'?: string
  '@_ellipsoidal-height'?: string
  '@_enu-rotation'?: string
}

export interface FxScriptElement {
  ':@'?: FxScriptElementAttributes
  script: FxElement[]
}

export interface FxScriptElementAttributes extends FxElementAttributesBase {
  '@_src'?: string
  '@_filename'?: string
  '@_args'?: string
}

export type FxGeometry = FxLineGeometry | FxPolygonGeometry | FxUnknowGeometry

export function isFxGeometry(obj: FxGeometry | FxElement): obj is FxGeometry {
  return 'line' in obj || 'polygon' in obj
}

export interface FxUnknowGeometry {
  ':@': undefined
}

export interface FxLineGeometry {
  line: unknown
  ':@'?: {
    '@_vertices'?: string
    '@_color'?: string
  }
}

export interface FxPolygonGeometry {
  polygon: unknown
  ':@'?: {
    '@_vertices'?: string
    '@_indices'?: string
    '@_color'?: string
  }
}

export interface FxCesium3dTilesElementAttributes
  extends FxElementAttributesBase {
  '@_src'?: string
  '@_filename'?: string
}

export interface FxCesium3dTilesElement {
  ':@'?: FxCesium3dTilesElementAttributes
  cesium3dtiles: FxElement[]
}

export interface FxScreenSpaceElement {
  ':@'?: FxElementAttributesBase
  'screen-space': FxElement[]
}

export interface FxUnknownElement {
  ':@'?: FxElementAttributesBase
}
