import * as XLSX from "xlsx";

type ImportProduct = {
  idProduct: string;
  nameProduct: string;
  type: string;
  description: string;
  priceSG: string | number;
  priceID: string | number;
  notes: string;
  certificate: boolean;
};

export const parseExcelFile = (file: File): Promise<ImportProduct[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert Excel data to JSON
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        
        // Map Excel columns to ImportProduct type
        const importData: ImportProduct[] = rawData.map((row: any) => ({
          idProduct: row.ID || row.idProduct || "",
          nameProduct: row["Product Name"] || row.nameProduct || "",
          type: row["Product Type"] || row.type || "",
          description: row.Description || row.description || "",
          priceSG: row["Singapore Price"] || row.priceSG || 0,
          priceID: row["Indonesia Price"] || row.priceID || 0,
          notes: row.Notes || row.notes || "",
          certificate: Boolean(row.Certificate || row.certificate || false)
        }));

        // Validate required fields
        const validatedData = importData.filter(row => {
          if (!row.idProduct || !row.nameProduct || !row.type) {
            console.warn("Skipping invalid row:", row);
            return false;
          }
          return true;
        });

        if (validatedData.length === 0) {
          reject(new Error("No valid data found in Excel file"));
          return;
        }

        resolve(validatedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};
