import mixedValidate, { joiValidate } from './validate'
import ui from './ui'
import { toSwaggerDoc } from './utils'
import globals from './globals'

Object.assign(globals, {
  toSwaggerDoc,
  mixedValidate,
  joiValidate,
  ui,
})

export default globals
export {
  toSwaggerDoc,
  mixedValidate,
  joiValidate,
  ui
}
