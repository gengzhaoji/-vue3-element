import { createStore } from 'vuex'
import VuexPersistence from 'vuex-persistedstate'
import getters from './getters'

const modulesFiles = require.context('./modules', true, /\.js$/);
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = modulesFiles(modulePath)
  modules[moduleName] = value.default
  return modules
}, {})

export default createStore({
  modules,
  getters,
  plugins: [
    VuexPersistence({
      storage: window.localStorage,
      // 配置缓存的内容
      reducer(val) {
        return {
          user: {
            size: val.user.size,
            token: val.user.token,
          }
        }
      }
    })
  ]
})
