module.exports = {
  root: true,
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"], // TypeScript files
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended-type-checked",
      ],
      env: { es2020: true },
    },
    {
      files: ["*.ts"], // Server-side files in the root
      env: { node: true },
    },
    {
      files: ["client/**/*.ts", "client/**/*.tsx"], // Client-side files in the client folder
      env: { browser: true },
    },
  ],
};
