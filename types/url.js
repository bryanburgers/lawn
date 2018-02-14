'use strict'

const LawnBase = require('./base')
const { URL } = require('url')

class LawnURL extends LawnBase {
  constructor () {
    super('url')

    this._protocol = null
    this._defaultQueries = new Map()
    this._overrideQueries = new Map()
  }

  validate (val) {
    if (!val) {
      throw new Error(`is not a valid URL`)
    }

    if (this._protocol) {
      const protocol = val.protocol.replace(/:$/, '')
      if (this._protocol.test) {
        const res = this._protocol.test(protocol)

        if (!res) {
          throw new Error(`must have a protocol that matches ${this._protocol}`)
        }
      } else {
        if (protocol !== this._protocol) {
          throw new Error(`must have protocol '${this._protocol}'`)
        }
      }
    }

    if (this._trailingSlash === 'required') {
      if (!/\/$/.test(val.pathname)) {
        throw new Error(`must have a trailing slash`)
      }
    }

    super.validate(val)
  }

  _transform (str) {
    let url
    try {
      url = new URL(str)
    } catch (err) {
      return null
    }

    for (const [key, val] of this._defaultQueries) {
      if (!url.searchParams.has(key)) {
        url.searchParams.set(key, val)
      }
    }

    for (const [key, val] of this._overrideQueries) {
      url.searchParams.set(key, val)
    }

    return url
  }

  get requireTrailingSlash () {
    this._trailingSlash = 'required'

    return this
  }

  protocol (val) {
    this._protocol = val

    return this
  }

  defaultQuery (name, val) {
    this._defaultQueries.set(name, val)

    return this
  }

  overrideQuery (name, val) {
    this._overrideQueries.set(name, val)

    return this
  }
}

module.exports = LawnURL
