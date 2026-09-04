import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    settings: {
      react: {
        version: "19.2",
      },
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/**",
    "node_modules/**",
    ".mcp-servers/**",
    "tests/**",
    "lib/generated/**",
  ]),
  {
    rules: {
      "react/display-name": "off",
      "@next/next/no-location-assign-relative-destination": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/**",
    "node_modules/**",
    ".mcp-servers/**",
    "tests/**",
    "lib/generated/**",
  ]),
]);

export default eslintConfig;
