<template>
  <el-container id="questionBox">
    <el-header class="el-header default">
      <div>
        <span id="quesId">{{current.id}}</span>
        <span id="title">{{current.title}}</span>
      </div>
    </el-header>
    <ol id="list" @click.capture="judge">
      <li v-for="(item, index) in current.list" :key="index"
          :index="index"
          :class="curStyle[answer[index]]">
        {{item}}
      </li>
    </ol>
    <el-footer class="default">
      <el-row class="footer">
        <el-col :span="10" :xs="16">
          <el-button-group>
            <el-button icon="el-icon-arrow-left" @click="iterator.pre()">上一题</el-button>
            <el-button @click="iterator.next()">下一题<i class="el-icon-arrow-right el-icon--right"></i></el-button>
          </el-button-group>
        </el-col>
        <el-col id="score" :span="4" :xs="8" :sm="4">
          <el-badge :value="curSum.rightSum" type="success"></el-badge>
          <el-badge :value="curSum.wrongSum"></el-badge>
        </el-col>
        <el-col :span="10" :xs="18">
          <el-button type="warning" plain
                     icon="el-icon-refresh-right"
                     @click="reWork">重做</el-button>
          <el-button type="primary" plain icon="el-icon-tickets"
                     @click="drawer = true">答题卡</el-button>
        </el-col>
      </el-row>
    </el-footer>
    <el-drawer direction="rtl" size="313px" :visible.sync="drawer" :title="name">
      <div id="answerSheet" @click="switchQuestion">
        <div v-for="(item, index) in questions"
             :class="[
              {active: item.id === current.id},
              myAns[index] === item.answer ? 'success': '',
              myAns[index] && myAns[index] !== item.answer ? 'failed': ''
             ]"
             :key="index">
          {{item.id}}
        </div>
      </div>
    </el-drawer>
  </el-container>
</template>

<script>
import type from '../store/mutation-types'
import {mapState} from 'vuex'
export default {
  name: 'Question',
  props: {
    questions: Array,
    name: String
  },
  data () {
    return {
      // 控制答题卡的显示
      drawer: false,
      answer: ['A', 'B', 'C', 'D'],
      // 题目是否已经答过
      Answered: false,
      // 保存当前题目
      current: {
        id: 1,
        title: '正在加载...',
        list: [],
        answer: ''
      },
      myAns: [], // 记录我的当前答案
      // 控制答题正误样式
      curStyle: {},
      // 当前题库答题情况
      curSum: {
        rightSum: 0,
        wrongSum: 0
      },
      curState: {}
    }
  },
  computed: {
    // 创建迭代器，所有题目的切换都要用到这个
    iterator () {
      let index = 0
      let _this = this
      return {
        first () {
          index = 0 // 矫正当前索引和当前题目,矫正要放在前面
          _this.current = _this.questions[index]
        },
        pre () {
          if (--index >= 0) { // 如果索引值大于等于零获取相应元素
            _this.current = _this.questions[index]
          } else {
            index = 0 // 矫正索引
          }
        },
        next () {
          if (++index < _this.questions.length) { // 如果索引在范围内就获取元素
            _this.current = _this.questions[index]
          } else {
            index = _this.questions.length - 1 // 矫正index
          }
        },
        get (num) {
          if (num >= 0 && num < _this.questions.length) {
            index = num // 矫正index,注意先后顺序
            _this.current = _this.questions[index]
          }
        },
        getIndex () {
          return index
        }
      }
    },
    ...mapState({
      getState: state => {
        return function (name) {
          return state.quesState[name]
        }
      }
    })
  },
  methods: {
    judge (event) {
      let _this = this
      let index = event.target.getAttribute('index')
      // 如果题目已经答过或者当前元素不是选项
      if (_this.Answered || !index) {
        return
      }
      let answer = this.answer[index]
      // 设置我的答案,使用Vue可以监听到的方式
      _this.$set(_this.myAns, _this.iterator.getIndex(), answer)
      _this.Answered = true // 表示当前题目已经做过了
      let status = _this.setColor(answer, _this.current.answer)
      if (status) { // 设置正误数量
        setTimeout(() => {
          _this.iterator.next()
        }, 300)
        _this.curSum.rightSum++
      } else _this.curSum.wrongSum++
      // 提交组件内的答题状态
      _this.$set(_this.curState, this.current.id, answer)
    },
    // vuex提交状态信息,参数：是否重置状态
    commitState (flag = false) {
      let _this = this
      // flag为true则清除状态
      if (flag) {
        _this.curSum.rightSum = 0
        _this.curSum.wrongSum = 0
        _this.curState = {}
        _this.curStyle = {}
      }
      _this.$store.commit(type.SET_STATE, {
        name: _this.name, // 当前题库名
        data: {
          ..._this.curSum,
          state: _this.curState
        }
      })
    },
    /**
     * 设置答案
     * @param answer  我的答案
     * @param rightAns   正确答案
     */
    setColor (answer, rightAns) {
      if (this.current.answer === answer) {
        this.$set(this.curStyle, answer, 'success')
        return true // 表示答对了
      } else {
        // 如果答错则标出我的答案和正确答案
        this.$set(this.curStyle, answer, 'failed')
        this.$set(this.curStyle, rightAns, 'success')
        return false
      }
    },
    // 点击答题卡，切换到相应题目
    switchQuestion (event) {
      // 获取文本节点内容
      let quesId = event.target.firstChild.nodeValue
      if (!quesId) {
        return
      }
      this.drawer = false // 关闭答题卡
      this.iterator.get(parseInt(quesId) - 1) // 利用迭代器切换当前题目
    },
    // 检查当前题目是否做过
    checkState (quesId) {
      // 保存当前题库题目状态对象
      let data = this.getState(this.name)
      // 如果当前题库有记录,且当前题库有做题记录
      if (data && data.state[quesId]) {
        // 判断正误
        this.setColor(data.state[quesId], this.current.answer)
        return true // 设置题目状态为未答
      } else return false
    },
    // 初始化答题数据
    initAnswerSheet () {
      let record = this.getState(this.name)
      if (record && record.state) {
        // 根据已有答题数据对应设置答题卡
        Object.keys(record.state).forEach((id) => {
          this.$set(this.myAns, id - 1, record.state[id])
        })
      } else {
        // 否则将已有答题卡记录清空
        this.myAns.splice(0)
      }
      // 重置正误数量
      this.curSum.rightSum = record && record.rightSum ? record.rightSum : 0
      this.curSum.wrongSum = record && record.wrongSum ? record.wrongSum : 0
    },
    reWork () {
      let _this = this
      _this.$msgbox({
        title: '警告',
        type: 'warning',
        message: _this.$createElement(
          'p',
          {style: 'fontSize: 18px'},
          '您确认重做当前题库嘛？该操作是不可逆的'
        ),
        showCancelButton: true,
        confirmButtonText: '确认重做',
        cancelButtonText: '取消'
      }).then(() => {
        _this.iterator.get(0)
        _this.myAns.splice(0)
        _this.commitState(true) // 提交并清除答题数据
        _this.$message({
          type: 'info',
          message: '已重置',
          duration: 1200
        })
      }).catch(() => {})
    }
  },
  watch: {
    // 监听外部数据变化，监控题库的切换
    questions () {
      this.iterator.first() // 注意不能直接修改current，会破坏索引秩序
      this.initAnswerSheet()
    },
    // 题目变化时自定设置答题状态
    current (newVal) {
      this.curStyle = {}
      // 检查当前题目是否做过
      this.Answered = this.checkState(newVal.id)
    },
    // 答题状态变化则提交mutations
    curState () {
      this.commitState() // vuex
    }
  }
}
</script>

