import { existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

import js from '@eslint/js'
import pluginQuery from '@tanstack/eslint-plugin-query'
import { importX } from 'eslint-plugin-import-x'
import perfectionist from 'eslint-plugin-perfectionist'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import unusedImports from 'eslint-plugin-unused-imports'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const fsExistsCache = new Map()
const cachedIsDirectory = path => {
  if (!fsExistsCache.has(path)) {
    fsExistsCache.set(path, existsSync(path) && statSync(path).isDirectory())
  }
  return fsExistsCache.get(path)
}

const featuresDir = join(import.meta.dirname, 'src', 'features')

const isFeatureDomain = dirPath => {
  const key = `domain:${dirPath}`
  if (fsExistsCache.has(key)) return fsExistsCache.get(key)

  if (!existsSync(dirPath) || !statSync(dirPath).isDirectory()) {
    fsExistsCache.set(key, false)
    return false
  }

  if (cachedIsDirectory(join(dirPath, 'features'))) {
    fsExistsCache.set(key, true)
    return true
  }

  try {
    const hasDomainChild = readdirSync(dirPath, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .some(e => isFeatureDomain(join(dirPath, e.name)))
    fsExistsCache.set(key, hasDomainChild)
    return hasDomainChild
  } catch {
    fsExistsCache.set(key, false)
    return false
  }
}

const featuresBarrelFileEnforcement = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Imports from @/features/ outside of src/features must go through an index.ts barrel file',
    },
    messages: {
      mustUseFeatureIndex: 'Import "@/features/{{imported}}" must go through an index.ts barrel file.',
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value
        const filePath = context.filename || context.getFilename()

        if (!importPath.startsWith('@/features/')) return

        if (filePath.startsWith(featuresDir + '/') || filePath.startsWith(featuresDir + '\\')) return

        const importRelative = importPath.slice('@/features/'.length)
        const normalizedImport = importRelative.replace(/\/index(\.[a-z]+)?$/i, '')
        const importAbsPath = join(featuresDir, ...normalizedImport.split('/'))

        const hasIndex = ['index.ts', 'index.tsx', 'index.js'].some(f => existsSync(join(importAbsPath, f)))

        if (!hasIndex) {
          context.report({
            node,
            messageId: 'mustUseFeatureIndex',
            data: { imported: importRelative },
          })
        }
      },
    }
  },
}

const noFeatureBoundaryViolations = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent sibling feature folder imports and parent importing from child feature folder',
    },
    messages: {
      siblingImport: '"{{current}}" cannot import from sibling "{{imported}}". Lift shared code to a common parent.',
      parentFromChild: '"{{current}}" cannot import from its child "{{imported}}". Children depend on parents, not the other way around.',
    },
  },
  create(context) {
    const toFeatureDomainSegments = pathFromFeaturesRoot => {
      const domainSegments = []
      let fsPath = featuresDir

      for (const seg of pathFromFeaturesRoot.split(/[\\/]/)) {
        if (seg === 'features') {
          fsPath = join(fsPath, seg)
          continue
        }
        const candidatePath = join(fsPath, seg)
        if (isFeatureDomain(candidatePath)) {
          domainSegments.push(seg)
          fsPath = candidatePath
        } else {
          break
        }
      }
      return domainSegments
    }

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value
        const filePath = context.filename || context.getFilename()

        if (!importPath.startsWith('@/features/')) return

        const fileAfterFeatures = filePath.match(/[\\/]features[\\/](.+)/)
        if (!fileAfterFeatures) return

        const fileSegments = toFeatureDomainSegments(fileAfterFeatures[1])
        if (fileSegments.length === 0) return

        const importSegments = toFeatureDomainSegments(importPath.replace('@/features/', ''))
        if (importSegments.length === 0) return

        let commonLen = 0
        while (
          commonLen < fileSegments.length &&
          commonLen < importSegments.length &&
          fileSegments[commonLen] === importSegments[commonLen]
        ) {
          commonLen++
        }

        const current = fileSegments.join('/')
        const imported = importSegments.join('/')

        if (commonLen < fileSegments.length && commonLen < importSegments.length) {
          context.report({ node, messageId: 'siblingImport', data: { current, imported } })
          return
        }

        if (commonLen === fileSegments.length && importSegments.length > fileSegments.length) {
          context.report({ node, messageId: 'parentFromChild', data: { current, imported } })
        }
      },
    }
  },
}

