// eslint-disable-next-line no-undef
module.exports = {
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'warnOnUnsupportedTypeScriptVersion': false,
    'sourceType': 'module'
  },
  'env': {
    'browser': false,
    'node': true,
    'es6': true
  },
  'plugins': [
    '@typescript-eslint'
  ],
  'overrides': [
    // By default, the ESLint CLI only looks at .js files. But, it will also look at
    // any files which are referenced in an override config. Most users of typescript-eslint
    // get this behavior by default by extending a recommended typescript-eslint config, which
    // just so happens to override some core ESLint rules. We don't extend from any config, so
    // explicitly reference TS files here so the CLI picks them up.
    //
    // ESLint in VS Code will lint any opened file (so long as it's not eslintignore'd), so
    // that will work regardless of the below.
    { 'files': ['*.ts', '*.mts', '*.cts', '*.mjs', '*.cjs'] }
  ],
  'rules': {
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/no-var-requires': 'off',
    'indent': ['error', 2],
    'linebreak-style': ['error','unix'],
    'quotes': ['error','single'],
    'semi': ['error','always']
  }
};
