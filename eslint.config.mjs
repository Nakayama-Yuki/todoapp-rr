import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default defineConfig(
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
);
