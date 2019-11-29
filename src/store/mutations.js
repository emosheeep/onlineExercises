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
    // 如果不存在对应数据项目，则开辟空间
    if (!state.quesState[data.name]) {
      state.quesState[data.name] = {}
    }
    // 收到重置信号，则清空
    if (data.reset) {
      state.quesState[data.name] = {}
      return
    }
    // 更新quesState内容
    state.quesState[data.name] = data.data
  }
}
