import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import globals from 'globals'

const tsRules = {
  ...tseslint.configs.recommended.rules,

  // 项目内约定：允许 any 滥用（遗留代码较多，逐步收敛）
  '@typescript-eslint/no-explicit-any': 'off',
  // script setup 中可能出现的未使用函数/变量由 TS 负责
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': 'off'
}

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/assets/icons/**',
      '**/*.d.ts',
      'vite.config.ts',
      'vite.config.d.ts',
      'tsconfig*.json',
      '*.tsbuildinfo'
    ]
  },

  js.configs.recommended,

  ...pluginVue.configs['flat/recommended'],

  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: tsRules
  },

  {
    files: ['**/*.vue'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.vue']
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      ...tsRules,
      // Vue 组件命名不强制多词
      'vue/multi-word-component-names': 'off',
      // 排版风格规则关闭（项目自有排版约定，格式化交给 prettier）
      'vue/max-attributes-per-line': 'off',
      'vue/html-self-closing': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/attributes-order': 'off'
    }
  }
]
