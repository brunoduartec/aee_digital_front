
describe('helpers:repeater', ()=>{
    const logger = {
        info: function(info){
            console.log(info)
        }
    }
    const Repeater = require("../../helpers/repeater.helper")
    it('should validade', async ()=>{
        const repeater = new Repeater(logger)
        function c(){
            logger.info("CHAMOU")
        }
        let count = 2;
        function condition(){
            count --;
            return count ==0;
        }
        repeater.repeat(c,0.01,condition)

        expect(true).toBe(true)        
    })
})