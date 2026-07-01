import arcImage from '@image/arc.svg'
import greenRibbonImage from '@image/green_ribbon.svg'
import manImage from '@image/man.svg'
import starIcon from '@image/star.svg'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useParams } from 'react-router-dom'

import { loadCourses } from '@entities/course/api/course.service'
import type { Course } from '@entities/course/model/course.types'
import type { AuthSession } from '@features/auth/model/auth-session.types'
import { Container } from '@shared/ui/Container'
import { EmptyState } from '@shared/ui/EmptyState/EmptyState'
import { ErrorState } from '@shared/ui/ErrorState/ErrorState'
import { Loader } from '@shared/ui/Loader/Loader'
import { AppHeader } from '@widgets/AppHeader'

import {
  COURSE_BANNER_COLORS,
  COURSE_BANNER_IMAGE_GEOMETRY,
  COURSE_BANNER_MASK_GEOMETRY,
  distributeIntoColumns,
  isStepAerobicsVariant,
} from './CoursePage.helpers'
import styles from './CoursePage.module.scss'

export type CoursePageProps = {
  authSession: AuthSession | null
  isProfileDropdownOpen: boolean
  onLoginClick: () => void
  onLogout: () => void
  onProfileClick: () => void
  onProfileDropdownClose: () => void
  onProfileNavigate: () => void
}

type CoursePageStatus = 'error' | 'loading' | 'notFound' | 'success'

type CourseBannerStyle = CSSProperties & {
  '--course-banner-color': string
}

type CourseBannerImageStyle = CSSProperties & {
  '--course-banner-image-width': string
  '--course-banner-image-height': string
  '--course-banner-image-top': string
  '--course-banner-image-transform': string
  '--course-banner-image-transform-origin': string
  '--course-banner-image-left'?: string
  '--course-banner-image-right'?: string
}

type CourseBannerImageMaskStyle = CSSProperties & {
  '--course-banner-mask-width'?: string
  '--course-banner-mask-height'?: string
  '--course-banner-mask-top'?: string
  '--course-banner-mask-right'?: string
  '--course-banner-mask-bottom'?: string
  '--course-banner-mask-left'?: string
}

const ctaListItems = [
  'проработка всех групп мышц',
  'тренировка суставов',
  'улучшение циркуляции крови',
  'упражнения заряжают бодростью',
  'помогают противостоять стрессам',
]

