<template>
  <el-container>
    <el-aside class="side" v-loading="listLoading"
              :element-loading-text="listLoadingText">
      <ul id="toLoad">
        <li v-for="(item, index) in fileList" :key="index"
            :class="{active: item === curListItem}"
            @click="switchQuestion(item)">
          {{item}}
        </li>
      </ul>
    </el-aside>
    <el-main class="main">
      <question :questions="questions" :name="curListItem"
                element-loading-spinner="none"
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
      loadingText: '请先选择题库',
      listLoading: true,
      listLoadingText: '正在加载, 请稍等...',
      curIndex: null
    }
  },
  methods: {
    // 获取题目数据
    switchQuestion (filename) {
      let _this = this
      // 如果没有变化则退出
      if (filename === _this.curListItem) {
        return
      }
      // 如果是首次则直接加载
      if (_this.curListItem === '') {
        _this.loadingText = ''
        return _this.getData(filename)
      }
      _this.$msgbox({
        title: '提示',
        type: 'warning',
        message: _this.$createElement(
          'p',
          {style: 'fontSize: 18px'},
          '确认切换题库？记录将会保存。'
        ),
        showCancelButton: true,
        confirmButtonText: '确认切换',
        cancelButtonText: '继续做题'
      }).then(() => {
        _this.loading = true
        _this.getData(filename)
      }).catch(() => {})
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
            duration: 1200,
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
    this.$store.dispatch(type.RECEIVE_FILES, fileList => {
      this.fileList = fileList
      this.listLoading = false
    })
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
  .active
    background-color lightblue !important
  .main
    scrollBar()
    padding-top 0
    padding-bottom 0
  .side
    scrollBar()
    border 1px solid rgb(221, 221, 221)
    border-radius 5px
  ul#toLoad
    font-size 18px
    list-style none
    background-color white
    & li
      margin 5px 0
      padding 0 5px
      border-radius 5px
      cursor pointer
      height 40px
      line-height 40px
      /* 超出部分省略号代替 */
      text-overflow ellipsis
      white-space nowrap
      overflow hidden
      /* 防止点击时选中文本,影响体验*/
      -ms-user-select none
      -moz-user-select none
      -webkit-user-select none
      &:hover
        background-color rgb(245,245,245)
</style>
