# unicode-property-aliases [![Build status](https://travis-ci.org/mathiasbynens/unicode-property-aliases.svg?branch=master)](https://travis-ci.org/mathiasbynens/unicode-property-aliases)

_unicode-property-aliases_ offers the Unicode property alias mappings in an easy-to-consume JavaScript format.

It’s based on [the `PropertyAliases.txt` data for Unicode v9.0.0](http://unicode.org/Public/9.0.0/ucd/PropertyAliases.txt).

## Installation

To use _unicode-property-aliases_ programmatically, install it as a dependency via [npm](https://www.npmjs.com/):

```bash
$ npm install unicode-property-aliases
```

Then, `require` it:

```js
const propertyAliases = require('unicode-property-aliases');
```

## Usage

This module exports a `Map` object. The most common usage is to convert a property alias to its canonical form:

```js
propertyAliases.get('sfc')
// → 'Simple_Case_Folding'
```

## Author

| [![twitter/mathias](https://gravatar.com/avatar/24e08a9ea84deb17ae121074d0f17125?s=70)](https://twitter.com/mathias "Follow @mathias on Twitter") |
|---|
| [Mathias Bynens](https://mathiasbynens.be/) |

## License

_unicode-property-aliases_ is available under the [MIT](https://mths.be/mit) license.
