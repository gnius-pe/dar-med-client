import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

export interface ColumnDefinition<T> {
  header: string;
  key: keyof T | string;
  transform?: (value: any, row: T) => string | number;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exportToExcel<T>(
    data: T[],
    columns: ColumnDefinition<T>[],
    fileName: string = 'exportacion'
  ): void {
    if (!data || data.length === 0) {
      return;
    }

    const headers = columns.map(col => col.header);
    const rows = data.map(row =>
      columns.map(col => {
        const rawValue = this.getNestedValue(row, String(col.key));
        return col.transform ? col.transform(rawValue, row) : rawValue ?? '';
      })
    );

    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws['!cols'] = columns.map(col => ({
      wch: Math.max(col.header.length + 2, 14)
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');

    const safeFileName = fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 50) || 'exportacion';

    XLSX.writeFile(wb, `${safeFileName}_${this.getFormattedDate()}.xlsx`);
  }

  private getNestedValue<T>(obj: T, path: string): any {
    return path.split('.').reduce((current: any, key: string) => current?.[key], obj);
  }

  private getFormattedDate(): string {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${day}-${month}-${year}_${hours}${minutes}`;
  }
}
