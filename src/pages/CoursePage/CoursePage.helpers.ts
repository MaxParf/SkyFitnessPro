import type { CourseImageVariant } from '@entities/course/model/course.types'

export type InlineBannerImageVariant = Exclude<CourseImageVariant, 'stepAerobics'>

export const COURSE_BANNER_COLORS: Record<CourseImageVariant, string> = {
  yoga: '#FFC700',
  stretching: '#2491D2',
  fitness: '#F7A012',
  stepAerobics: '#FF7E65',
  bodyflex: '#7D458C',
}

export type CourseBannerImageGeometry = {
  width: string
  height: string
  top: string
  left?: string
  right?: string
  transform?: string
  transformOrigin?: string
}

export type CourseBannerImageMaskGeometry = {
  width?: string
  height?: string
  top?: string
  right?: string
  bottom?: string
  left?: string
}

export const COURSE_BANNER_IMAGE_GEOMETRY: Record<
  InlineBannerImageVariant,
  CourseBannerImageGeometry
> = {
  yoga: {
    width: '1023px',
    height: '683px',
    top: '-231px',
    left: '368px',
  },
  stretching: {
    width: '360px',
    height: '540px',
    top: '0px',
    right: '0px',
  },
  fitness: {
    width: '1150px',
    height: '767px',
    top: '-32px',
    left: '330px',
  },
  bodyflex: {
    width: '779px',
    height: '520px',
    top: '-168px',
    left: '492px',
  },
}

const fullBannerImageMaskGeometry: CourseBannerImageMaskGeometry = {
  top: '0px',
  right: '0px',
  bottom: '0px',
  left: '0px',
}

export const COURSE_BANNER_MASK_GEOMETRY: Record<
  CourseImageVariant,
  CourseBannerImageMaskGeometry
> = {
  yoga: fullBannerImageMaskGeometry,
  stretching: fullBannerImageMaskGeometry,
  fitness: fullBannerImageMaskGeometry,
  stepAerobics: {
    width: '695px',
    height: '310px',
    top: '0px',
    right: '0px',
  },
  bodyflex: fullBannerImageMaskGeometry,
}

export function isStepAerobicsVariant(
  imageVariant: CourseImageVariant,
): imageVariant is 'stepAerobics' {
  return imageVariant === 'stepAerobics'
}

export function distributeIntoColumns<T>(items: T[], maxColumns = 3): T[][] {
  const columnsCount = Math.max(0, Math.min(maxColumns, items.length))

  if (columnsCount === 0) {
    return []
  }

  const baseColumnSize = Math.floor(items.length / columnsCount)
  const extraItemsCount = items.length % columnsCount
  let startIndex = 0

  return Array.from({ length: columnsCount }, (_, columnIndex) => {
    const columnSize = baseColumnSize + (columnIndex < extraItemsCount ? 1 : 0)
    const column = items.slice(startIndex, startIndex + columnSize)
    startIndex += columnSize

    return column
  })
}
