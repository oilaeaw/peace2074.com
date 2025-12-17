export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "build", // changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
        "chore", // other changes that don't modify src or test files
        "ci", // changes to the CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
        "docs", // changes to the documentation
        "feat", // new user-facingfeatures
        "fix", // bug fix that addresses user-visible issues
        "perf", // performance improvements
        "refactor", // refactoring code without changing functionality
        "revert", // revert a previous commit
        "style", // changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
        "test", // adding missing tests or correcting existing tests
      ],
    ],
  },
};
