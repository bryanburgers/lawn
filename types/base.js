'use strict'

const { internalsSymbol, validatorsSymbol, cloneSymbol } = require('../symbols')

class LawnBase {
  constructor (type, validators) {
    this[internalsSymbol] = { type }
    this[validatorsSymbol] = validators || []
  }

  [cloneSymbol] (changes, validator, converter) {
    const obj = Object.create(Object.getPrototypeOf(this))
    obj[internalsSymbol] = this[internalsSymbol]
    obj[validatorsSymbol] = this[validatorsSymbol]
    return obj
  }

  props (props) {
    const obj = this[cloneSymbol]()
    obj[internalsSymbol] = Object.assign({}, this[internalsSymbol], props)
    return obj
  }

  validation (validation) {
    const obj = this[cloneSymbol]()
    obj[validatorsSymbol] = [...this[validatorsSymbol], validation]
    return obj
  }

  validate (val, originalVal) {
    const validators = this[validatorsSymbol]
    for (const validator of validators) {
      const message = validator.message
      const fn = validator.fn
      if (!fn(val)) {
        throw new Error(message)
      }
    }
  }

  desc (description) {
    return this.props({ description })
  }

  example (example) {
    return this.props({ example })
  }

  default (def) {
    return this.props({ default: def })
  }

  get optional () {
    return this.props({ optional: true })
  }
}

module.exports = LawnBase
