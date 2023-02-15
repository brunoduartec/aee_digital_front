async function DownloadReport(downloadAll=false, regionalName){
    console.log("AAAAA")
    console.log(downloadAll, regionalName)
  }


async function DownloadResponses() {
    try {
      var apiUrl = `bff/exportrgeneralresponses`;
      let responseInfo = await fetch(apiUrl, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "GET",
      });

      responseInfo = await responseInfo.json();
      if (responseInfo.fileName) {
        window.open(responseInfo.fileName);
      }
      return responseInfo;
    } catch (error) {
      console.log(`Error at Download General Report`, error);
      throw error;
    }
  }

  
  async function DownloadRegionalResponses(regionalName, open=false) {
    try {
      console.log(regionalName);
      var apiUrl = `bff/exportregionalresponses?regionalName=${regionalName}`;
      let responseInfo = await fetch(apiUrl, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "GET",
      });

      responseInfo = await responseInfo.json();
      if (open && responseInfo.fileName) {
        window.open(responseInfo.fileName);
      }
      return responseInfo;
    } catch (error) {
      console.log(`Error at Download ${regionalName}`, error);
      throw error;
    }
  }