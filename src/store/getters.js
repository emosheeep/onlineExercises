export default {
  getQuestion (state) {
    return function (filename) {
      return state.questions[filename] || null
    }
  },
  getState (state) {
    return function (name) {
      return state.state[name]
    }
  }
}
