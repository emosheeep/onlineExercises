/**
 * 通过mutations间接更新state，这里的方法可以是异步的
 */
import {
  getFileList, getQuestions
} from '../api/api.js'
import methods from './mutation-types'

export default {
  // 获取文件列表
  [methods.RECEIVE_FILES] ({commit}) {
    getFileList().then(data => {
      if (data instanceof Array) {
        let files = data.map(item => {
          // 去除文件后缀名
          return item.slice(0, item.indexOf('.'))
        })
        commit(methods.RECEIVE_FILES, files)
      }
    }).catch(err => console.log(err))
  },
  // 获取题库题目
  [methods.RECEIVE_QUESTION] ({commit}, filename) {
    getQuestions(filename).then(data => {
      commit(methods.RECEIVE_QUESTION, data)
    }).catch(err => console.log(err))
  }
}
