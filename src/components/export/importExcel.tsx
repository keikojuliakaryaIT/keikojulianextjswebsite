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
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert Excel data to JSON
        const rawData = XLSX.utils.sheet_to_json(worksheet);

        if (rawData.length === 0) {
          reject(new Error("Excel file is empty"));
          return;
        }

        // Map Excel columns to ImportProduct type
        const importData: ImportProduct[] = rawData.map(
          (row: any, index: number) => {
            const product = {
              idProduct: String(row.ID ?? row.idProduct ?? "").trim(),
              nameProduct: String(
                row["Product Name"] ?? row.nameProduct ?? ""
              ).trim(),
              type: String(row["Product Type"] ?? row.type ?? "").trim(),
              description: String(
                row.Description ?? row.description ?? ""
              ).trim(),
              priceSG: Number(row["Singapore Price"] ?? row.priceSG ?? 0),
              priceID: Number(row["Indonesia Price"] ?? row.priceID ?? 0),
              notes: String(row.Notes ?? row.notes ?? "").trim(),
              certificate: Boolean(row.Certificate ?? row.certificate ?? false),
            };

            // Validate required fields for each row
            if (!product.idProduct || !product.nameProduct || !product.type) {
              console.warn(
                `Row ${
                  index + 2
                }: Missing required fields (ID, Product Name, or Product Type)`,
                row
              );
            }

            return product;
          }
        );

        // Filter out invalid rows
        const validatedData = importData.filter(
          (row) => row.idProduct && row.nameProduct && row.type
        );

        if (validatedData.length === 0) {
          reject(
            new Error(
              "No valid data found in Excel file. Please ensure all rows have ID, Product Name, and Product Type."
            )
          );
          return;
        }

        if (validatedData.length < importData.length) {
          console.warn(
            `${
              importData.length - validatedData.length
            } rows were skipped due to missing required fields`
          );
        }

        resolve(validatedData);
      } catch (error) {
        reject(
          new Error(
            `Failed to parse Excel file: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          )
        );
      }
    };

    reader.onerror = (error) => reject(new Error("Failed to read file"));
    reader.readAsBinaryString(file);
  });
};
