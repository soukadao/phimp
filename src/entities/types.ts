export interface ImportInfo {
  packageName: string;
  line: number;
}

export interface PhantomImport {
  filePath: string;
  packageName: string;
  line: number;
}

export interface ScanResult {
  phantoms: PhantomImport[];
  scannedFiles: number;
}
