import type { ComponentProps, ElementType } from 'react'

import { cn } from '@common/utils/cn.utils'

type TagT = 'div' | 'ul' | 'ol' | 'li' | 'nav' | 'section' | 'main' | 'aside' | 'span'

type LayoutT = 'col' | 'row' | 'grid-2' | 'grid-3' | 'grid-4'

type GapT = 'none' | 'sm' | 'md' | 'lg' | 'xl'

type StackPropsT = ComponentProps<'div'> & {
  layout?: LayoutT | [LayoutT, LayoutT?, LayoutT?]
  gap?: GapT | [GapT, GapT?, GapT?]
  tag?: TagT
}

const layoutBase: Record<LayoutT, string> = {
  col: 'flex flex-col',
  row: 'flex flex-row',
  'grid-2': 'grid grid-cols-2',
  'grid-3': 'grid grid-cols-3',
  'grid-4': 'grid grid-cols-4',
}

const layoutMd: Record<LayoutT, string> = {
  col: 'md:flex md:flex-col',
  row: 'md:flex md:flex-row',
  'grid-2': 'md:grid md:grid-cols-2',
  'grid-3': 'md:grid md:grid-cols-3',
  'grid-4': 'md:grid md:grid-cols-4',
}

const layoutLg: Record<LayoutT, string> = {
  col: 'lg:flex lg:flex-col',
  row: 'lg:flex lg:flex-row',
  'grid-2': 'lg:grid lg:grid-cols-2',
  'grid-3': 'lg:grid lg:grid-cols-3',
  'grid-4': 'lg:grid lg:grid-cols-4',
}

const gapBase: Record<GapT, string> = {
  none: 'gap-0',
  sm: 'gap-1',
  md: 'gap-2',
  lg: 'gap-4',
  xl: 'gap-8',
}

const gapMd: Record<GapT, string> = {
  none: 'md:gap-0',
  sm: 'md:gap-1',
  md: 'md:gap-2',
  lg: 'md:gap-4',
  xl: 'md:gap-8',
}

const gapLg: Record<GapT, string> = {
  none: 'lg:gap-0',
  sm: 'lg:gap-1',
  md: 'lg:gap-2',
  lg: 'lg:gap-4',
  xl: 'lg:gap-8',
}

const resolveLayout = (layout: LayoutT | [LayoutT, LayoutT?, LayoutT?]) => {
  if (!Array.isArray(layout)) return layoutBase[layout]
  const [b, m, l] = layout
  return cn(layoutBase[b], m && layoutMd[m], l && layoutLg[l])
}

const resolveGap = (gap: GapT | [GapT, GapT?, GapT?]) => {
  if (!Array.isArray(gap)) return gapBase[gap]
  const [b, m, l] = gap
  return cn(gapBase[b], m && gapMd[m], l && gapLg[l])
}

export const Stack = ({ layout = 'col', gap = 'md', tag = 'div', className, children, ...props }: StackPropsT) => {
  const Component = tag as ElementType

  return (
    <Component className={cn(resolveLayout(layout), resolveGap(gap), className)} {...props}>
      {children}
    </Component>
  )
}
