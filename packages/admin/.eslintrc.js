// eslint-disable-next-line no-undef
module.exports = {
  'env': {
    'browser': true,
    'es2020': true
  },
  'globals': {
    'process': 'readonly'
  },
  'plugins': [
    '@typescript-eslint'
  ],
  'extends': [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended'
  ],

  'parser': '@babel/eslint-parser',
  'parserOptions': {
    'ecmaVersion': 2018,
    'sourceType': 'module',
    'allowImportExportEverywhere': true,
    'ecmaFeatures': {
      'jsx': true
    },
    'babelOptions': {
      'configFile': './babel.config.json',
    },
  },
  'rules': {
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { 'varsIgnorePattern': 'React' }],
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    'react/display-name': 'off',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-var-requires': 'off'
  },
  'overrides': [
    {
      'files': ['**/*.ts', '**/*.tsx'],
      'parser': '@typescript-eslint/parser',
      'parserOptions': {
        'ecmaFeatures': {
          'jsx': true
        },
        'ecmaVersion': 2018,
        // 'tsconfigRootDir': '.',
        // 'project': './packages/web/tsconfig.json',
      }
    },
    {
      'files': ['**/*.js', '**/*.jsx'],
      'rules': {
        '@typescript-eslint/explicit-module-boundary-types': 'off'
      }
    }
  ]
};
