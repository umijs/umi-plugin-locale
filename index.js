'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getLocaleFileList = getLocaleFileList;

exports.default = function (api) {
  var IMPORT = api.placeholder.IMPORT;
  var _api$service = api.service,
      paths = _api$service.paths,
      config = _api$service.config;
  var winPath = api.utils.winPath;

  var opts = config.locale || {};

  api.register('modifyConfigPlugins', function (_ref) {
    var memo = _ref.memo;

    memo.push(function (api) {
      return {
        name: 'locale',
        onChange: function onChange() {
          api.service.restart('locale config changed');
        }
      };
    });
    return memo;
  });

  if (opts.enable) {
    api.register('modifyPageWatchers', function (_ref2) {
      var memo = _ref2.memo;

      return [].concat(_toConsumableArray(memo), [join(paths.absSrcPath, 'locale')]);
    });

    api.register('modifyRouterContent', function (_ref3) {
      var memo = _ref3.memo;

      var localeFileList = getLocaleFileList(paths.absSrcPath);
      return getLocaleWrapper(localeFileList, memo);
    });

    api.register('modifyRouterFile', function (_ref4) {
      var memo = _ref4.memo;

      var localeFileList = getLocaleFileList(paths.absSrcPath);
      return memo.replace(IMPORT, '\n            ' + getInitCode(localeFileList, opts.default, opts.baseNavigator) + '\n            ' + IMPORT + '\n          ');
    });

    api.register('modifyAFWebpackOpts', function (_ref5) {
      var memo = _ref5.memo;

      memo.alias = _extends({}, memo.alias || {}, {
        'umi/locale': join(__dirname, './locale.js'),
        'react-intl': dirname(require.resolve('react-intl/package.json'))
      });
      return memo;
    });
  }

  function getLocaleWrapper(localeList, inner) {
    return '<LocaleProvider locale={appLocale.antd || defaultAntd}>\n      ' + (localeList.length ? '<IntlProvider locale={appLocale.locale} messages={appLocale.messages}>\n        <InjectedWrapper>' + inner + '</InjectedWrapper>\n      </IntlProvider>' : '' + inner) + '\n    </LocaleProvider>';
  }

  function getInitCode(localeList) {
    var defaultLocale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'zh-CN';
    var baseNavigator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var useLocalStorage = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

    // 初始化依赖模块的引入
    // 把 locale 文件夹下的所有的模块的数据添加到 localeInfo 中
    // 然后按照优先级依次从 localStoray, 浏览器 Navigator（baseNavigator 为 true 时），default 配置中取语言设置
    // 如果 locale 下没有符合规则的文件，那么也可以仅仅针对 antd 做国际化
    return '\n      ' + (localeList.length ? 'import { addLocaleData, IntlProvider, injectIntl } from \'react-intl\';' : '') + '\n      ' + (localeList.length ? 'import { _setIntlObject } from \'umi/locale\';' : '') + '\n      ' + (localeList.length ? 'const InjectedWrapper = injectIntl(function(props) {\n        _setIntlObject(props.intl);\n        return props.children;\n      })' : '') + '\n      const baseNavigator = ' + baseNavigator + ';\n      import { LocaleProvider } from \'antd\';\n      const defaultAntd = require(\'antd/lib/locale-provider/' + defaultLocale.replace('-', '_') + '\');\n      const localeInfo = {\n        ' + localeList.map(function (locale) {
      return '\'' + locale.name + '\': {\n            messages: require(\'' + winPath(locale.path) + '\').default,\n            locale: \'' + locale.name + '\',\n            antd: require(\'antd/lib/locale-provider/' + locale.lang + '_' + locale.country + '\'),\n            data: require(\'react-intl/locale-data/' + locale.lang + '\'),\n          }';
    }).join(',\n') + '\n      };\n      let appLocale = {\n        locale: \'' + defaultLocale + '\',\n        messages: {},\n      };\n      if (' + useLocalStorage + ' && localStorage.getItem(\'umi_locale\') && localeInfo[localStorage.getItem(\'umi_locale\')]) {\n        appLocale = localeInfo[localStorage.getItem(\'umi_locale\')];\n      } else if (localeInfo[navigator.language] && baseNavigator){\n        appLocale = localeInfo[navigator.language];\n      } else {\n        appLocale = localeInfo[\'' + defaultLocale + '\'] || appLocale;\n      }\n      ' + (localeList.length ? 'appLocale.data && addLocaleData(appLocale.data);' : '') + '\n    ';
  }
};

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _require = require('path'),
    join = _require.join,
    dirname = _require.dirname,
    resolve = _require.resolve;

var _require2 = require('fs'),
    existsSync = _require2.existsSync,
    statSync = _require2.statSync,
    readdirSync = _require2.readdirSync;

// export for test


function getLocaleFileList(absSrcPath) {
  var localeList = [];
  var localePath = join(absSrcPath, 'locale');
  if (existsSync(localePath)) {
    var localePaths = readdirSync(localePath);
    for (var i = 0; i < localePaths.length; i++) {
      var fullname = join(localePath, localePaths[i]);
      var stats = statSync(fullname);
      var fileInfo = /^([a-z]{2})-([A-Z]{2})\.(js|ts)$/.exec(localePaths[i]);
      if (stats.isFile() && fileInfo) {
        localeList.push({
          lang: fileInfo[1],
          country: fileInfo[2],
          name: fileInfo[1] + '-' + fileInfo[2],
          path: fullname
        });
      }
    }
  }
  return localeList;
}

;