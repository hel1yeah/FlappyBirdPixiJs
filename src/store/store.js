import { createStore } from 'vuex'
import Cookies from 'js-cookie'

const HISTORY_KEY = 'score_history'
const MAX_HISTORY = 10

function getHistory() {
  try {
    return JSON.parse(Cookies.get(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

function saveHistory(history) {
  Cookies.set(HISTORY_KEY, JSON.stringify(history), { expires: 365 })
}

export default createStore({
  state: {
    lastScore: 0,
    isNewRecord: false,
    scoreHistory: getHistory(),
  },
  mutations: {
    setLastScore(state, { score, isNew }) {
      state.lastScore = score;
      state.isNewRecord = isNew;
    },
    setHistory(state, history) {
      state.scoreHistory = history;
    },
  },
  actions: {
    setScore({ commit }, payload) {
      const record = parseInt(localStorage.getItem('record') || '0', 10);
      const isNew = payload > record;
      if (isNew) {
        localStorage.setItem('record', payload);
      }
      commit('setLastScore', { score: payload, isNew });

      // Save to history
      const history = getHistory();
      history.unshift({ score: payload, date: new Date().toLocaleDateString() });
      if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
      saveHistory(history);
      commit('setHistory', history);
    },
  },
})
