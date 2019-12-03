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
    console.log(event)
    let filename = this.data.fileList[event.detail.value]
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
      this.setData({
        questions: data,
        curListItem: filename // 设置当前题库名
      })
    })
  },
  // 获取并设置文件列表，然后取消loading状态
  getFiles () {
    app.getFileList(fileList => {
      this.setData({ fileList: fileList }, () => {
        wx.hideLoading()
      })
    })
  },
  // 监听网络变化
  listenNet (res) {
    if (!res.isConnected) {
      console.error("暂无网络连接")
      return
    }
    this.getFiles() // 获取文件
    wx.offNetworkStatusChange(this.listenNet) // 取消网络状态监听
  },
  onLoad: function () {
    let _this = this
    // 在获取数据前禁止用户操作，loading状态在this.getFileList()中取消
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.getNetworkType({
      success (res) {
        if (res.networkType === 'none') {
          // 暂无网络连接，添加状态监听
          wx.onNetworkStatusChange(_this.listenNet)
        } else {
          _this.getFiles()
        }
      },
      fail () {
        console.log("获取网络状态失败!")
        setTimeout(_this.onLoad, 3000)
      }
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
  }
})
