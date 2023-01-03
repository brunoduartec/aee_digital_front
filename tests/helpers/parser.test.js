describe("helpers:parser", () => {
    const logger = {
      info: function (info) {
        console.log(info);
      },
    };
    const {getParamsParsed,getQueryParamsParsed,getNestedObject} = require("../../helpers/parser");
    it("should validade getParamsParsed", async () => {

      const params = {
        a:1,
        b:2
      }
      const expectResponse = "a=1&b=2"
      
      const response = getParamsParsed(params)

      expect(response).toMatch(expectResponse)
    });

    it("should validade getQueryParamsParsed", async () => {

      const query = "endereco?a=1&b=2"
      const expectResponse =  {
        a:"1",
        b:"2"
      }
      
      const response = getQueryParamsParsed(query)

      expect(response).toEqual(expectResponse)
    });

    it("should validade getQueryParamsParsed with answerId", async () => {

      const query = "endereco?answerId=1_2"
      const expectResponse =  {
        answer:false,
        answerId:"1"
      }
      
      const response = getQueryParamsParsed(query)

      expect(response).toEqual(expectResponse)
    });

    it("should validade getNestedObject", async () => {
      // const ob = {
      //   nested :{
      //     a:1
      //   }
      // }  

      // const params = [ob]
      
      // const expectedResponse = {
      //   a:1
      // }
      // const response = getNestedObject(ob, params)

      // expect(response).toEqual(expectedResponse)
    });
  });
  