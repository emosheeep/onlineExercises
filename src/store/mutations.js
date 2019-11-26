/**
 * mutations直接修改数据对象state，注意这里的方法必须是同步方法
 */
import type from './mutation-types'

export default {
  // 文件列表
  [type.RECEIVE_FILES] (state, files) {
    files.forEach(item => {
      state.fileList.push(item)
    })
  },
  // 题目数据
  [type.RECEIVE_QUESTION] (state, data) {
    if (data.success) {
      state.questions[data.filename] = data.data
    }
  },
  // 答题数据
  [type.SET_STATE] (state, data) {
    // 先检查题库空间是否存在，不存在先开辟空间
    if (!state.state[data.name]) {
      state.state[data.name] = {}
    }
    state.state[data.name][data.id] = data.answer
    state.state[data.name].sum = data.sum
  }
}