export default defineConfig([
  ...pluginQuery.configs['flat/recommended'],
  globalIgnores([
    'dist',
    '.tanstack',
    'src/common/components/ui',
    'src/setup/routeTree.gen.ts',
    'src/setup/i18n/i18n.types.d.ts',
    'public/mockServiceWorker.js',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended, reactRefresh.configs.vite],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'import-x': importX,
      perfectionist: perfectionist,
      'react-hooks': reactHooks,
      'unused-imports': unusedImports,
      'custom-rules': {
        rules: {
          'no-feature-boundary-violations': noFeatureBoundaryViolations,
          'features-barrel-file-enforcement': featuresBarrelFileEnforcement,
        },
      },
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.app.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      'import-x/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'custom-rules/no-feature-boundary-violations': 'error',
      'custom-rules/features-barrel-file-enforcement': 'error',
      'no-console': 'error',
      'no-alert': 'error',
      'no-implicit-coercion': [
        'error',
        {
          disallowTemplateShorthand: false,
          allow: [],
        },
      ],
      'prefer-template': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Default exports are not allowed. Use named exports instead.',
        },
        {
          selector: 'MemberExpression[object.name="React"]',
          message: 'Do not use React.* namespace imports. Import specific items directly (e.g., import { useState } from "react").',
        },
        {
          selector: 'JSXElement[openingElement.name.name="Fragment"]',
          message: 'Use the shorthand fragment syntax <></> instead of <Fragment>.',
        },
        {
          selector: 'JSXElement[openingElement.name.object.name="React"][openingElement.name.property.name="Fragment"]',
          message: 'Use the shorthand fragment syntax <></> instead of <React.Fragment>.',
        },
      ],
      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            FC: {
              message: 'Use plain function components with explicit props typing instead of FC',
            },
            FunctionComponent: {
              message: 'Use plain function components with explicit props typing instead of FunctionComponent',
            },
          },
        },
      ],
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'generic',
        },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
          suffix: ['T'],
          failureMessage: 'Type alias names must be in PascalCase and end with "T" (e.g., UserT, ConfigT)',
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
          suffix: ['E'],
          failureMessage: 'Enum names must be in PascalCase and end with "E" (e.g., StatusE, ColorE)',
        },
        {
          selector: 'variable',
          modifiers: ['global', 'const', 'exported'],
          types: ['array', 'number', 'string', 'boolean'],
          format: ['UPPER_CASE'],
          failureMessage: 'Exported module-level constants must be in UPPER_CASE (e.g., NAV_ITEMS, MAX_RETRIES)',
        },
      ],
      '@typescript-eslint/no-empty-interface': 'error',
      'import-x/no-cycle': [
        'error',
        {
          maxDepth: 10,
          ignoreExternal: true,
        },
      ],
      'perfectionist/sort-exports': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
          ignoreCase: true,
        },
      ],
      'perfectionist/sort-named-exports': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
          ignoreCase: true,
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', './*'],
              message: 'Use absolute imports (@/common/*, @/features/*, @/setup/*) instead of relative imports.',
            },
            {
              group: ['@common/*', '@features/*', '@setup/*'],
              message: 'Use the @/ prefix style (@/common/*, @/features/*, @/setup/*) instead of @common/*, @features/*, or @setup/*.',
            },
            {
              group: ['@/common/components/ui', '@/common/components/ui/*'],
              message:
                'Do not import from components/ui. Move the component into the matching components subfolder (atoms, molecules, organisms or templates), align it with to fit the project conventions, and import it from there.',
            },
          ],
        },
      ],
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/common/**/*',
              from: './src/features/**/*',
              message: 'common cannot import from features. The dependency flow is: common → features → routes → setup',
            },
            {
              target: './src/common/**/*',
              from: './src/routes/**/*',
              message: 'common cannot import from routes. The dependency flow is: common → features → routes → setup',
            },
            {
              target: './src/common/**/*',
              from: './src/setup/**/*',
              message: 'common cannot import from setup. The dependency flow is: common → features → routes → setup',
            },
            {
              target: './src/features/**/*',
              from: './src/routes/**/*',
              message: 'features cannot import from routes. The dependency flow is: common → features → routes → setup',
            },
            {
              target: './src/features/**/*',
              from: './src/setup/**/*',
              message: 'features cannot import from setup. The dependency flow is: common → features → routes → setup',
            },
            {
              target: './src/routes/**/*',
              from: './src/setup/**/*',
              message: 'routes cannot import from setup. The dependency flow is: common → features → routes → setup',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
    },
  },
])
