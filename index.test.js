/* global describe it */

'use strict'

const assert = require('chai').assert
const stripIndent = require('strip-indent')

const lawn = require('.')

describe('lawn', function () {
  describe('validate', function () {
    it('converters a number', function () {
      const spec = {
        SECRET: lawn.string,
        PORT: lawn.number
      }

      const result = lawn.validate(spec, {
        SECRET: 's3cr3t',
        PORT: '8000'
      })

      assert.deepEqual(result, {
        SECRET: 's3cr3t',
        PORT: 8000
      })
    })

    it('throws on NaN', function () {
      const spec = {
        PORT: lawn.number
      }

      assert.throws(() => lawn.validate(spec, {
        PORT: 'WHAT'
      }), /PORT is invalid: 'WHAT' is not a number/)
    })

    it('throws on missing key', function () {
      const spec = {
        PORT: lawn.number
      }

      assert.throws(() => lawn.validate(spec, {
        SECRET: 'WHAT'
      }), /PORT is missing/)
    })

    it('uses defaults when missing', function () {
      const spec = {
        PORT: lawn.number.default(8000)
      }

      const result = lawn.validate(spec, {
        SECRET: 'WHAT'
      })

      assert.propertyVal(result, 'PORT', 8000)
    })

    it('converts a boolean', function () {
      const spec = {
        BOOL0: lawn.bool,
        BOOL1: lawn.bool,
        BOOL2: lawn.bool,
        BOOL3: lawn.bool,
        BOOL4: lawn.bool,
        BOOL5: lawn.bool,
        BOOL6: lawn.bool,
        BOOL7: lawn.bool
      }

      const result = lawn.validate(spec, {
        BOOL0: 'yes',
        BOOL1: 'YES',
        BOOL2: 'y',
        BOOL3: 'true',
        BOOL4: 'TRUE',
        BOOL5: '1',
        BOOL6: 'anything else',
        BOOL7: 'anything else'
      })

      assert.deepEqual(result, {
        BOOL0: true,
        BOOL1: true,
        BOOL2: true,
        BOOL3: true,
        BOOL4: true,
        BOOL5: true,
        BOOL6: false,
        BOOL7: false
      })
    })

    it('validates process.env if no properties are given', function () {
      process.env = {
        SECRET: 's3cr3t',
        PORT: '8000'
      }

      const spec = {
        SECRET: lawn.string,
        PORT: lawn.number
      }

      const result = lawn.validate(spec)

      assert.deepEqual(result, {
        SECRET: 's3cr3t',
        PORT: 8000
      })
    })

    it('allows optional values', function () {
      const spec = {
        OPTIONAL: lawn.string.optional
      }

      const result = lawn.validate(spec, {})
      assert.notProperty(result, 'OPTIONAL')
    })
  })

  describe('output', function () {
    it('outputs some simple stuff', function () {
      const spec = {
        MYSQL_HOST: lawn.string,
        MYSQL_PORT: lawn.number
      }

      const result = lawn.output(spec)

      assert.equal(result, stripIndent(`
                MYSQL_HOST=
                MYSQL_PORT=
            `).trim())
    })

    it('includes descriptions, if available', function () {
      const spec = {
        MYSQL_HOST: lawn.string.desc('The MySQL host'),
        MYSQL_PORT: lawn.number.desc('The port to run MySQL on')
      }

      const result = lawn.output(spec)

      assert.equal(result, stripIndent(`
                # The MySQL host
                MYSQL_HOST=
                # The port to run MySQL on
                MYSQL_PORT=
            `).trim())
    })

    it('includes examples', function () {
      const spec = {
        MYSQL_HOST: lawn.string.example('127.0.0.1')
      }

      const result = lawn.output(spec)

      assert.equal(result, stripIndent(`
                MYSQL_HOST=127.0.0.1
            `).trim())
    })

    it('includes commented out defaults', function () {
      const spec = {
        MYSQL_PORT: lawn.number.default(3306)
      }

      const result = lawn.output(spec)

      assert.equal(result, stripIndent(`
                # MYSQL_PORT=3306
            `).trim())
    })

    it('includes commented out optionals', function () {
      const spec = {
        MYSQL_PORT: lawn.number.optional.example(3306)
      }

      const result = lawn.output(spec)

      assert.equal(result, stripIndent(`
                # MYSQL_PORT=3306
            `).trim())
    })
  })
})
