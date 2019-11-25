<template>
  <el-container>
    <el-aside>
      <el-card v-for="(item, index) in fileList" :key="index"
      shadow="hover"
      @click.native="send(item)">
        {{item}}
      </el-card>
    </el-aside>
    <el-main>
      <question :questions="questions"></question>
    </el-main>
  </el-container>
</template>

<script>
import Question from '../components/Question'
export default {
  name: 'homePage',
  data () {
    return {
      questions: [],
      // 保存题目列表
      fileList: []
    }
  },
  components: {
    Question
  },
  methods: {
    send (filename) {
      console.log(filename)
      this.questions = this.$store.state.questions[filename]
    }
  },
  mounted () {
    this.fileList = this.$store.state.fileList
  }
}
</script>

<style scoped lang="stylus">

</style>
