import { useGlobal } from '@/lib/global'
import throttle from 'lodash.throttle'
import { uuidToId } from 'notion-utils'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 目录导航组件
 * @param toc
 * @returns {JSX.Element}
 * @constructor
 */
const Catalog = ({ toc }) => {
  const { locale } = useGlobal()
  // 监听滚动事件
  useEffect(() => {
    window.addEventListener('scroll', actionSectionScrollSpy)
    actionSectionScrollSpy()
    return () => {
      window.removeEventListener('scroll', actionSectionScrollSpy)
    }
  }, [])

  // 目录自动滚动
  const tRef = useRef(null)
  const tocIds = []

  // 同步选中目录事件
  const [activeSection, setActiveSection] = useState(null)

  const actionSectionScrollSpy = useCallback(
    throttle(() => {
      const sections = document.getElementsByClassName('notion-h')
      let prevBBox = null
      let currentSectionId = activeSection
      for (let i = 0; i < sections.length; ++i) {
        const section = sections[i]
        if (!section || !(section instanceof Element)) continue
        if (!currentSectionId) {
          currentSectionId = section.getAttribute('data-id')
        }
        const bbox = section.getBoundingClientRect()
        const prevHeight = prevBBox ? bbox.top - prevBBox.bottom : 0
        const offset = Math.max(150, prevHeight / 4)
        // GetBoundingClientRect returns values relative to viewport
        if (bbox.top - offset < 0) {
          currentSectionId = section.getAttribute('data-id')
          prevBBox = bbox
          continue
        }
        // No need to continue loop, if last element has been detected
        break
      }
      setActiveSection(currentSectionId)
      const index = tocIds.indexOf(currentSectionId) || 0
      tRef?.current?.scrollTo({ top: 28 * index, behavior: 'smooth' })
    }, 200)
  )

  // 无目录就直接返回空
  if (!toc || toc.length < 1) {
    return <></>
  }

  return (
    <div className='px-3 py-1 dark:text-white text-black'>
      <div className='w-full'>
        <i className='mr-1 fas fa-stream' />
        {locale.COMMON.TABLE_OF_CONTENTS}
      </div>
      <div
        className='overflow-y-auto max-h-36 lg:max-h-96 overscroll-none scroll-hidden'
        ref={tRef}>
        <nav className='h-full'>
          {toc?.map(tocItem => {
            const id = uuidToId(tocItem.id)
            tocIds.push(id)
            return (
              <a
                key={id}
                href={`#${id}`}
                className={`notion-table-of-contents-item duration-300 transform dark:text-gray-200
            notion-table-of-contents-item-indent-level-${tocItem.indentLevel} catalog-item `}>
                <span
                  style={{
                    display: 'inline-block',
                    marginLeft: tocItem.indentLevel * 16
                  }}
                  className={`truncate ${activeSection === id ? 'font-bold text-indigo-600' : ''}`}>
                  {tocItem.text}
                </span>
              </a>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default Catalog
