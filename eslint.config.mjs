import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  /*{
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },*/
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "varsIgnorePattern": "^_",
          "argsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      // TanStack Table v8 returns functions from useReactTable() that the React Compiler
      // cannot memoize. This is a known upstream incompatibility — not fixable in userland.
      "react-hooks/incompatible-library": "off"
    }
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
