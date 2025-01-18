import { download, generateCsv, mkConfig } from "export-to-csv";

export const csvConfig = mkConfig({
  useKeysAsHeaders: true,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleExportCsv = (data: any[]) => {
  const csv = generateCsv(csvConfig)(data);
  download(csvConfig)(csv);
};
