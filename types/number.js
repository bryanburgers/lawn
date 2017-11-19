'use strict'

const LawnBase = require('./base')

class LawnNumber extends LawnBase {
  constructor () {
    super('number')
  }

  validate (val) {
    if (Number.isNaN(val)) {
      throw new Error(`is not a number`)
    }

    super.validate(val)
  }

  _transform (str) {
    return parseInt(str, 10)
  }
}

module.exports = LawnNumber
