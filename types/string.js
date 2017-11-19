'use strict'

const LawnBase = require('./base')

class LawnString extends LawnBase {
  constructor () {
    super('string')
  }

  _transform (str) {
    return str
  }

  regex (re, message) {
    if (message === undefined) {
      message = 'must match the regex ' + re.toString()
    }
    return this.validation({ message, fn: v => re.test(v) })
  }
}

module.exports = LawnString
