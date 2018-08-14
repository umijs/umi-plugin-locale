# umi-plugin-locale

[![NPM version](https://img.shields.io/npm/v/umi-plugin-locale.svg?style=flat)](https://npmjs.org/package/umi-plugin-locale)

Umi plugin for i18n, based on [react-intl](https://npmjs.org/react-intl).

**This is the 1.0 repo, it is for umi 1.0. If you are look for 2.0, visit: https://github.com/umijs/umi/tree/master/packages/umi-plugin-locale .**

## Usage

Save dependencies.

```bash
$ npm install umi-plugin-locale --save-dev
```

Add and config plugin in  `.umirc.js` or `config/config.js`.

```js
export default {
  plugins: [
    'umi-plugin-locale',
  ],
  locale: {
    enable: true, // default false
    default: 'zh-CN', // default zh-CN
    baseNavigator: true, // default true, when it is true, will use `navigator.language` overwrite default
    antd: true, // use antd, default is true
  },
  singular: true, // when singular is not true, use locales as the resources folder
}
```

Add locale file in `src/locale(s)` like `zh-CN.js`.

```js
export default {
  test: '测试',
}
```

Then you can wirte code like this:

```js
import {
  formatMessage,
  setLocale,
  getLocale,
  FormattedMessage,
} from 'umi/locale';

export default () => {
  return <div><FormattedMessage id="test" /></div>
}
```

## Examples

* [locale with this plugin](https://github.com/umijs/umi-plugin-locale/tree/master/examples/base)

## Debug

```sh
npm run dev
cd examples/base
npm link ../../
npm i
umi dev
```

## Release

```sh
npm run build
npm run pub
```

## TodoList

- dynamic load locale resources.

## LICENSE

MIT
