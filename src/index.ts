import { CSSProperties } from 'react'
import kebabCase from 'kebab-case'
import { css, css as sccss, FlattenInterpolation, FlattenSimpleInterpolation } from 'styled-components'

const meta = ['then', 'if', 'ifNot', 'switch', 'selector'] as const
type MetaProperty = typeof meta[number]

type CSSS = { [P in keyof CSSProperties]-?: (value: CSSProperties[P] | FlattenSimpleInterpolation | FlattenInterpolation<any>) => StyleBuilder }

interface Styield extends CSSS {
  _build(): FlattenSimpleInterpolation[]
  if(condition: any, style: StyleBuilder): StyleBuilder
  ifNot(condition: any, style: StyleBuilder): StyleBuilder
  switch(target: any, matcher: Switch): StyleBuilder
  selector(selector: string, style: StyleBuilder): StyleBuilder
}

interface Switch {
  [k: string | number | 'default']: StyleBuilder | 'pass'
}

interface Builder {
  css: FlattenSimpleInterpolation[]
}

export type StyleBuilder = Styield & Omit<Builder, 'css'>

export type StyieldGenerator = Generator<StyleBuilder> | (() => Generator<StyleBuilder | StyieldGenerator>)

const createBuilder = (css: FlattenSimpleInterpolation[] = []) => new Proxy<Builder>({ css }, {
  get(builder: Builder, p: keyof CSSProperties & MetaProperty): any {
    if (p === 'css') return builder.css
    const next = (...csss: FlattenSimpleInterpolation[]) => createBuilder(builder.css.concat(csss))
    switch (p) {
      case '_build': return () => builder.css
      case 'if': return (condition: any, Then: Builder, Else: Builder) => !!condition ? next(...Then.css) : Else ? next(...Else.css) : createBuilder(builder.css)
      case 'ifNot': return (condition: any, Then: Builder, Else: Builder) => !condition ? next(...Then.css) : Else ? next(...Else.css) : createBuilder(builder.css)
      case 'selector': return (selector: string | FlattenSimpleInterpolation, value: Builder) =>
        next([sccss`${selector} {\n`, ...value.css, sccss`}`])
      case 'switch': return (target: any, matcher: Switch) => {
        let pass = false
        for (const kase in matcher) {
          if (matcher[kase] === 'pass') pass = true
          else if (target === kase || pass) return next(...(matcher[kase] as unknown as Builder).css)
          else pass = false
        }
        return matcher.default && matcher.default !== 'pass' ? next(...(matcher.default as unknown as Builder).css) : createBuilder(builder.css)
      }
    }
    return (value?: any) => value ? next(sccss`${kebabCase(p)}: ${value};\n`) : createBuilder(builder.css)
  }
}) as unknown as StyleBuilder

const isBuilder = (value: any): value is StyleBuilder => 'css' in value

export function build(generator: StyieldGenerator | StyleBuilder) : FlattenSimpleInterpolation {
  if (isBuilder(generator)) return css({}, ...generator._build())
  const gen = typeof generator === 'function' ? generator() : generator
  const interpolations: FlattenSimpleInterpolation[] = []
  for(const i of gen) interpolations.push(typeof i === 'function' ? build(i) : isBuilder(i) ? i._build() : build(i))
  return css({}, ...interpolations)
}

export const styield = createBuilder()
