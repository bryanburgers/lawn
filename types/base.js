'use strict'

const { internalsSymbol, validatorsSymbol } = require('../symbols')

class LawnBase {
  constructor (type, validators) {
    this[internalsSymbol] = { type }
    this[validatorsSymbol] = validators || []
  }

  props (props) {
    this[internalsSymbol] = Object.assign({}, this[internalsSymbol], props)
    return this
  }

  validation (validation) {
    this[validatorsSymbol].push(validation)
    return this
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

  description (description) {
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
