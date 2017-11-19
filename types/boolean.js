'use strict'

const LawnBase = require('./base')

class LawnBoolean extends LawnBase {
  constructor () {
    super('bool')
  }
  _transform (str) {
    switch (str.toLowerCase()) {
      case 'true':
      case 'yes':
      case 'y':
      case '1':
        return true
      default:
        return false
    }
  }
}

module.exports = LawnBoolean
