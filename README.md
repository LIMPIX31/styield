# Styield - no ternaries


### styled-components
```ts
export const Button = styled.button`
  background-color: ${({ disabled, primary, danger }) => 
    disabled ? 'gray' : primary ? 'blue' : 'red'
  }
  color: ${({ disabled, primary, danger  }) => disabled ? 'lightgray' : 'white'}
`
```
### Possible simplifications
```ts
export const Button = styled.button(({ disabled, primary, danger }) => {
  let styles = ''
  if (disabled) {
    styles += 'background-color: gray;'
    styles += 'color: lightgray;'
  }
  else {
    if (primary) styles += 'background-color: blue;'
    else if (danger) styles += 'background-color: red;'
    styles += 'color: white;'
  }
  return styles
})
```

## Styield
```ts
import { css } from 'styled-components'
import { y } from 'styield'

export const Button = styled.button(({ disabled, primary, danger }) => y(function* () {
  if (disabled) {
    yield css`background-color: gray;`
    yield css`color: lightgray;`
  }
  else {
    if (primary) yield css`background-color: blue;`
    else if (danger) yield css`background-color: red;`
    yield css`color: white;`
  }
}))
```
