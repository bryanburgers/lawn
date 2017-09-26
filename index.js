'use strict'

const internalsSymbol = Symbol('Lawn config')
const validatorSymbol = Symbol('Lawn validators')
const convertersSymbol = Symbol('Lawn converters')
const createSymbol = Symbol('Lawn create')

const Lawn = {
  [internalsSymbol]: {},
  [validatorSymbol]: [],
  [convertersSymbol]: [],

  [createSymbol] (changes, validator, converter) {
    const obj = Object.create(Lawn)
    obj[internalsSymbol] = Object.assign({}, this[internalsSymbol], changes)
    if (validator) {
      obj[validatorSymbol] = [...this[validatorSymbol], validator]
    } else {
      obj[validatorSymbol] = this[validatorSymbol]
    }
    if (converter) {
      obj[convertersSymbol] = [...this[convertersSymbol], converter]
    } else {
      obj[convertersSymbol] = this[convertersSymbol]
    }
    return obj
  },

  get string () {
    return this[createSymbol]({ type: 'string' })
  },

  get number () {
    return this[createSymbol]({ type: 'number' }, { message: 'is not a number', fn: v => !Number.isNaN(v) }, v => parseInt(v, 10))
  },

  get bool () {
    return this[createSymbol]({ type: 'bool' }, null, v => {
      switch (v.toLowerCase()) {
        case 'true':
        case 'yes':
        case 'y':
        case '1':
          return true
        default:
          return false
      }
    })
  },

  desc (description) {
    return this[createSymbol]({ description })
  },

  example (example) {
    return this[createSymbol]({ example })
  },

  default (def) {
    return this[createSymbol]({ default: def })
  },

  validate (config, properties) {
    if (!properties) {
      properties = process.env
    }

    const result = {}

    for (const key of Object.keys(config)) {
      const cfg = config[key][internalsSymbol]
      const converters = config[key][convertersSymbol]
      const validators = config[key][validatorSymbol]
      const originalVal = properties[key]

      let val
      if (!originalVal) {
        if (cfg.default === undefined) {
          throw new Error(`${key} is missing`)
        }
        val = cfg.default
      } else {
        val = converters.reduce((val, converter) => converter(val), originalVal)
      }

      for (const validator of validators) {
        const message = validator.message
        const fn = validator.fn
        if (!fn(val)) {
          throw new Error(`${key} is invalid: '${originalVal}' ${message}`)
        }
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

      if (cfg.default !== undefined) {
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

module.exports = Lawn
