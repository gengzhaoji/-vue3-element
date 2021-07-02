import store from '@/store'

export default {
  state: {
    size: 'small',
    token: '',
  },

  mutations: {
    SET_SIZE: (state, size) => {
      state.size = size
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    }
  },

  actions: {

  }
}

