// Export utility for downloading generated projects as ZIP
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface ExportFile {
  path: string;
  content: string;
}

export async function downloadProjectAsZip(
  projectName: string,
  files: ExportFile[]
): Promise<void> {
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.path, file.content);
  }

  // Add a package.json for the generated project
  zip.file(
    "package.json",
    JSON.stringify(
      {
        name: projectName.toLowerCase().replace(/\s+/g, "-"),
        version: "1.0.0",
        private: true,
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start",
        },
        dependencies: {
          next: "14.2.0",
          react: "^18.3.0",
          "react-dom": "^18.3.0",
          "lucide-react": "^0.400.0",
        },
        devDependencies: {
          typescript: "^5.0.0",
          "@types/react": "^18.0.0",
          "@types/node": "^20.0.0",
          tailwindcss: "^3.4.0",
        },
      },
      null,
      2
    )
  );

  // Add a basic tailwind config
  zip.file(
    "tailwind.config.ts",
    `import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
export default config;
`
  );

  // Add tsconfig
  zip.file(
    "tsconfig.json",
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2017",
          lib: ["dom", "dom.iterable", "esnext"],
          module: "esnext",
          moduleResolution: "bundler",
          jsx: "preserve",
          strict: true,
          paths: { "@/*": ["./src/*"] },
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
        exclude: ["node_modules"],
      },
      null,
      2
    )
  );

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${projectName.toLowerCase().replace(/\s+/g, "-")}.zip`);
}

export function createExportFiles(sourceCode: string): ExportFile[] {
  // Parse the source code and extract components/files
  // For now, we create a standard Next.js structure with the generated code
  const files: ExportFile[] = [
    {
      path: "src/app/page.tsx",
      content: `"use client";\n\n${sourceCode}`,
    },
    {
      path: "src/app/globals.css",
      content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n  --background: #ffffff;\n  --foreground: #171717;\n}\n\nbody {\n  background: var(--background);\n  color: var(--foreground);\n  font-family: system-ui, -apple-system, sans-serif;\n}\n`,
    },
    {
      path: "src/app/layout.tsx",
      content: `import type { Metadata } from "next";\nimport "./globals.css";\n\nexport const metadata: Metadata = {\n  title: "Generated App",\n  description: "Created with AI App Generator",\n};\n\nexport default function RootLayout({\n  children,\n}: {\n  children: React.ReactNode;\n}) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  );\n}\n`,
    },
    {
      path: "next.config.js",
      content: `/** @type {import('next').NextConfig} */\nconst nextConfig = {};\nmodule.exports = nextConfig;\n`,
    },
    {
      path: "postcss.config.js",
      content: `module.exports = {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n};\n`,
    },
    {
      path: "README.md",
      content: `# Generated Project\n\nCreated with AI App Generator.\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\nOpen [http://localhost:3000](http://localhost:3000) to view it.\n`,
    },
  ];

  return files;
}