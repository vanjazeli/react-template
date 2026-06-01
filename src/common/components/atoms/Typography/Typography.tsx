import type { ElementType, HTMLAttributes } from 'react'

import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@common/utils/cn.utils'

export type TypographyVariantT = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'small' | 'blockquote' | 'code'

const typographyVariants = cva('text-foreground', {
  variants: {
    variant: {
      h1: 'scroll-m-20 text-4xl font-extrabold text-balance',
      h2: 'scroll-m-20 text-3xl font-semibold',
      h3: 'scroll-m-20 text-2xl font-semibold',
      h4: 'scroll-m-20 text-xl font-semibold',
      p: 'text-base font-normal',
      span: 'text-base font-normal',
      small: 'text-sm leading-none font-medium',
      blockquote: 'border-l-2 pl-6 italic',
      code: 'rounded bg-accent px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
    },
    muted: {
      true: 'text-muted-foreground',
      false: '',
    },
    italic: {
      true: 'italic',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'span',
    muted: false,
    italic: false,
  },
})

type TypographyPropsT = HTMLAttributes<HTMLElement> &
  VariantProps<typeof typographyVariants> & {
    tag?: TypographyVariantT
  }

export const Typography = ({ variant = 'span', tag, className, muted, italic, children, ...props }: TypographyPropsT) => {
  const elementType = tag ?? variant

  const Component = elementType as ElementType

  return (
    <Component className={cn(typographyVariants({ variant, muted, italic }), className)} {...props}>
      {children}
    </Component>
  )
}
