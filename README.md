# Lawn

The environment is dangerous. Your lawn is nice. Stay in your lawn.

Lawn is a library for validating that your environment variables are what you
expect, and generating .env files.

```js
const lawn = require('lawn')
```


## The Problem

You've gone all in on [the Twelve-Factor App][twelvefactor] and/or you always
store your application configuration in environment variables.

Now configuration values are strewn throughout your code, parsed in some
places, expected to conform in certain ways in other places.

And then, when a new teammate gets spun up on the project, they have no idea
what environment variables they need to set.

[twelvefactor]: https://12factor.net/config


## The Solution

Enter, `lawn`. Lawn lets you declaratively express all of your configuration
up-front.

```js
// lawn-spec.js
module.exports = {
    PORT: lawn.number.desc('The port that the server will listen on').default(8000),
    SECRET: lawn.string.desc('The encryption key. Set it very secretly').example('S3CR3T'),
}

// index.js
const lawn = require('lawn')
const lawnSpec = require('./lawn-spec')
const config = lawn.validate(lawnSpec, process.env)
```

Lawn transforms and validates your properties.

```js
config.port
//=> 8000 (a number, not a string)
```


## Generating an .env

If you've ever included an .env.sample in your project, you'll know it gets
out-of-date. Instead of maintaining an .env.sample when changing an environment
variable, generate it from the config instead.

```js
console.log(lawn.output(lawnSpec))
```

This outputs

```
# The port that the server will listen on (defaults to 8000)
# PORT=8000
# The encryption key. Set it very secretly
SECRET=S3CR3T
```


## Spec API

### lawn

The root spec object.

### lawn.validate(spec, [props])

Validate the given spec against the properties given. If no properties are
given, `process.env` is used.

If the validation succeeds, the transformed configuration will be returned.

If the validation fails, an error will be thrown with a reasonable error message.

```js
const lawnSpec = {
  PORT: lawn.number.description('The port to listen on').default(8000),
  DEBUG: lawn.bool.description('Whether to start in debug mode').default(true),
}

lawn.validate(lawnSpec, {})
//=> { PORT: 8000, DEBUG: true }

lawn.validate(lawnSpec, { PORT: "3500", DEBUG: "0" }
//=> { PORT: 3500, DEBUG: false }

lawn.validate(lawnSpec, { PORT: "Yes, please" }
//=> throws "PORT is invalid: 'Yes, please' is not a number"
```

### lawn.output(spec)

Returns a string in [dotenv format][dotenv] format, including descriptions (if
set) and example values.

```js
const lawnSpec = {
  PORT: lawn.number
    .description('The port to listen on')
    .default(8000),

  AWS_ACCESS_KEY_ID: lawn.string
    .description('The AWS access key for the S3 bucket')
    .example('AKIAIOSFODNN7EXAMPLE'),

  AWS_SECRET_ACCESS_KEY: lawn.string
    .description('The AWS secret key for the S3 bucket')
    .example('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'),

  AWS_REGION: lawn.string
    .description('The AWS region where the S3 bucket resides')
    .default('us-east-1'),
}

lawn.output(lawnSpec)
=> `# The port to listen on
# PORT=8000
# The AWS access key for the S3 bucket
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
# The AWS secret key for the S3 bucket
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
# The AWS region where the S3 bucket resides
# AWS_REGION=us-east-1`
```

[dotenv]: https://www.npmjs.com/package/dotenv

### Common properties

#### .default(v)

The default value of the property. If no environment variable is set for this
property, then use the default.

#### .description(d)

A description of the property. This is used when generating an example
environment string.

#### .example(v)

An example value of the property. This is used when generating an example
environment string.

#### .optional

Mark the property as optional. If marked as optional and the property does not
exist, `lawn.validate` will not throw an error, and instead will not include
the property in its return value.

### String

#### .string

Declares that this property is a string.

#### .regex(re, [description])

Validate that the string provided matches the given regex. If it does not, the
optional description will be displayed as the error message.

```js
const lawnSpec = {
    REMOTE_API: lawn.string.regex(/^https?:\/\//i, 'must be an http or https address')
}

lawn.validate(lawnSpec, { REMOTE_API: 'https://example.com' })
//=> { REMOTE_API: 'https://example.com' }

lawn.validate(lawnSpec, { REMOTE_API: 'example.com' })
//=> throws "REMOTE_API is invalid: 'example.com' must be an http or https address"
```

### Number

#### .number

Declares this this property is an integer.

### Boolean

#### .bool

Declare that this property is a boolean.

Values that resolve to `true` are:

- `"true"` (case-insensitive)
- `"yes"` (case-insensitive)
- `"t"` (case-insensitive)
- `"1"`

All other values resolve to `false`.

### URL

#### .url

Declares that this property is a URL.

#### .protocol(str|regex)

Validate that the URL provided matches the required protocol.

```js
const lawnSepc = {
    WEB_API: lawn.url.protocol(/http|https/)
}

lawn.validate(lawnSpec, { WEB_API: 'https://example.com/api' })
//=> { WEB_API: 'https://example.com/api' }

lawn.validate(lawnSpec, { WEB_API: 'mysql://user:pass@host/database' })
//=> throws "WEB_API is invalid: 'mysql://user:pass@host/database' must have a protocol that matches /http|https/"
```

#### .defaultQuery(name, val)

Defaults a query string parameter to the given value.

```js
const lawnSepc = {
    MYSQL: lawn.url.defaultQuery('connectionLimit', '8')
}

lawn.validate(lawnSpec, { MYSQL: 'mysql://user:pass@host/database' })
//=> { MYSQL: 'mysql://user:pass@host/database?connectionLimit=8' }

lawn.validate(lawnSpec, { MYSQL: 'mysql://user:pass@host/database?connectionLimit=2' })
//=> { MYSQL: 'mysql://user:pass@host/database?connectionLimit=2' }
```

#### .overrideQuery(name, val)

Forces a query string parameter to the given value. This is useful if a certain
query string value needs to be set on the URL.

```js
const lawnSepc = {
    MYSQL: lawn.url.overrideQuery('multipleStatements', 'true')
}

lawn.validate(lawnSpec, { MYSQL: 'mysql://user:pass@host/database' })
//=> { MYSQL: 'mysql://user:pass@host/database?multipleStatements=true' }

lawn.validate(lawnSpec, { MYSQL: 'mysql://user:pass@host/database?multipleStatements=false' })
//=> { MYSQL: 'mysql://user:pass@host/database?multipleStatements=true' }
```
