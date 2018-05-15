import { join } from 'path';
import localePlugin, { getLocaleFileList } from '../src/index';

const absSrcPath = join(__dirname, '../examples/base/src');

const api = {
  placeholder: {
    IMPORT: 'test-placeholder'
  },
  utils: {
    winPath: p => {
      return p;
    }
  },
  service: {
    config: {},
    paths: {
      absSrcPath: absSrcPath
    }
  },
  register() {}
};

describe('test plugin', () => {
  test('only call modifyConfigPlugins when enable is false', () => {
    const register = jest.fn();
    api.service.config.locale = {
      enable: false
    };
    api.register = register;
    localePlugin(api);
    expect(register).toHaveBeenCalledTimes(1);
    expect(register).toHaveBeenCalledWith(
      'modifyConfigPlugins',
      expect.any(Function)
    );
  });

  test('enable is true', () => {
    const callers = {
      modifyPageWatchers: jest.fn(),
    }
    api.service.config.locale = {
      enable: true
    };
    api.register = (name, handler) => {
      if (name === 'modifyPageWatchers') {
        const ret = handler({
          memo: ['/some/test'],
        });
        expect(ret).toEqual([
          '/some/test',
          `${absSrcPath}/locale`,
        ]);
      }
      if (name === 'modifyRouterContent') {
        const ret = handler({
          memo: '<Router />',
        });
        expect(ret).toEqual(expect.stringContaining('<Router />'));
      }
      if (name === 'modifyRouterFile') {
        const ret = handler({
          memo: 'test-placeholder',
        });
        expect(ret).toEqual(expect.stringContaining('test-placeholder'));
      }
      if (name === 'modifyAFWebpackOpts') {
        const ret = handler({
          memo: {
            xxx: {},
            alias: {
              test: 'hi/hello'
            }
          }
        });
        expect(ret).toEqual({
          xxx: {},
          alias: {
            test: 'hi/hello',
            'umi/locale': join(__dirname, '../src/locale.js'),
            'react-intl': expect.stringContaining('react-intl'),
          }
        });
      }
    };
    localePlugin(api);
  });
});



describe('test func', () => {
  test('getLocaleFileList', () => {
    const list = getLocaleFileList(absSrcPath);
    expect(list).toEqual([
      {
        lang: 'en',
        country: 'US',
        name: 'en-US',
        path:
          `${absSrcPath}/locale/en-US.js`
      },
      {
        lang: 'zh',
        country: 'CN',
        name: 'zh-CN',
        path:
          `${absSrcPath}/locale/zh-CN.js`
      }
    ]);
  });
});
