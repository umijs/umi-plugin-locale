const { join, dirname, resolve } = require('path');
const { existsSync, statSync, readdirSync } = require('fs');

module.exports = function (api, opts = {
  enable: false,
  baseNavigator: true,
  default: 'zh-CN',
}) {
  if (opts.enable === false) {
    return;
  }
  const { IMPORT } = api.placeholder;
  const { paths, config } = api.service;
  const { winPath } = api.utils;

  api.register('modifyPageWatchers', ({ memo }) => {
    return [
      ...memo,
      join(paths.absSrcPath, 'locale'),
    ];
  });

  api.register('modifyRouterContent', ({ memo }) => {
    const localeFileList = getLocaleFileList();
    return getLocaleWrapper(localeFileList, memo);
  });

  api.register('modifyRouterFile', ({ memo }) => {
    const localeFileList = getLocaleFileList();
    return memo
      .replace(
        IMPORT,
        getInitCode(localeFileList, opts.default, opts.baseNavigator),
      );
  });

  api.register('modifyAFWebpackOpts', ({ memo }) => {
    memo.alias = {
      ...(memo.alias || {}),
      'umi/locale': resolve(__dirname, 'locale.js'),
    };
    return memo;
  });

  function getLocaleFileList() {
    const localeList = [];
    const localePath = join(paths.absSrcPath, 'locale');
    if (existsSync(localePath)) {
      const localePaths = readdirSync(localePath);
      for (let i = 0; i < localePaths.length; i++) {
        const fullname = join(localePath, localePaths[i]);
        const stats = statSync(fullname);
        const fileInfo = /^([a-z]{2})-([A-Z]{2})\.(js|ts)$/.exec(localePaths[i]);
        if (stats.isFile() && fileInfo) {
          localeList.push({
            lang: fileInfo[1],
            country: fileInfo[2],
            name: fileInfo[1] + '-' + fileInfo[2],
            path: fullname,
          });
        }
      }
    }
    return localeList;
  }

  function getLocaleWrapper(localeList, inner) {
    return `<LocaleProvider locale={appLocale.antd || defaultAntd}>
      ${localeList.length ? `<IntlProvider locale={appLocale.locale} messages={appLocale.messages}>
        <InjectedWrapper>${inner}</InjectedWrapper>
      </IntlProvider>` : `${inner}`}
    </LocaleProvider>`;
  }

  function getInitCode(localeList, defaultLocale = 'zh-CN', baseNavigator = true, useLocalStorage = true) {
    // 初始化依赖模块的引入
    // 把 locale 文件夹下的所有的模块的数据添加到 localeInfo 中
    // 然后按照优先级依次从 localStoray, 浏览器 Navigator（baseNavigator 为 true 时），default 配置中取语言设置
    // 如果 locale 下没有符合规则的文件，那么也可以仅仅针对 antd 做国际化
    return `
      ${localeList.length ? 'import { addLocaleData, IntlProvider, injectIntl } from \'react-intl\';' : ''}
      ${localeList.length ? 'import { _setIntlObject } from \'umi/locale\';' : ''}
      ${localeList.length ? `const InjectedWrapper = injectIntl(function(props) {
        _setIntlObject(props.intl);
        return props.children;
      })` : ''}
      const baseNavigator = ${baseNavigator};
      import { LocaleProvider } from 'antd';
      const defaultAntd = require('antd/lib/locale-provider/${defaultLocale.replace('-', '_')}');
      const localeInfo = {
        ${localeList.map(locale => `'${locale.name}': {
            messages: require('${winPath(locale.path)}').default,
            locale: '${locale.name}',
            antd: require('antd/lib/locale-provider/${locale.lang}_${locale.country}'),
            data: require('react-intl/locale-data/${locale.lang}'),
          }`
  ).join(',\n')}
      };
      let appLocale = {
        locale: '${defaultLocale}',
        messages: {},
      };
      if (${useLocalStorage} && localStorage.getItem('umi_locale') && localeInfo[localStorage.getItem('umi_locale')]) {
        appLocale = localeInfo[localStorage.getItem('umi_locale')];
      } else if (localeInfo[navigator.language] && baseNavigator){
        appLocale = localeInfo[navigator.language];
      } else {
        appLocale = localeInfo['${defaultLocale}'] || appLocale;
      }
      ${localeList.length ? 'appLocale.data && addLocaleData(appLocale.data);' : ''}
    `;
  }
};
