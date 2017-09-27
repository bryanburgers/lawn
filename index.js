'use strict'

const internalsSymbol = Symbol('Lawn config')
const validatorsSymbol = Symbol('Lawn validators')
const transformationsSymbol = Symbol('Lawn transformations')
const cloneSymbol = Symbol('Lawn create')

const Lawn = {
  [internalsSymbol]: {},
  [validatorsSymbol]: [],
  [transformationsSymbol]: [],

  [cloneSymbol] (changes, validator, converter) {
    const obj = Object.create(Lawn)
    obj[internalsSymbol] = this[internalsSymbol]
    obj[validatorsSymbol] = this[validatorsSymbol]
    obj[transformationsSymbol] = this[transformationsSymbol]
    return obj
  },

  props (props) {
    const obj = this[cloneSymbol]()
    obj[internalsSymbol] = Object.assign({}, this[internalsSymbol], props)
    return obj
  },

  validation (validation) {
    const obj = this[cloneSymbol]()
    obj[validatorsSymbol] = [...this[validatorsSymbol], validation]
    return obj
  },

  transformation (transformation) {
    const obj = this[cloneSymbol]()
    obj[transformationsSymbol] = [...this[transformationsSymbol], transformation]
    return obj
  },

  get string () {
    return this.props({ type: 'string' })
  },

  get number () {
    return this.props({ type: 'number' })
      .transformation(v => parseInt(v, 10))
      .validation({ message: 'is not a number', fn: v => !Number.isNaN(v) })
  },

  get bool () {
    return this.props({ type: 'bool' })
      .transformation(v => {
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
    return this.props({ description })
  },

  example (example) {
    return this.props({ example })
  },

  default (def) {
    return this.props({ default: def })
  },

  get optional () {
    return this.props({ optional: true })
  },

  regex (re, message) {
    if (message === undefined) {
      message = 'must match the regex ' + re.toString()
    }
    return this.validation({ message, fn: v => re.test(v) })
  },

  validate (config, properties) {
    if (!properties) {
      properties = process.env
    }

    const result = {}

    for (const key of Object.keys(config)) {
      const cfg = config[key][internalsSymbol]
      const transformations = config[key][transformationsSymbol]
      const validators = config[key][validatorsSymbol]
      const originalVal = properties[key]

      let val
      if (!originalVal) {
        if (cfg.optional === true) {
          continue
        }
        if (cfg.default === undefined) {
          throw new Error(`${key} is missing`)
        }
        val = cfg.default
      } else {
        val = transformations.reduce((val, transformation) => transformation(val), originalVal)
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

module.exports = Lawn
