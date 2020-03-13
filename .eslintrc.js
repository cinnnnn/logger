module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint", "jest", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:import/errors",
    "plugin:import/typescript"
  ],
  rules: {
    "brace-style": "error",
    "curly": ["error"],
    "eol-last": ["error", "always"],
    "import/order": ["error", {
      groups: ["index", "sibling", "parent", "internal", "external", "builtin"],
      alphabetize: {
        order: "asc"
      }
    }],
    "no-console": "error",
    "no-multiple-empty-lines": ["error", { max: 1 }],
    "quotes": ["error", "single"],
    "semi": "off",
    "@typescript-eslint/semi": ["error", "always"],
    "@typescript-eslint/indent": ["error", 2],
    "@typescript-eslint/no-use-before-define": ["error", {
      functions: false,
      typedefs: false
    }],
    "@typescript-eslint/no-explicit-any": "off"
  }
}