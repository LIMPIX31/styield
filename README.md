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
export const Button = styled.button<ButtonProps>(({
    theme, disabled, variant
  }) => build(function* () {
  yield styield
    .display('flex')
    .alignItems('center')
    .justifyContent('center')
    .gap('6px')
    .padding('10px 20px')
    .ifNot(disabled, styield.boxShadow('0 0 15px 0 rgba(0, 0, 0, .1)'))
    .switch(variant, {
      'primary': styield.backgroundColor('blue'),
      'destructive': styield.backgroundColor('blue'),
      'link-gray': 'pass',
      'link-color': styled.backgroundColor(variant.includes('color') ? 'gray' : 'pink')
    })
  if (disabled) yield styield.if(
    destructive,
    styield.color('#ff00007f'),
    styield.color('#00ff007f')
  )
}))
```
