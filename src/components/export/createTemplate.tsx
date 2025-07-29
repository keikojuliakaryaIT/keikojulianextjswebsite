import * as XLSX from "xlsx";

export const downloadExcelTemplate = (availableTypes?: any[]) => {
  // Use available types or fallback to sample types
  const sampleTypes = availableTypes && availableTypes.length > 0 
    ? availableTypes.map(t => t.type) 
    : ["Electronics", "Accessories", "Clothing", "Books"];

  const templateData = [
    {
      "ID": "PROD001",
      "Product Name": "Sample Product 1",
      "Product Type": sampleTypes[0],
      "Description": "Sample description for product 1",
      "Singapore Price": 100,
      "Indonesia Price": 1500000,
      "Notes": "Sample notes",
      "Certificate": true
    },
    {
      "ID": "PROD002", 
      "Product Name": "Sample Product 2",
      "Product Type": sampleTypes[1] || sampleTypes[0],
      "Description": "Sample description for product 2",
      "Singapore Price": 50,
      "Indonesia Price": 750000,
      "Notes": "Sample notes 2",
      "Certificate": false
    }
  ];

  // Create instructions sheet
  const instructions = [
    { "Field": "ID", "Required": "Yes", "Description": "Unique product identifier", "Example": "PROD001" },
    { "Field": "Product Name", "Required": "Yes", "Description": "Name of the product", "Example": "Sample Product" },
    { "Field": "Product Type", "Required": "Yes", "Description": `Available types: ${sampleTypes.join(", ")}`, "Example": sampleTypes[0] },
    { "Field": "Description", "Required": "No", "Description": "Product description", "Example": "Product details" },
    { "Field": "Singapore Price", "Required": "No", "Description": "Price in SGD", "Example": "100" },
    { "Field": "Indonesia Price", "Required": "No", "Description": "Price in IDR", "Example": "1500000" },
    { "Field": "Notes", "Required": "No", "Description": "Additional notes", "Example": "Special notes" },
    { "Field": "Certificate", "Required": "No", "Description": "Has certificate (true/false)", "Example": "true" }
  ];

  try {
    const workbook = XLSX.utils.book_new();
    
    // Add template data sheet
    const templateSheet = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(workbook, templateSheet, "Template");
    
    // Add instructions sheet
    const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions");
    
    XLSX.writeFile(workbook, "inventory_import_template.xlsx");
  } catch (error) {
    console.error("Error creating template:", error);
  }
};
