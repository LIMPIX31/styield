import { CSSProperties } from 'react'
import * as kebabCase from 'kebab-case'
import { css as sccss, FlattenInterpolation, FlattenSimpleInterpolation } from 'styled-components'

const meta = ['then', 'if', 'ifNot', 'switch', 'selector', 'var', 'use'] as const
type MetaProperty = typeof meta[number]

type CSSS = { [P in keyof CSSProperties]-?: ((value: CSSProperties[P] | FlattenSimpleInterpolation | FlattenInterpolation<any>, important?: boolean) => StyleBuilder) & { var: (name: string) => StyleBuilder } }

interface Styield extends CSSS {
  _build(): FlattenSimpleInterpolation[]
  if(condition: any, Then: StyieldGenerator, Else?: StyieldGenerator): StyleBuilder
  ifNot(condition: any, Them: StyieldGenerator, Else?: StyieldGenerator): StyleBuilder
  switch<T extends string | number>(target: T | undefined, matcher: Switch<T>): StyleBuilder
  selector(selector: string, style: StyieldGenerator): StyleBuilder
  var(name: string, value: any): StyleBuilder
  var(name: string): string
  use(style: StyieldGenerator): StyleBuilder
}

export type Switch<T extends string | number> = {
  [P in T | 'default']?: StyieldGenerator | true
}

interface Builder {
  css: FlattenSimpleInterpolation[]
}

export type StyleBuilder = Styield & Builder

export type StyieldGenerator = StyleBuilder | ((builder: StyleBuilder) => StyleBuilder)

const resolve = (gen: StyieldGenerator) => typeof gen === 'function' ? gen(styield) : gen

const createBuilder = (css: FlattenSimpleInterpolation[] = []) => new Proxy<Builder>({ css }, {
  get(builder: Builder, p: keyof CSSProperties & MetaProperty): any {
    if (p === 'css') return builder.css
    const next = (...csss: FlattenSimpleInterpolation[]) => createBuilder(builder.css.concat(csss))
    switch (p) {
      case '_build':
        return () => builder.css
      case 'if':
        return (condition: any, Then: StyieldGenerator, Else: StyieldGenerator) =>
          !!condition ? next(...resolve(Then).css) : Else ? next(...resolve(Else).css) : createBuilder(builder.css)
      case 'ifNot':
        return (condition: any, Then: StyieldGenerator, Else: StyieldGenerator) =>
          !condition ? next(...resolve(Then).css) : Else ? next(...resolve(Else).css) : createBuilder(builder.css)
      case 'selector':
        return (selector: string | FlattenSimpleInterpolation, value: StyieldGenerator) =>
          next([sccss`${selector} {\n`, ...resolve(value).css, sccss`}`])
      case 'var':
        return (name: string, value?: string) => value ? next(sccss`--${name}: ${value};\n`) : `var(--${name})`
      case 'use':
        return (style: StyieldGenerator) => next(...resolve(style).css)
      case 'switch':
        return (target: any, matcher: any) => {
          let pass = false
          for (const kase in matcher) {
            if (target === kase && matcher[kase] === true) pass = true
            else if ((target === kase || pass) && matcher[kase] !== true) return next(...(resolve(matcher[kase]) as unknown as Builder).css)
            else pass = false
          }
          return matcher.default && matcher.default !== 'pass' ? next(...(resolve(matcher.default) as unknown as Builder).css) : createBuilder(builder.css)
        }
    }
    const factory = (value?: any, important?: boolean) => value ? next(sccss`${kebabCase.default(p)}: ${value}${important ? ' !important' : ''};\n`) : createBuilder(builder.css)
    Reflect.defineProperty(factory, 'var', { value: (name: string) => factory(`var(--${name})`) })
    return factory
  },
}) as unknown as StyleBuilder

const isBuilder = (value: any): value is StyleBuilder => 'css' in value

export function build(generator: StyieldGenerator): FlattenSimpleInterpolation {
  const gen = typeof generator === 'function' ? generator(styield) : generator
  return sccss({}, ...gen._build())
}

export const styield = createBuilder()
