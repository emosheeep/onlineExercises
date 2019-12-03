// components/question/question.js
const app = getApp()

Component({
  behaviors: [require('miniprogram-computed')],
  /**
   * 组件的属性列表
   */
  properties: {
    name: String,
    questions: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false,
    animation: {},        // 显示答题卡
    answered: false,    // 题目是否已经答过
    answer: ['A', 'B', 'C', 'D'],
    current: {          // 保存当前题目
      id: 1,
      title: '正在加载...',
      list: ['loading', 'loading', 'loading', 'loading'],
      answer: ''
    },
    myAns: [], // 记录我的当前答案
    curStyle: {}, // 控制答题正误样式
    curSum: {     // 当前题库答题情况
      rightSum: 0,
      wrongSum: 0
    },
    curState: {},
    iterator: null, // 保存迭代器
  },
  watch: {
    // 将外部传入的题目保存到内部变量中，传入题目后触发操作
    questions (newVal) {
      // 过滤首次
      if (!Array.isArray(newVal) || newVal.length ===0) {
        return
      }
      this.setData({ iterator: this.iterator() })
      this.data.iterator.first() // 初始化题目
      this.initAnswerSheet()     // 初始化答题数据
    },
    current (newVal) {
      this.setData({ curStyle: {} }) // 重置颜色和设置颜色要分开写，否则会造成数据与视图不一致
      this.setData({ answered: this.checkState(newVal.id) })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    judge(event) {
      if (this.properties.questions.length === 0 || !this.iterator) {
        return
      }
      let answer = this.data.answer[event.target.dataset.index]
      // 如果题目已经答过或者当前元素不是target
      if (this.data.answered || !answer) {
        return
      }
      this.setState(answer) // 设置答题状态
      this.setData({ answered: true })// 表示当前题目已经做过了
      this.commitState() // 提交状态
    },
    /**
     *answer 传入正确答案，设置所有题目状态
     */
    setState(answer) {
      let _this = this
      let status = _this.setColor(answer, _this.data.current.answer)
      if (status) { // 设置正误数量
        _this.setData({ ['curSum.rightSum']: _this.data.curSum.rightSum + 1})
      } else {
        _this.setData({ ['curSum.wrongSum']: _this.data.curSum.wrongSum + 1 })
      }
       // 设置答题卡和当前答题状态
      _this.setData({
        ['curState.' + _this.data.current.id]: answer,
        ['myAns[' + _this.data.iterator.getIndex() + ']']: answer
      })
      if (status) { // 自动切换题目
        setTimeout(() => {
          _this.data.iterator.next()
        }, 300)
      }
    },
    /**
     * 设置答案
     * @param answer  我的答案
     * @param rightAns   正确答案
     */
    setColor(answer, rightAns) {
      if (rightAns === answer) {
        this.setData({['curStyle.' + answer]: 'success'})
        return true // 表示答对了
      } else {
        // 如果答错则标出我的答案和正确答案
        this.setData({
          ['curStyle.' + answer]: 'failed',
          ['curStyle.' + rightAns]: 'success'
        })
        return false
      }
    },
    // 清除本地状态
    clearState() {
      this.setData({
        ['curSum.rightSum']: 0,
        ['curSum.wrongSum']: 0,
        curState: {},
        curStyle: {},
        myAns: [],
        answered: false
      })
    },
    /**
     * 提交状态信息
     * flag：是否重置状态
     */
    commitState(flag = false) {
      let _this = this
      // flag为true则清除状态
      let options = {
        ..._this.data.curSum,
        state: _this.data.curState
      }
      if (flag) {
        _this.clearState()
        options = {}
      }
      app.globalData.quesState[_this.properties.name] = options
    },
    // 前后题目切换按钮
    switchQuestion(event) {
      let type = event.target.id
      if (this.properties.questions.length === 0 || !this.data.iterator) {
        return
      }
      switch (type) {
        case 'preBtn':
          this.data.iterator.pre()
          break
        case 'nextBtn':
          this.data.iterator.next()
          break
      }
    },
    // 点击答题卡，切换到相应题目
    switchAnswerSheet(event) {
      // 获取文本节点内容
      let quesId = event.target.dataset.id
      if (!quesId) {
        return
      }
      this.data.iterator.get(parseInt(quesId) - 1) // 利用迭代器切换当前题目
      wx.pageScrollTo({ // 滚到顶部
        scrollTop: 0,
        duration: 300
      })
    },
    // 检查当前题目是否做过
    checkState(quesId) {
      // 保存当前题库题目状态对象
      let data = app.globalData.quesState[this.properties.name]
      // 如果当前题库有记录,且当前题库有做题记录
      if (data && data.state[quesId]) {
        // 判断正误
        this.setColor(data.state[quesId], this.data.current.answer)
        return true // 设置题目状态为未答
      } else return false
    },
    // 初始化答题数据
    initAnswerSheet() {
      let record = app.globalData.quesState[this.properties.name]
      this.clearState() // 清空所有临时状态
      if (record && record.state) {
        // 根据已有答题数据对应设置答题卡
        Object.keys(record.state).forEach((id) => {
          this.setData({
            ['myAns['+(id - 1)+']']: record.state[id]
          })
        })
      }
      // 重置正误数量
      this.setData({
        'curSum.rightSum': record && record.rightSum ? record.rightSum : 0,
        'curSum.wrongSum': record && record.wrongSum ? record.wrongSum : 0
      })
    },
    reWork() {
      let _this = this
      if (_this.properties.questions.length === 0 || !_this.data.iterator) {
        return
      }
      wx.showModal({
        title: '警告',
        content: '您确认重做？该操作不可逆',
        confirmText: '确认重做',
        cancelText: '继续做题',
        success(res) {
          if (res.confirm) {
            _this.clearState()
            _this.data.iterator.get(0)
            _this.commitState(true) // 提交并清除所有答题数据
            wx.showToast({
              title: '已重置',
              icon: 'success',
              duration: 1100
            })
          }
        }
      })
    },
    // 创建迭代器，所有题目的切换都要用到这个
    iterator () {
      let index = 0
      let _this = this
      let questions = _this.properties.questions
      return {
        first() {
          index = 0 // 矫正当前索引和当前题目,矫正要放在前面
          _this.setData({ current: questions[index] }) 
        },
        pre() {
          if (--index >= 0) { // 如果索引值大于等于零获取相应元素
            _this.setData({ current: questions[index] }) 
          } else {
            index = 0 // 矫正索引
          }
        },
        next() {
          if (++index < questions.length) { // 如果索引在范围内就获取元素
            _this.setData({ current: questions[index] }) 
          } else {
            index = questions.length - 1 // 矫正index
          }
        },
        get(num) {
          if (num >= 0 && num < questions.length) {
            index = num // 矫正index,注意先后顺序
            _this.setData({ current: questions[index] }) 
          }
        },
        getIndex() {
          return index
        }
      }
    },
    showAnswerSheet () {
      let _this = this
      // 过滤
      if (_this.properties.questions.length === 0 || !_this.data.iterator) {
        return
      }
      let animation = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease',
        transformOrigin: '50% 0 0'
      })
      // toggle效果
      if (!_this.data.show) {
        animation.scaleY(1).height('auto').step()
        _this.setData({
          animation: animation.export(),
          show: true
        })
      } else {
        animation.scaleY(0).height(0).step()
        _this.setData({
          animation: animation.export(),
          show: false
        })
      }
    }
  }
})
