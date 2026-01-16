import { stringify } from 'csv-stringify/sync';
import { parse } from 'csv-parse/sync';
import { readFileSync, writeFileSync, existsSync } from 'fs';

export interface ExtractionResult {
  email: string;
  sourceURL: string;
}

export interface CSVWriter {
  write(results: ExtractionResult[], filePath: string, append: boolean): Promise<void>;
  read(filePath: string): Promise<ExtractionResult[]>;
}

export class CSVWriterImpl implements CSVWriter {
  /**
   * Write extraction results to a CSV file
   * @param results - Array of extraction results to write
   * @param filePath - Path to the output CSV file
   * @param append - If true, append to existing file without header; if false, overwrite with header
   */
  async write(results: ExtractionResult[], filePath: string, append: boolean): Promise<void> {
    try {
      let csvContent: string;

      if (append && existsSync(filePath)) {
        // Append mode: skip header
        csvContent = stringify(results, {
          header: false,
          columns: ['email', 'sourceURL']
        });
        
        // Read existing content and append
        const existingContent = readFileSync(filePath, 'utf-8');
        writeFileSync(filePath, existingContent + csvContent, 'utf-8');
      } else {
        // Write mode: include header
        csvContent = stringify(results, {
          header: true,
          columns: ['email', 'sourceURL']
        });
        
        writeFileSync(filePath, csvContent, 'utf-8');
      }
    } catch (error) {
      throw new Error(`Failed to write CSV file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Read extraction results from a CSV file
   * @param filePath - Path to the CSV file to read
   * @returns Array of extraction results
   */
  async read(filePath: string): Promise<ExtractionResult[]> {
    if (!existsSync(filePath)) {
      return [];
    }

    const fileContent = readFileSync(filePath, 'utf-8');
    
    if (!fileContent.trim()) {
      return [];
    }

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    return records.map((record: any) => ({
      email: record.email,
      sourceURL: record.sourceURL
    }));
  }
}

export const csvWriter = new CSVWriterImpl();
