//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    curListItem: '', // 当前选项
    fileList: [],    // 文件列表
    questions: []    // 保存题目
  },
  // 获取题目数据
  changeQuestion (event) {
    let filename = event.target.dataset.filename
    // 如果文件名为空或重复点击当前题库则退出
    if (!filename || filename === this.data.curListItem) {
      return
    }
    // 如果是首次则直接加载
    // if (_this.curListItem === '') {
    //   _this.loadingText = ''
    //   return _this.getData(filename)
    // }
    
    // 请求相应题库
    app.getQuestions(filename, data => {
      this.setData({ questions: data })
      this.setData({ curListItem: filename }) // 设置当前题库名
    })
  },
  onLoad: function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    app.getFileList(fileList => {
      this.setData({ fileList: fileList }, () => {
        wx.hideLoading()
      })
    })
    // wx.showActionSheet({
    //   itemList: ['1','2','3','4','5','6'],
    //   success(res) {
    //     console.log(res.tapIndex)
    //   },
    //   fail(res) {
    //     console.error(res.errMsg)
    //   }
    // })
  },
  getuserinfo (data) {
    console.log(data)
  }
})
