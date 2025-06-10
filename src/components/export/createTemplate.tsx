import * as XLSX from "xlsx";

export const downloadExcelTemplate = () => {
  const templateData = [
    {
      "ID": "PROD001",
      "Product Name": "Sample Product 1",
      "Product Type": "Electronics",
      "Description": "Sample description for product 1",
      "Singapore Price": 100,
      "Indonesia Price": 1500000,
      "Notes": "Sample notes",
      "Certificate": true
    },
    {
      "ID": "PROD002", 
      "Product Name": "Sample Product 2",
      "Product Type": "Accessories",
      "Description": "Sample description for product 2",
      "Singapore Price": 50,
      "Indonesia Price": 750000,
      "Notes": "Sample notes 2",
      "Certificate": false
    }
  ];

  try {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products Template");
    XLSX.writeFile(workbook, "inventory_import_template.xlsx");
  } catch (error) {
    console.error("Error creating template:", error);
  }
};
