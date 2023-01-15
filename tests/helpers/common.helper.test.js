const commonHelper = require("../../helpers/common.helper")
describe("Validate Common", ()=>{
    it("should validate omit", ()=>{
        const entry = [{a:"1",b:"2"},{c:"1", b:"2"},{d:"3", b:"2"}]

        const expected = [{a:"1"},{c:"1"},{d:"3"}]

        const response = commonHelper.getArrayOmitingParams(entry, ["b"])
        expect(response).toEqual(expected)

    })
})