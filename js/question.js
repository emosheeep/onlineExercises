loadQuestion: function(id){
	let input = document.getElementById(id),
		// 保存this
		_this = this
	input.addEventListener("change", function(event){
		let files = event.target.files,
			fr = new FileReader()
		fr.onload = function(e){
			try{
				var data = e.target.result,
					workbook = XLSX.read(data, {
						type: 'binary'
					}),
					// 存储数据
					result = []
			}catch(e){
				console.error("文件类型不正确")
				return
			}
			// 遍历每张表
			for (let sheet in workbook.Sheets) {
				if (workbook.Sheets.hasOwnProperty(sheet)){
					let datas = workbook.Sheets[sheet]
					result = result.concat(XLSX.utils.sheet_to_json(datas))
				}
			}
			// 保存题库
			this.questions = result
			console.log("读取成功")
		}
		fr.readAsBinaryString(files[0])
	})
}

/**
 * 题目数据管理模块
 * @param {Object} id  上传文件的元素id
 */
var Question = function(){
	// 题库数据
	this.questions = []
	// 加载题库
	this.loadQuestion(id)
}
Question.prototype = {
	/**
	 * 读取excel文件数据
	 */
	
	/**
	 * 题目迭代器
	 */
	iterator: function(){
		if(this.questions.length == 0)
			throw new Error("数据还未读取！")
		// 当前索引值，默认为0
		var index = 0,
			items = this.questions;
		return {
			first: function(){
				console.log(this.questions)
				index = 0  // 矫正当前索引
				return items[index]
			},
			last: function(){
				index = items.length - 1
				return items[index]
			},
			pre: function(){
				if(--index > 0){  //  如果索引值大于零获取相应元素
					return items[index]
				} else {
					index = 0
					return null
				}
			},
			next: function(){
				if(++index < items.length){  // 如果索引在范围内就获取元素
					return items[index]
				} else {
					index = length - 1
					return null
				}
			},
			get: function(num){
				if (num >= 0 && num <items.length) {
					index = num  // 矫正index
					return items[index]
				}
			}
		}
	}
}

/**
 * 题目视图管理模块
 * @param {Object} quesTitle  题目元素id
 * @param {Object} quesItem   选项列表元素id
 */
var QuestionView = function(quesTitleID, quesListID){
	this.question = document.getElementById(quesTitleID)
	this.quesList = document.getElementById(quesListID)
}
QuestionView.prototype = {
	/**
	 * 渲染数据
	 * @param {Object} data
	 */
	showQuestion: function(data){
		this.question.innerText = data.question
		Array.prototype.forEach.call(this.quesList.children, function(item, index){
			item.innerText = data.list[index]
		})
	}
}
