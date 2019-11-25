/**
 * 通过mutations间接更新state，这里的方法可以是异步的
 */
import {
  getFileList, getQuestions
} from '../api/api.js'
import type from './mutation-types'

export default {
  // 获取文件列表
  [type.RECEIVE_FILES] ({commit}) {
    getFileList().then(data => {
      if (data instanceof Array) {
        let files = data.map(item => {
          // 去除文件后缀名
          return item.slice(0, item.indexOf('.'))
        })
        commit(type.RECEIVE_FILES, files)
      }
    }).catch(err => console.log(err))
  },
  // 获取题库题目
  [type.RECEIVE_QUESTION] ({commit, getters}, {filename, callback}) {
    let result = getters.getQuestion(filename)
    // 如果题库没有数据则请求数据
    if (!result) {
      getQuestions(filename).then(data => {
        commit(type.RECEIVE_QUESTION, data) // 先提交内容
        callback(getters.getQuestion(filename)) // 回调函数传入数据，数据利用getters获得
      }).catch(err => console.log(err))
    } else return callback(result)
  }
}
