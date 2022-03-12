import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    record: 0,
  },
  mutations: {
    setScoreSuccess(state, payload) {
      state.record = payload
    }
  },
  actions: {
    setScore({ commit }, payload) {
      const record = localStorage.getItem('record')
      if (!record) {
        localStorage.setItem('record', payload)
      } else {
        if (record < payload) {
          localStorage.setItem('record', payload)
        }
      }
      
      // localStorage.setItem('')
    }
  },
})