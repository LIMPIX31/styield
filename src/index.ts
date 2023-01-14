import { css, FlattenInterpolation, SimpleInterpolation } from 'styled-components'

type GeneratorType<T = any> = Generator<string | SimpleInterpolation | FlattenInterpolation<T>>

function collect(generator: GeneratorType): TemplateStringsArray {
  const interpolations: any[] = []
  for (const v of generator) interpolations.push(v)
  return css({}, ...interpolations) as TemplateStringsArray
}

export function y<T>(gfn: () => GeneratorType) {
  return collect(gfn())
}