export function CoursePage({
  authSession,
  isProfileDropdownOpen,
  onLoginClick,
  onLogout,
  onProfileClick,
  onProfileDropdownClose,
  onProfileNavigate,
}: CoursePageProps) {
  const { courseId } = useParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [status, setStatus] = useState<CoursePageStatus>('loading')
  const resolvedStatus: CoursePageStatus = courseId ? status : 'notFound'
  const directionColumns = useMemo(
    () => distributeIntoColumns(course?.directions ?? [], 3),
    [course],
  )
  const imageVariant = course?.imageVariant ?? 'yoga'
  const isStepAerobics = isStepAerobicsVariant(imageVariant)
  const bannerColor = COURSE_BANNER_COLORS[imageVariant]
  const bannerStyle: CourseBannerStyle = {
    '--course-banner-color': bannerColor,
  }
  const bannerImageGeometry = isStepAerobics
    ? COURSE_BANNER_IMAGE_GEOMETRY.yoga
    : COURSE_BANNER_IMAGE_GEOMETRY[imageVariant]
  const bannerImageStyle: CourseBannerImageStyle | undefined = isStepAerobics
    ? undefined
    : {
        '--course-banner-image-width': bannerImageGeometry.width,
        '--course-banner-image-height': bannerImageGeometry.height,
        '--course-banner-image-top': bannerImageGeometry.top,
        '--course-banner-image-transform': bannerImageGeometry.transform ?? 'none',
        '--course-banner-image-transform-origin': bannerImageGeometry.transformOrigin ?? 'center',
        ...(bannerImageGeometry.left
          ? { '--course-banner-image-left': bannerImageGeometry.left }
          : {}),
        ...(bannerImageGeometry.right
          ? { '--course-banner-image-right': bannerImageGeometry.right }
          : {}),
      }
  const bannerImageClassName = [
    styles['course-page__banner-image'],
    isStepAerobics ? styles['course-page__banner-image--step-aerobics'] : '',
  ]
    .filter(Boolean)
    .join(' ')
  const bannerImageMaskGeometry = COURSE_BANNER_MASK_GEOMETRY[imageVariant]
  const bannerImageMaskStyle: CourseBannerImageMaskStyle = {
    ...(bannerImageMaskGeometry.width
      ? { '--course-banner-mask-width': bannerImageMaskGeometry.width }
      : {}),
    ...(bannerImageMaskGeometry.height
      ? { '--course-banner-mask-height': bannerImageMaskGeometry.height }
      : {}),
    ...(bannerImageMaskGeometry.top
      ? { '--course-banner-mask-top': bannerImageMaskGeometry.top }
      : {}),
    ...(bannerImageMaskGeometry.right
      ? { '--course-banner-mask-right': bannerImageMaskGeometry.right }
      : {}),
    ...(bannerImageMaskGeometry.bottom
      ? { '--course-banner-mask-bottom': bannerImageMaskGeometry.bottom }
      : {}),
    ...(bannerImageMaskGeometry.left
      ? { '--course-banner-mask-left': bannerImageMaskGeometry.left }
      : {}),
  }
  const handleCtaButtonClick = (): void => {
    if (!authSession) {
      onLoginClick()
    }
  }

  useEffect(() => {
    if (!courseId) {
      return
    }

    const abortController = new AbortController()

    loadCourses(abortController.signal)
      .then((courses) => {
        const matchedCourse = courses.find((loadedCourse) => loadedCourse.id === courseId)

        if (!matchedCourse) {
          setCourse(null)
          setStatus('notFound')
          return
        }

        setCourse(matchedCourse)
        setStatus('success')
      })
      .catch(() => {
        if (!abortController.signal.aborted) {
          setStatus('error')
        }
      })

    return () => {
      abortController.abort()
    }
  }, [courseId])

  return (
    <main className={styles['course-page']}>
      <AppHeader
        authSession={authSession}
        isProfileDropdownOpen={isProfileDropdownOpen}
        onLoginClick={onLoginClick}
        onLogout={onLogout}
        onProfileClick={onProfileClick}
        onProfileDropdownClose={onProfileDropdownClose}
        onProfileNavigate={onProfileNavigate}
      />

      <Container className={styles['course-page__container']}>
        {resolvedStatus === 'loading' ? (
          <div className={styles['course-page__state']}>
            <Loader />
          </div>
        ) : null}

        {resolvedStatus === 'error' ? (
          <div className={styles['course-page__state']}>
            <ErrorState
              title="Не удалось загрузить курс"
              description="Проверьте подключение и попробуйте открыть страницу позже."
            />
          </div>
        ) : null}

        {resolvedStatus === 'notFound' ? (
          <div className={styles['course-page__state']}>
            <EmptyState
              title="Курс не найден"
              description="Проверьте ссылку или выберите курс на главной странице."
            />
          </div>
        ) : null}

        {resolvedStatus === 'success' && course ? (
          <>
            <section
              className={styles['course-page__banner']}
              style={bannerStyle}
              aria-labelledby="course-page-title"
            >
              <div className={styles['course-page__banner-title-block']}>
                <h1 className={styles['course-page__banner-title']} id="course-page-title">
                  {course.title}
                </h1>
              </div>
              <div
                className={styles['course-page__banner-image-mask']}
                style={bannerImageMaskStyle}
              >
                <img
                  className={bannerImageClassName}
                  src={course.imageSrc}
                  alt=""
                  style={bannerImageStyle}
                />
                {isStepAerobics ? (
                  <span
                    className={styles['course-page__banner-image-occluder']}
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            </section>

            <section
              className={styles['course-page__suitable']}
              aria-labelledby="course-fitting-title"
            >
              <h2 className={styles['course-page__section-title']} id="course-fitting-title">
                Подойдет для вас, если:
              </h2>
              <div className={styles['course-page__suitable-cards']}>
                {course.fitting.slice(0, 3).map((fittingText, index) => (
                  <article className={styles['course-page__suitable-card']} key={fittingText}>
                    <div className={styles['course-page__suitable-card-inner']}>
                      <span className={styles['course-page__suitable-number']}>{index + 1}</span>
                      <p className={styles['course-page__suitable-text']}>{fittingText}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section
              className={styles['course-page__directions']}
              aria-labelledby="course-directions-title"
            >
              <h2 className={styles['course-page__section-title']} id="course-directions-title">
                Направления
              </h2>
              <article className={styles['course-page__directions-card']}>
                <div className={styles['course-page__directions-grid']}>
                  {directionColumns.map((column, columnIndex) => (
                    <ul className={styles['course-page__directions-column']} key={columnIndex}>
                      {column.map((direction) => (
                        <li className={styles['course-page__direction-item']} key={direction}>
                          <span
                            className={styles['course-page__direction-icon']}
                            aria-hidden="true"
                          >
                            <img
                              className={styles['course-page__direction-star']}
                              src={starIcon}
                              alt=""
                            />
                          </span>
                          <span className={styles['course-page__direction-text']}>{direction}</span>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </article>
            </section>

            <section className={styles['course-page__cta']} aria-labelledby="course-cta-title">
              <div className={styles['course-page__cta-inner']}>
                <div className={styles['course-page__cta-content']}>
                  <h2 className={styles['course-page__cta-title']} id="course-cta-title">
                    Начните путь
                    <br />к новому телу
                  </h2>
                  <ul className={styles['course-page__cta-list']}>
                    {ctaListItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <button
                    className={styles['course-page__cta-button']}
                    type="button"
                    onClick={handleCtaButtonClick}
                  >
                    <span className={styles['course-page__cta-button-text']}>
                      Войдите, чтобы добавить курс
                    </span>
                  </button>
                </div>
                <div className={styles['course-page__cta-visual']} aria-hidden="true">
                  <div className={styles['course-page__cta-ribbon-clip']}>
                    <img
                      className={styles['course-page__cta-ribbon']}
                      src={greenRibbonImage}
                      alt=""
                    />
                  </div>
                  <img
                    className={styles['course-page__cta-arc']}
                    src={arcImage}
                    alt=""
                    aria-hidden="true"
                  />
                  <div className={styles['course-page__cta-man-block']} aria-hidden="true">
                    <div className={styles['course-page__cta-man-frame']}>
                      <img className={styles['course-page__cta-man']} src={manImage} alt="" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </Container>
    </main>
  )
}
