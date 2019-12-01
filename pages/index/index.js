//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    curListItem: '', // 当前选项
    fileList: [],    // 文件列表
    questions: []    // 保存题目
  },
  changeQuestion: function(event) {
    let filename = event.target.dataset.filename
    if (!filename) {
      return
    }
    this.setData({ curListItem: filename })
    // 请求相应题库
    app.getQuestions(filename, data => {
      this.setData({questions: data})
      console.log(this.data)
    })
  },
  onLoad: function () {
    app.getFileList(fileList => {
      this.setData({ fileList: fileList })
      console.log(this.data.fileList)
    })
  }
})
