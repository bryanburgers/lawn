# Lawn

The environment is dangerous. Your lawn is nice. Stay in your lawn.

Lawn is a library for validating that your environment variables are what you
expect, and generating .env files.

```js
require('lawn')
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
const lawnConfig = {
    PORT: lawn.number.desc('The port that the server will listen on').default(8000),
    SECRET: lawn.string.desc('The encryption key. Set it very secretly').example('S3CR3T'),
}

const config = lawn.validate(lawnConfig, process.env)
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
console.log(lawn.output(lawnConfig))
```

This outputs

```
# The port that the server will listen on (defaults to 8000)
# PORT=8000
# The encryption key. Set it very secretly
SECRET=S3CR3T
```
