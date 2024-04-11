const configRouter = require('express').Router();


const {createInitialData,getInitialData,deleteInitialData,clearInitialData,updateInitialData,getCompanyData} = require('../../controllers/initial/initialController')
configRouter.post ('/',createInitialData)
configRouter.get ('/',getInitialData)
configRouter.delete ('/:id',deleteInitialData)
configRouter.delete ('/',clearInitialData)
configRouter.patch ('/:id',updateInitialData)
configRouter.get ('/company',getCompanyData)




// configRouter.post ('/',()=> console.log('datas'))


module.exports = configRouter