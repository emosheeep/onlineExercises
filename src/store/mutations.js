/**
 * mutations直接修改数据对象state，注意这里的方法必须是同步方法
 */
import type from './mutation-types'

export default {
  [type.RECEIVE_FILES] (state, files) {
    files.forEach(item => {
      state.fileList.push(item)
    })
  },
  [type.RECEIVE_QUESTION] (state, data) {
    if (data.success) {
      state.questions[data.filename] = data.data
    }
  }
}
