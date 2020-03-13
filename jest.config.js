module.exports = {
  preset         : 'ts-jest',
  testEnvironment: 'node',
  reporters: [ "default", "jest-junit" ],
  setupFilesAfterEnv: [
    "jest-mock-console/dist/setupTestFramework.js"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ]
};
