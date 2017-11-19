'use strict'

const { internalsSymbol } = require('./symbols')

const Lawn = {
  use (name, BaseClass) {
    Object.defineProperty(this, name, {
      configurable: true,
      enumerable: true,
      get () {
        return new BaseClass()
      }
    })
  },

  validate (config, properties) {
    if (!properties) {
      properties = process.env
    }

    const result = {}

    for (const key of Object.keys(config)) {
      const obj = config[key]
      const cfg = config[key][internalsSymbol]
      const originalVal = properties[key]

      let val
      if (originalVal === undefined) {
        if (cfg.optional === true) {
          continue
        }
        if (cfg.default === undefined) {
          throw new Error(`${key} is missing`)
        }
        val = cfg.default
      } else {
        val = obj._transform(originalVal)
      }

      try {
        obj.validate(val, originalVal)
      } catch (err) {
        throw new Error(`${key} is invalid: '${originalVal}' ${err.message}`)
      }

      result[key] = val
    }

    return result
  },

  output (config, properties) {
    const strs = []
    for (const key of Object.keys(config)) {
      const cfg = config[key][internalsSymbol]
      if (cfg.description) {
        strs.push(`# ${cfg.description}`)
      }

      if (cfg.optional === true) {
        const example = cfg.example || ''
        strs.push(`# ${key}=${example}`)
      } else if (cfg.default !== undefined) {
        strs.push(`# ${key}=${cfg.default}`)
      } else {
        const example = cfg.example || ''
        strs.push(`${key}=${example}`)
      }
    }

    return strs.join('\n')
  }
}

Lawn.internals = internalsSymbol

Lawn.use('string', require('./types/string'))
Lawn.use('number', require('./types/number'))
Lawn.use('bool', require('./types/boolean'))

module.exports = Lawn
