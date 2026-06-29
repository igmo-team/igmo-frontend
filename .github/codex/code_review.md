# Code Review Guidelines

## Review focus

- Check whether the implementation matches the PR description and linked issue.
- Check whether the change may introduce unintended regressions in existing behavior.
- Check for runtime errors, invalid states, missing error handling, and unsafe assumptions about data.
- Check whether user input, asynchronous behavior, and state updates are handled safely.
- Check whether loading, error, empty, and failure states are handled where necessary.
- Check for security, privacy, authentication, authorization, or sensitive data exposure issues.
- Check whether the change scope is unnecessarily broad for the PR goal.
- Check whether tests or verification evidence are missing for risky changes.

## Do not review

- Do not comment on formatting, import order, or unused imports unless they can cause a real bug.
- Do not repeat issues that ESLint, Prettier, or TypeScript can already catch.
- Do not comment only on personal preference or alternative coding style.
- Do not assume business intent that is not described in the PR, linked issue, or code.
- Do not request large refactors outside the PR scope.

## Comment style

- Write all review comments in Korean.
- List higher-severity issues before lower-severity issues.
- Prefer inline review comments on the relevant code line over general PR-level comments whenever possible.
- Each comment should include the file location, the problem, the impact, and a practical fix direction.
- When possible, include the condition or reproduction flow that triggers the issue.
- If a comment is based on an assumption, explicitly state that it is an assumption and describe what evidence should be checked.
- Leave comments only for correctness, regression, security, user impact, or meaningful maintainability risks.
- If something is unclear, ask a question instead of making a firm claim.
