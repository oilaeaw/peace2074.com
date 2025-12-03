// @ts-check
import process from 'node:process'

const nodeMajor = Number(process.versions.node.split('.')[0] || 0)

/* eslint-disable-next-line import/no-mutable-exports */
let config
if (nodeMajor < 20) {
  // Minimal fallback for Node < 20 that supports single-file components (.vue)
  // without importing the full Antfu/Nuxt configs. Dynamically import the
  // parsers so we pass parser objects into languageOptions rather than
  // parser names (flat config expects actual parser objects/functions).
  const vueParserModule = await import('vue-eslint-parser')
  const tsParserModule = await import('@typescript-eslint/parser')
  const vueParser = vueParserModule.default || vueParserModule
  const tsParser = tsParserModule.default || tsParserModule

  // Dynamically import commonly used ESLint plugins so rule definitions are
  // available even in this minimal fallback config.
  const unusedImportsModule = await import('eslint-plugin-unused-imports').catch(() => ({}))
  const importPluginModule = await import('eslint-plugin-import').catch(() => ({}))
  const nodePluginModule = await import('eslint-plugin-node').catch(() => ({}))
  const tsPluginModule = await import('eslint-plugin-ts').catch(() => ({}))
  const tsEslintPluginModule = await import('@typescript-eslint/eslint-plugin').catch(() => ({}))

  const plugins = {
    'unused-imports': unusedImportsModule.default || unusedImportsModule,
    'import': importPluginModule.default || importPluginModule,
    'node': nodePluginModule.default || nodePluginModule,
    // Provide the specific 'no-this-alias' rule under the 'ts' plugin name by
    // delegating to @typescript-eslint's implementation where available.
    'ts': (tsPluginModule.default || tsPluginModule) || {
      rules: {
        'no-this-alias': (tsEslintPluginModule.rules && tsEslintPluginModule.rules['no-this-alias']) || undefined,
      },
    },
    '@typescript-eslint': tsEslintPluginModule.default || tsEslintPluginModule,
  }

  config = [
    // Register plugin definitions so rules referenced by configs are found.
    { plugins },
    // Vue SFCs
    {
      files: ['**/*.vue'],
      languageOptions: {
        parser: vueParser,
        parserOptions: {
          parser: tsParser,
          ecmaVersion: 2020,
          sourceType: 'module',
          extraFileExtensions: ['.vue'],
        },
      },
      rules: {},
    },
    // Plain JS/TS files
    {
      files: ['**/*.{js,cjs,mjs,ts,cts,mts}'],
      languageOptions: {
        parser: tsParser,
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: 'module',
        },
      },
      rules: {},
    },
  ]
}
else {
  // Use dynamic imports so the module resolution of heavy configs only
  // happens on Node >= 20 where plugins are expected to work.
  const antfu = (await import('@antfu/eslint-config')).default
  const nuxt = (await import('./.nuxt/eslint.config.mjs')).default
  config = nuxt(
    antfu({
      unocss: true,
      formatters: true,
    }),
  )
}

// Ensure generated files and type declarations are ignored by ESLint's flat config.
// The old `.eslintignore` file is deprecated for flat config; use `ignores` here.
const ignoreGlobs = [
  '.nuxt/**',
  '.output/**',
  '.netlify/**',
  '--port/.nuxt/**',
  'types/**',
    'public/**',
    'node_modules/**',
    // Don't attempt to lint the ESLint config itself (uses top-level await)
    'eslint.config.js',
    // Ignore various TS/decl artifacts that are handled by the build
    '**/*.d.ts',
]

if (!Array.isArray(config)) {
  config = [config]
}

config = [
  { ignores: ignoreGlobs },
  ...config,
]

export default config
