import http from './axios'

const FILES = 'https://www.biubiubius.com/files'
const QUESTION = 'https://www.biubiubius.com/question'
// 本地接口
// const FILES = 'http://localhost/files'
// const QUESTION = 'http://localhost/question'

// 获取题目数据
export const getQuestions = filename => http(QUESTION, {filename: filename}, 'POST')
// 获取题库列表
export const getFileList = () => http(FILES)
