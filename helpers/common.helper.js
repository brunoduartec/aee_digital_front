const _ = require("lodash")

function getArrayOmitingParams(array, filter){
    const arrayFiltered = array.map((item)=>{
        const omitted = _.omit(item,filter)
        return omitted
      })
      return arrayFiltered
}



module.exports = {
    getArrayOmitingParams
}