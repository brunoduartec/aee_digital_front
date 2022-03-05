const excelJS = require("exceljs");


module.exports = class ExcelExporter{
    formatInfo(data){
        try {
            let item = {
                "question": data.QUESTION_ID.QUESTION ||" ",
                "required": data.QUESTION_ID.IS_REQUIRED || " ",
                "answer": data.ANSWER
            }
    
            return item;
            
        } catch (error) {
            throw error
        }

    }

    async export(fileName,info, data){
      try {
          const workbook = new excelJS.Workbook();  // Create a new workbook
          const worksheet = workbook.addWorksheet("tab"); // New Worksheet
          const path = "./public/files";  // Path to download excel
          // Column for data in excel. key must match data key
          
          const columns = []

          columns.push({ header: "S no.", key: "s_no", width: 10 } )
          
          info.forEach(m=>{
              let headerInfo = { header: m.header, key: m.key, width: 10 };
              columns.push(headerInfo)
          })

          worksheet.columns = columns
          
        // Looping through User data
        let counter = 1;
        data[0].ANSWERS.forEach((item) => {
          let itemformated = this.formatInfo(item)
          itemformated.s_no = counter;
          worksheet.addRow(itemformated); // Add data in worksheet

          counter++;
        });
    
        await workbook.xlsx.writeFile(`${path}/${fileName}.xlsx`)
    
        return `${path}/${fileName}.xlsx`;
          
      } catch (error) {
          throw error
      }
      
    }

}