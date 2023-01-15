import { css, FlattenSimpleInterpolation, SimpleInterpolation } from 'styled-components'

type GeneratorType = Generator<string | SimpleInterpolation | FlattenSimpleInterpolation>

export type Interpolation = GeneratorType

export type StyieldUnit = (() => Interpolation) | Interpolation

function collect(generator: GeneratorType): TemplateStringsArray {
  const interpolations: any[] = []
  for (const v of generator) interpolations.push(v)
  return css({}, ...interpolations) as TemplateStringsArray
}

export function y<T>(gfn: StyieldUnit) {
  return collect(typeof gfn === 'function' ? gfn() : gfn)
}
