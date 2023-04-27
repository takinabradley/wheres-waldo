module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ["prettier", "plugin:react/recommended", "standard"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["react"],
  rules: {}
}
