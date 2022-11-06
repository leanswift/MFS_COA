export class M3DataUtil {

   static parseExportData(responseItems: any[], separator: string = '#', headerIncluded: boolean = true,
      removePrefix: boolean = false, trimValues: boolean = true): any[] {
      let parsedDataList = [];
      responseItems.forEach((item, index) => {
         if (!headerIncluded || (headerIncluded && index > 0)) {
            let exportData = {};
            let replyField: string = item.REPL;
            let fields = replyField.split(separator);
            fields.forEach((field) => {
               let firstIndex = field.indexOf(" ");
               let key = firstIndex == -1 ? field : field.slice(0, firstIndex);
               let value: string = firstIndex == -1 ? "" : field.slice(firstIndex + 1);
               trimValues = false;
               if (trimValues) {
                  value = value.trim();
               }
               let newKey = removePrefix ? key.substring(2) : key;
               exportData[newKey] = value;
            });
            parsedDataList.push(exportData);
         }
      });
      return parsedDataList;
   }
}
