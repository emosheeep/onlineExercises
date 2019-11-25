<template>
  <el-container>
    <el-aside>
      <el-button v-for="(item, index) in fileList" :key="index"
        @click="switchQuestion(item)">
        {{item}}
      </el-button>
    </el-aside>
    <el-main class="main">
      <question :questions="questions" :name="curListItem"
                :element-loading-text="loadingText"
                v-loading="loading">
      </question>
    </el-main>
  </el-container>
</template>

<script>
import Question from '../components/Question'
import type from '../store/mutation-types.js'
export default {
  name: 'homePage',
  data () {
    return {
      questions: [],
      // 保存题目列表
      fileList: [],
      curListItem: '',
      loading: true,
      loadingText: '请先选择题库'
    }
  },
  methods: {
    // 获取题目数据
    switchQuestion (filename) {
      let _this = this
      // 如果没有变化则退出
      if (filename === this.curListItem) {
        return
      }
      // 如果是首次则直接加载
      if (this.curListItem === '') {
        this.loadingText = ''
        return _this.getData(filename)
      }
      _this.$confirm('确认切换题库？记录将会保存。', '提示', {
        confirmButtonText: '确认切换',
        cancelButtonText: '继续做题',
        type: 'warning'
      }).then(() => {
        _this.loading = true
        _this.getData(filename)
      }).catch(() => {
        // 否则什么都不做
      })
    },
    getData (filename) {
      let _this = this
      _this.$store.dispatch(type.RECEIVE_QUESTION, {
        filename: filename,
        callback: function (data) {
          _this.questions = data
          _this.curListItem = filename
          _this.loading = false
          _this.$message({
            message: '加载成功',
            type: 'success',
            duration: 1500,
            center: true
          })
        }
      })
    }
  },
  components: {
    Question
  },
  mounted () {
    this.fileList = this.$store.state.fileList
  }
}
</script>

<style scoped lang="stylus">
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
  .main
    scrollBar()
    padding-top 0
</style>
