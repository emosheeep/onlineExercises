<template>
  <div>
    <question :questions="questions"></question>
    <el-button @click="send">安全知识问答</el-button>
  </div>
</template>

<script>
import Question from '../components/Question'
export default {
  name: 'homePage',
  data () {
    return {
      questions: []
    }
  },
  components: {
    Question
  },
  methods: {
    send () {
      this.questions = this.$store.state.questions['安全知识问答']
    }
  },
  computed: {
    question () {
      return this.$store.state.questions['安全知识问答']
    }
  }
}
</script>

<style scoped lang="stylus">

</style>
