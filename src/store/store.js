import { createStore } from 'vuex'

export default createStore({
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