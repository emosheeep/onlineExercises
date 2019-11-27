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
    this._vm.$set(state.quesState, data.name, data.data)
  }
}
