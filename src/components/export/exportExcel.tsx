import * as XLSX from "xlsx";

export const onGetExporProduct = async (
  fileName: string,
  worksheetname: string,
  dataExport: any[]
) => {
  try {
    // Check if the action result contains data and if it's an array
    if (dataExport && Array.isArray(dataExport)) {
      // Create Excel workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils?.json_to_sheet(dataExport);
      XLSX.utils.book_append_sheet(workbook, worksheet, worksheetname);
      // Save the workbook as an Excel file
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
      console.log(`Exported data to ${fileName}.xlsx`);
    } else {
      console.log("#==================Export Error");
    }
  } catch (error: any) {
    console.log("#==================Export Error", error.message);
  }
};
