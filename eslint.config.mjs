import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals.js";
import nextTs from "eslint-config-next/typescript.js";

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
  // **Viktig säkerhetsregel för att förhindra server-kod på klienten**
  {
    "rules": {
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            {
              "group": ["src/genkit/dal/*"],
              "message": "DAL-moduler (Data Access Layer) får endast importeras i server-miljöer (t.ex. Genkit-flöden eller Next.js API-routes)."
            }
          ]
        }
      ]
    },
    // Denna regel ska gälla alla filer...
    "files": ["src/**/*.{ts,tsx}"],
    // ...förutom de som är avsedda att köras på servern.
    "ignores": ["src/genkit/**", "src/app/api/**"]
  }
]);

export default eslintConfig;
