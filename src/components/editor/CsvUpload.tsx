"use client";

import Papa from "papaparse";

interface Props {
  onGenerate: (json: string) => void;
}

export default function CsvUpload({ onGenerate }: Props) {
  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const rows = results.data as string[][];

        if (rows.length < 2) {
          alert("Invalid CSV");
          return;
        }

        const labels = rows[0];
        const types = rows[1];

        const fields = labels.map((label, index) => ({
          label,
          type: types[index] || "text",
        }));

        const form = {
          title: "Generated Form",
          fields,
        };

        onGenerate(JSON.stringify(form, null, 2));
      },
    });
  }

  return (
    <div className="mb-6">
      <label className="block font-semibold mb-2">
        Upload CSV
      </label>

      <input
        type="file"
        accept=".csv"
        onChange={handleFile}
      />
    </div>
  );
}