const configRouter = require('express').Router();


const {createInitialData} = require('../../controllers/initial/initialController')
configRouter.post ('/',createInitialData)
// configRouter.post ('/',()=> console.log('datas'))


module.exports = configRouter