<style scoped lang="stylus">
  $grey = rgb(245,245,245)
  $green = rgb(223,240,216)
  $red = rgb(242,222,222)
  scrollBar()
    overflow auto
    &::-webkit-scrollbar-button
      display none
    &::-webkit-scrollbar-thumb
      border-radius 5px
      background-color rgba(168,168,168, 0.5)
    &::-webkit-scrollbar-thumb:hover
      background-color rgba(168,168,168, 0.8)
    &::-webkit-scrollbar
      height 7px
      width 7px
      border-radius 5px
      background-color rgba(231,234,237, 0.5)
  .el-header
    padding 10px 15px
    font-size 18px
    height auto!important
  .footer
    height auto
    line-height 60px
  #questionBox
    width 100%
    margin 0 auto
    min-width 350px
    min-height 350px
    border 1px $grey solid
    text-align left
    display flex
    flex-direction column
    justify-content space-between
  ol#list
    padding 10px
    font-size 18px
    height 100%
    display flex
    flex-grow 1
    flex-direction column
    justify-content space-between
    & li
      padding-left 5px
      cursor pointer
      line-height 40px
      border-radius 5px
      &:hover
        background-color $grey
      &:nth-child(1)::before
        content "A. "
      &:nth-child(2)::before
        content "B. "
      &:nth-child(3)::before
        content "C. "
      &:nth-child(4)::before
        content "D. "
  #quesId::after
    content ". "
  #score
    display inline-block
    div
      margin 0 7px
  /*答题正误样式*/
  .default
    background-color $grey
  .success
    background-color $green!important
  .failed
    background-color $red!important
  .active
    background-color lightblue !important
  #answerSheet
    margin 0
    display flex
    flex-wrap wrap
    height inherit
    width inherit
    border-radius 3px 0 0 3px
    & div
      height: 30px
      width: 30px
      line-height 30px
      text-align center
      cursor pointer
      outline 1px solid rgb(245,245,245)
      &:hover
        background-color rgb(217,237,247)
  >>> .el-footer
    height auto !important
  >>> #el-drawer__title
    font-size 18px
  >>> .el-drawer__body
    border 1px rgb(221,221,221) solid
    overflow auto
    &::-webkit-scrollbar-button
      display none
    &::-webkit-scrollbar-thumb
      border-radius 5px
      background-color rgba(168,168,168, 0.5)
    &::-webkit-scrollbar-thumb:hover
      background-color rgba(168,168,168, 0.8)
    &::-webkit-scrollbar
      height 7px
      width 7px
      border-radius 5px
      background-color rgba(231,234,237, 0.5)
    &::-webkit-scrollbar-track
      border-radius 5px
  #questionBox
    margin-top 1px
    width 600px
    outline 1px solid rgb(221, 221, 221)
  @media (max-width: 500px)
    #questionBox
      width auto
      flex-grow 1
</style>
