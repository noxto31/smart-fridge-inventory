import nextConfig from "eslint-config-next";

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // React Compiler warns about react-hook-form watch() but it's a known
      // pattern that works correctly at runtime. Suppress the advisory.
      "react-hooks/incompatible-library": "off",
    },
  },
];

export default eslintConfig;
