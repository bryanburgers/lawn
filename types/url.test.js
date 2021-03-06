/* global describe it beforeEach */

'use strict'

const assert = require('chai').assert

const lawn = require('..')

describe('lawn', function () {
  describe('url', function () {
    beforeEach(function () {
      // URL-based checking can only happen when the URL constructor exists,
      // which is Node 7.0.0 and above.
      const { URL } = require('url')
      if (!URL) {
        this.skip()
      }
    })

    it('converts a URL', function () {
      const spec = {
        URL: lawn.url
      }

      const result = lawn.validate(spec, {
        URL: 'mysql://user:pass@host:3306/database'
      })

      assert.equal(result.URL.href, 'mysql://user:pass@host:3306/database')
    })

    it('throws when the URL is invalid', function () {
      const spec = {
        URL: lawn.url
      }

      assert.throws(() => lawn.validate(spec, {
        URL: 'WHAT'
      }), /URL is invalid: 'WHAT' is not a valid URL/)
    })

    it('does not throw when common properties are used first', function () {
      assert.doesNotThrow(() => {
        lawn.url
          .desc('Description first')
          .defaultQuery('one', 'two')
      })
    })

    describe('.protocol', function () {
      it('succeeds on a text match', function () {
        const spec = {
          URL: lawn.url.protocol('mysql')
        }

        const result = lawn.validate(spec, {
          URL: 'mysql://user:pass@host:3306/database'
        })

        assert.equal(result.URL.href, 'mysql://user:pass@host:3306/database')
      })

      it('throws on a failed text match', function () {
        const spec = {
          URL: lawn.url.protocol('mysql')
        }

        assert.throws(() => lawn.validate(spec, {
          URL: 'postgres://user:pass@host:3306/database'
        }), /URL is invalid: 'postgres:\/\/user:pass@host:3306\/database' must have protocol 'mysql'/)
      })

      it('succeeds on a regex match', function () {
        const spec = {
          URL: lawn.url.protocol(/http|https/)
        }

        const result = lawn.validate(spec, {
          URL: 'http://example.com/'
        })

        assert.equal(result.URL.href, 'http://example.com/')
      })

      it('throws on a failed regex match', function () {
        const spec = {
          URL: lawn.url.protocol(/http|https/)
        }

        assert.throws(() => lawn.validate(spec, {
          URL: 'mysql://user:pass@host:3306/database'
        }), /URL is invalid: 'mysql:\/\/user:pass@host:3306\/database' must have a protocol that matches \/http|https\//)
      })
    })

    describe('.requireTrailingSlash', function () {
      it('allows a URL with a trailing slash', function () {
        const spec = {
          URL: lawn.url.requireTrailingSlash
        }

        const result = lawn.validate(spec, {
          URL: 's3://bucket/folder/'
        })

        assert.equal(result.URL.href, 's3://bucket/folder/')
      })

      it('rejects a URL without a trailing slash', function () {
        const spec = {
          URL: lawn.url.requireTrailingSlash
        }

        assert.throws(() => lawn.validate(spec, {
          URL: 's3://bucket/folder'
        }), /URL is invalid: 's3:\/\/bucket\/folder' must have a trailing slash/)
      })

      it('allows a URL with a trailing slash and a query string', function () {
        const spec = {
          URL: lawn.url.requireTrailingSlash
        }

        const result = lawn.validate(spec, {
          URL: 's3://bucket/folder/?region=us-east-1'
        })

        assert.equal(result.URL.href, 's3://bucket/folder/?region=us-east-1')
      })

      it('rejects a URL without a trailing slash and a query string', function () {
        const spec = {
          URL: lawn.url.requireTrailingSlash
        }

        assert.throws(() => lawn.validate(spec, {
          URL: 's3://bucket/folder?region=us-east-1'
        }), /URL is invalid: 's3:\/\/bucket\/folder\?region=us-east-1' must have a trailing slash/)
      })
    })

    describe('.defaultQuery', function () {
      it('sets default values when they are missing', function () {
        const spec = {
          URL: lawn.url.defaultQuery('connectionLimit', '4')
        }

        const result = lawn.validate(spec, {
          URL: 'mysql://user:pass@host:3306/database'
        })

        assert.equal(result.URL.href, 'mysql://user:pass@host:3306/database?connectionLimit=4')
      })

      it('leaves default values when they are not missing', function () {
        const spec = {
          URL: lawn.url.defaultQuery('connectionLimit', '4')
        }

        const result = lawn.validate(spec, {
          URL: 'mysql://user:pass@host:3306/database?connectionLimit=5'
        })

        assert.equal(result.URL.href, 'mysql://user:pass@host:3306/database?connectionLimit=5')
      })
    })

    describe('.overrideQuery', function () {
      it('overrides set values when they are missing', function () {
        const spec = {
          URL: lawn.url.overrideQuery('multipleStatements', 'true')
        }

        const result = lawn.validate(spec, {
          URL: 'mysql://user:pass@host:3306/database'
        })

        assert.equal(result.URL.href, 'mysql://user:pass@host:3306/database?multipleStatements=true')
      })

      it('overrides set values when they are set', function () {
        const spec = {
          URL: lawn.url.overrideQuery('multipleStatements', 'true')
        }

        const result = lawn.validate(spec, {
          URL: 'mysql://user:pass@host:3306/database?multipleStatements=false'
        })

        assert.equal(result.URL.href, 'mysql://user:pass@host:3306/database?multipleStatements=true')
      })
    })
  })
})
