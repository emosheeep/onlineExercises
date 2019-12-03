//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    curListItem: '点击这里选择题库', // 当前选项
    fileList: [],    // 文件列表
    questions: [],   // 保存题目
    animation: {}    // 保存动画
  },
  // 获取题目数据
  changeQuestion (event) {
    let _this = this
    let filename = _this.data.fileList[event.detail.value]
    // 如果文件名为空或重复点击当前题库则退出
    if (!filename || filename === _this.data.curListItem) {
      return
    }
    // 如果是首次则直接加载
    if (_this.data.curListItem === '点击这里选择题库') {
      return _this.getQuestions(filename)
    }
    // 否则提示
    wx.showModal({
      title: '提示',
      content: '确认切换题库？答题记录会保存',
      confirmText: '确认切换',
      cancelText: '继续做题',
      success (res) {
        if (res.confirm){
          _this.getQuestions(filename)
        }
      }
    })
    
  },
  // 请求相应题库
  getQuestions (filename) {
    let _this = this
    wx.getNetworkType({
      success(res) {
        if (res.networkType === 'none') {
          // 暂无网络连接
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          })
        } else {
          // 网络连接正常
          app.getQuestions(filename, data => {
            _this.setData({
              questions: data,
              curListItem: filename // 设置当前题库名
            }, _this.setAnimation) // 调用动画显示
          })
        }
      },
      fail() {
        wx.showToast({
          title: '网络错误，请刷新页面',
          icon: 'none'
        })
      }
    })
  },
  // 获取并设置文件列表，然后取消loading状态
  getFileList () {
    app.getFileList(fileList => {
      this.setData({ fileList: fileList }, () => {
        wx.hideLoading()
      })
    })
  },
  // 创建并设置动画
  setAnimation () {
    let animation = wx.createAnimation({
      duration: 1200,
      timingFunction: 'ease'
    })
    animation.translateX(0).step()
    this.setData({ animation: animation.export() })
  },
  onLoad: function () {
    let _this = this
    // 在获取数据前禁止用户操作，loading状态在this.getFileList()中取消
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    _this.getFileList()
  }
})
