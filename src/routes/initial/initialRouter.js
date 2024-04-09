const configRouter = require('express').Router();


const {createInitialData,getInitialData,deleteInitialData,clearInitialData,updateInitialData} = require('../../controllers/initial/initialController')
configRouter.post ('/',createInitialData)
configRouter.get ('/',getInitialData)
configRouter.delete ('/:id',deleteInitialData)


// configRouter.post ('/',()=> console.log('datas'))


module.exports = configRouter