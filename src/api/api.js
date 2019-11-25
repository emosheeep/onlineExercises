import http from './axios'

const FILES = 'http://www.biubiubius.com:3000/files'
const QUESTION = 'http://www.biubiubius.com:3000/question'
// 本地接口
/* const FILES = 'http://localhost:3000/files'
const QUESTION = 'http://localhost:3000/question' */

// 获取题目数据
export const getQuestions = filename => http(QUESTION, {filename: filename}, 'POST')
// 获取题库列表
export const getFileList = () => http(FILES)
