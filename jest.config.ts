import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  clearMocks: true,
  restoreMocks: true,
  verbose: true,
  transform: {
    "^.+\\.tsx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: { syntax: "typescript" },
          target: "es2022"
        },
        module: { type: "commonjs" }
      }
    ]
  },
};

export default config;