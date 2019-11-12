var question = new Question("file")
var view = new QuestionView("question", "list")
console.log(view)

var iter = question.iterator()
view.showQuestion({
	question: "nihao",
	list: [1,2,3,4]
})