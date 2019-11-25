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
          :class="curState[answer[index]]">
        {{item}}
      </li>
    </ol>
    <el-footer class="default">
      <el-row class="footer" :gutter="20">
        <el-col :span="10">
          <el-button @click="iterator.pre()">上一题</el-button>
          <el-button @click="iterator.next()">下一题</el-button>
        </el-col>
        <el-col :span="8" id="score">
          <el-badge :value="rightSum" type="success"></el-badge>
          <el-badge :value="wrongSum"></el-badge>
        </el-col>
        <el-col :span="6">
          <el-button plain type="primary">显示答题卡</el-button>
        </el-col>
      </el-row>
    </el-footer>
  </el-container>
</template>

<script>
export default {
  name: 'Question',
  props: {
    questions: Array
  },
  data () {
    return {
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
      // 答题正误样式
      curState: {
        A: '',
        B: '',
        C: '',
        D: ''
      },
      // 正误数量
      rightSum: 0,
      wrongSum: 0
    }
  },
  computed: {
    // 创建迭代器，方便题目切换
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
        }
      }
    }
  },
  methods: {
    judge (event) {
      let index = event.target.getAttribute('index')
      // 如果题目已经答过或者当前元素不是选项
      if (this.Answered || !index) {
        return
      }
      let answer = this.answer[index] // 我的答案
      this.Answered = true // 表示当前题目已经做过了
      let status = this.setColor(answer, this.current.answer)
      if (status) { // 设置正误数量
        this.rightSum++
      } else this.wrongSum++
    },
    /**
     * 设置答案
     * @param answer  我的答案
     * @param rightAns   正确答案
     */
    setColor (answer, rightAns) {
      if (this.current.answer === answer) {
        this.$set(this.curState, answer, 'success')
        return true // 表示答对了
      } else {
        // 如果答错则标出我的答案和正确答案
        this.$set(this.curState, answer, 'failed')
        this.$set(this.curState, rightAns, 'success')
        return false
      }
    },
    leave (newVal, oldVal) {
      this.$confirm('还没做完，确认切换？题目记录将会保存。', '提示', {
        confirmButtonText: '确认切换',
        cancelButtonText: '继续做题',
        type: 'warning'
      }).then(() => {
        this.current = newVal // 切换题目
        this.$message({
          message: '切换成功',
          type: 'success',
          duration: 1500,
          center: true
        })
        // 重置正误数量
        this.rightSum = 0
        this.wrongSum = 0
      }).catch(() => {
        // 否则将localQuestion重置为之前的值，否则之后点击切换题目将不会触发监听
        // this.localQuestions = oldVal
      })
    }
  },
  watch: {
    // 监听外部数据变化，有数据传入时初始化
    questions (newVal) {
      this.current = newVal[0]
      // 重置正误数量
      this.rightSum = 0
      this.wrongSum = 0
    },
    // 题目变化时自定设置答题状态，并清空颜色
    current () {
      this.curState = {}
      this.Answered = false
    }
  }
}
</script>

<style scoped lang="stylus">
  $grey = rgb(245,245,245)
  $green = rgb(223,240,216)
  $red = rgb(242,222,222)
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
  #score
    display inline-block
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
  #score div
    margin 0 15px
  /*答题正误样式*/
  .default
    background-color $grey
  .success
    background-color $green!important
  .failed
    background-color $red!important
  .active
    background-color lightblue!important
</style>
