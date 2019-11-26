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
      <el-row class="footer" :gutter="20">
        <el-col :span="10">
          <el-button-group>
            <el-button icon="el-icon-arrow-left" @click="iterator.pre()">上一题</el-button>
            <el-button @click="iterator.next()">下一题<i class="el-icon-arrow-right el-icon--right"></i></el-button>
          </el-button-group>
        </el-col>
        <el-col :span="4" id="score">
          <el-badge :value="curSum.rightSum" type="success"></el-badge>
          <el-badge :value="curSum.wrongSum"></el-badge>
        </el-col>
        <el-col :span="10">
          <el-button type="warning" plain icon="el-icon-refresh-right">重做</el-button>
          <el-button type="primary" plain @click="drawer = true">显示答题卡</el-button>
        </el-col>
      </el-row>
    </el-footer>
    <el-drawer direction="rtl" size="313px" :visible.sync="drawer" :title="name">
      <div id="answerSheet" @click="switchQuestion">
        <div v-for="(item, index) in this.questions"
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
      curStyle: {
        A: '',
        B: '',
        C: '',
        D: ''
      },
      // 当前题库答题正误数量
      curSum: {
        rightSum: 0,
        wrongSum: 0
      }
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
    }
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
      // 提交答题状态
      _this.$store.commit(type.SET_STATE, {
        name: _this.name, // 当前题库名
        sum: {
          rightSum: _this.curSum.rightSum,
          wrongSum: _this.curSum.wrongSum
        },
        id: _this.current.id,
        answer: answer
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
      let data = this.$store.getters.getState(this.name)
      // 如果当前题库有记录,且当前题目也有记录
      if (data && data[quesId]) {
        // 判断正误
        this.setColor(data[quesId], this.current.answer)
        return true // 设置题目状态为未答
      } else return false
    },
    // 初始化答题卡数据
    initAnswerSheet () {
      let record = this.$store.getters.getState(this.name)
      let sum = record && record.sum
      // 重置正误数量
      this.curSum.rightSum = sum ? sum.rightSum : 0
      this.curSum.wrongSum = sum ? sum.wrongSum : 0
      // 设置答题卡
      if (record) {
        // 删除不必要的属性，防止设置答题卡出错
        record.sum && delete record.sum
        // 根据已有答题数据对应设置答题卡
        Object.keys(record).forEach((id, index) => {
          this.$set(this.myAns, index, record[id])
        })
      } else {
        this.myAns.splice(0)
      }
    }
  },
  watch: {
    // 监听外部数据变化，有题目传入时初始化
    questions () {
      this.iterator.first() // 注意不能直接修改current，会破坏索引秩序
      this.initAnswerSheet()
    },
    // 题目变化时自定设置答题状态
    current (newVal) {
      this.curStyle = {}
      // 检查当前题目是否做过
      this.Answered = this.checkState(newVal.id)
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
    height inherit
    line-height 60px
  #questionBox
    width 600px
    min-width 350px
    min-height 350px
    border-radius 5px
    border 2px $grey solid
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
    background-color lightblue
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
</style>
