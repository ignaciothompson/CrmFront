import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { ExcelReadResult } from '../models/import.models';

/**
 * ExcelService
 * 
 * Service for reading Excel files and extracting data.
 * Uses SheetJS (xlsx) library for file parsing.
 */
@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  /**
   * Read an Excel file and return raw data
   * 
   * @param file - File object from input element
   * @param sheetIndex - Index of sheet to read (default: 0)
   * @returns Promise with ExcelReadResult containing raw data and headers
   */
  async readExcelFile(
    file: File,
    sheetIndex: number = 0
  ): Promise<ExcelReadResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error('No data read from file'));
            return;
          }

          const workbook = XLSX.read(data, {
            type: 'binary',
            cellDates: true,
            cellNF: false,
            cellText: false
          });

          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            reject(new Error('Excel file contains no sheets'));
            return;
          }

          const sheetName = workbook.SheetNames[sheetIndex];
          if (!sheetName) {
            reject(new Error(`Sheet at index ${sheetIndex} not found`));
            return;
          }

          const worksheet = workbook.Sheets[sheetName];
          
          // Convert sheet to JSON array
          // raw: true preserves numbers, dates, etc. as their original types
          const rawData = XLSX.utils.sheet_to_json(worksheet, {
            raw: true,
            defval: null, // Use null for empty cells
            blankrows: false // Skip completely empty rows
          }) as Record<string, any>[];

          // Extract headers from the first row
          const headers = this.extractHeaders(worksheet);

          resolve({
            rawData,
            headers,
            sheetName,
            rowCount: rawData.length
          });
        } catch (error) {
          reject(
            error instanceof Error
              ? error
              : new Error('Failed to parse Excel file')
          );
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      // Read as binary string for xlsx library
      reader.readAsBinaryString(file);
    });
  }

  /**
   * Extract headers (first row) from an Excel worksheet
   * 
   * @param worksheet - XLSX worksheet object
   * @returns Array of header strings
   */
  extractHeaders(worksheet: XLSX.WorkSheet): string[] {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const headers: string[] = [];

    // Read first row (row 0)
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      const cell = worksheet[cellAddress];
      
      if (cell && cell.v !== undefined && cell.v !== null && cell.v !== '') {
        headers.push(String(cell.v).trim());
      } else {
        // Use column letter if header is empty
        headers.push(XLSX.utils.encode_col(col));
      }
    }

    return headers;
  }

  /**
   * Extract headers from raw Excel data
   * Returns the keys from the first row object
   * 
   * @param rawData - Raw data array from Excel
   * @returns Array of header strings
   */
  extractHeadersFromData(rawData: Record<string, any>[]): string[] {
    if (!rawData || rawData.length === 0) {
      return [];
    }

    return Object.keys(rawData[0]);
  }

  /**
   * Validate that a file is a valid Excel file
   * 
   * @param file - File object to validate
   * @returns true if file is valid Excel format
   */
  isValidExcelFile(file: File): boolean {
    const validExtensions = ['.xlsx', '.xls'];
    const validMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext =>
      fileName.endsWith(ext)
    );
    const hasValidMimeType = validMimeTypes.includes(file.type);

    return hasValidExtension || hasValidMimeType;
  }

  /**
   * Get sheet names from an Excel file
   * 
   * @param file - File object
   * @returns Promise with array of sheet names
   */
  async getSheetNames(file: File): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error('No data read from file'));
            return;
          }

          const workbook = XLSX.read(data, {
            type: 'binary'
          });

          resolve(workbook.SheetNames || []);
        } catch (error) {
          reject(
            error instanceof Error
              ? error
              : new Error('Failed to parse Excel file')
          );
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsBinaryString(file);
    });
  }
}

