module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:import/typescript',
  ],
  plugins: ['import', 'prettier', 'unused-imports', '@typescript-eslint'],
  ignorePatterns: ['.eslintrc.js', 'node_modules/'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: '.',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  rules: {
    'import/no-unresolved': 'error',
    'no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'parent', 'sibling', 'index'],
        alphabetize: {
          order: 'asc',
        },
      },
    ],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'prettier/prettier': 'warn',
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        directory: './tsconfig.json',

        alwaysTryTypes: true,

        project: './tsconfig.json',

        resolveToModule: true,
        project: ['./tsconfig.json'],
      },
    },
  },
};
