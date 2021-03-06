const tsconfig = require('tsconfig')
const cache = require('./cache')
const logger = require('./logger')
const getVueJestConfig = require('./get-vue-jest-config')

const defaultTypescriptConfig = {
  compilerOptions: {
    target: 'es5',
    lib: ['dom', 'es6'],
    module: 'es2015',
    moduleResolution: 'node',
    types: ['vue-typescript-import-dts', 'jest', 'node'],
    isolatedModules: false,
    experimentalDecorators: true,
    noImplicitAny: true,
    noImplicitThis: true,
    strictNullChecks: true,
    removeComments: true,
    emitDecoratorMetadata: true,
    suppressImplicitAnyIndexErrors: true,
    allowSyntheticDefaultImports: true,
    sourceMap: true,
    allowJs: true
  }
}

module.exports.loadTypescriptConfig = function loadTypescriptConfig(config) {
  const vueJestConfig = getVueJestConfig(config)

  const find = () => {
    const { path, config } = tsconfig.loadSync(process.cwd())

    if (!path) {
      logger.info(
        'no tsconfig.json found, defaulting to default typescript options'
      )
    }

    return path ? config : defaultTypescriptConfig
  }
  const cachedConfig = cache.get('typescript-config')
  if (cachedConfig) {
    return cachedConfig
  } else {
    let typescriptConfig

    if (vueJestConfig.hasOwnProperty('tsConfig')) {
      switch (typeof vueJestConfig.tsConfig) {
        case 'string':
          // a path to a config file is being passed in; load it
          typescriptConfig = require(vueJestConfig.tsConfig)
          break
        case 'boolean':
          // if tsConfig is true, search for it
          if (vueJestConfig.tsConfig === true) {
            typescriptConfig = find()
          } else {
            // use default typescript options
            typescriptConfig = defaultTypescriptConfig
          }
          break
        case 'object':
        default:
          // support for inline typescript options
          typescriptConfig = vueJestConfig.tsConfig
          break
      }
    } else {
      typescriptConfig = find()
    }

    cache.set('typescript-config', typescriptConfig)
    return typescriptConfig
  }
}

module.exports.defaultConfig = defaultTypescriptConfig
