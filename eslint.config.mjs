import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Update to include airbnb and prettier
const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "airbnb",
    "airbnb/hooks",
    "prettier"
  ),
  {
    languageOptions: {
      globals: {
        React: 'writable',
      },
      parserOptions: {
        project: true,
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.jsx'] }],
      camelcase: 'off',
      'import/extensions': 'off',
      'react/jsx-props-no-spreading': 'off',
      'import/no-extraneous-dependencies': 'off',
      'no-console': ['warn', { allow: ['error'] }],
      'no-restricted-syntax': 'off',
      'no-await-in-loop': 'off',
      'no-continue': 'off',
      'no-underscore-dangle': 'off',
      'radix': 'off',
      'no-restricted-globals': 'off',
      'import/prefer-default-export': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];

export default eslintConfig;
