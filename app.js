//app.js
App({
  globalData: {
    fileList: [],   // 保存文件列表
    quesState: {},  // 保存答题状态
    questions: {}   // 保存题目
  },
  getFileList (callback) {
    let _this = this
    wx.request({
      url: 'http://www.biubiubius.com:3000/files',
      success (res) {
        let data = res.data
        if (data instanceof Array) {
          let files = data.map(item => {
            // 去除文件后缀名
            return item.slice(0, item.indexOf('.'))
          })
          _this.globalData.fileList = files
          callback && callback(files)
        }
      },
      fail(err) {
        console.log(err)
      }
    })
  },
  getQuestions (filename, callback = null) {
    let _this = this
    let data = _this.globalData.questions[filename]
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    if (data) {
      // 如果存在数据则直接返回
      callback && callback(data)
      return wx.hideLoading()
    }
    wx.request({
      url: 'http://www.biubiubius.com:3000/question',
      method: 'POST',
      data: {
        filename: filename
      },
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      success (res) {
        let data = res.data
        if (data.success) {
          _this.globalData.questions[data.filename] = data.data
          wx.hideLoading()
          callback && callback(data.data)
        } else {
          console.error(data)
        }
      },
      fail (err) {
        console.log(err)
      }
    })
  }
})