import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  
  {
    // ใช้ files เพื่อกำหนดว่า rules เหล่านี้ใช้กับไฟล์ TypeScript เท่านั้น
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // ปิดกฎที่ห้ามใช้ Type 'any' อย่างชัดแจ้ง
      "@typescript-eslint/no-explicit-any": "off", 
      
      // ปิดกฎที่ห้ามใช้ค่าที่ไม่ปลอดภัยในพารามิเตอร์ของฟังก์ชัน
      "@typescript-eslint/no-unsafe-argument": "off", 
    }
  }
]);

export default eslintConfig;
