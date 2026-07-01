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
- Check whether the code is unnecessarily hard to understand, modify, or test.
- Check whether duplicated logic, premature abstraction, or unclear responsibility boundaries create practical maintenance risk.

## Frontend review focus

- Check whether derived values are unnecessarily stored in state instead of being computed from existing props or state.
- Check whether `useEffect` dependencies are correct and whether the effect can run with stale values or unnecessary re-runs.
- Check whether interaction logic is placed in event handlers instead of being driven indirectly through `useEffect`.
- Check whether effects that register events, timers, subscriptions, or external SDK callbacks clean them up correctly.
- Check whether previous-state updates need functional `setState` to avoid stale state bugs.
- Check whether transient values that do not affect rendering are unnecessarily stored in state instead of refs.
- Check whether components are defined inside other components in a way that can recreate component types on every render.
- Check whether conditional rendering safely handles loading, error, empty, and unavailable data states.
- Check whether large libraries or heavy components are unnecessarily included in the initial bundle.
- Check whether component props form a clear API and whether state ownership between parent and child is clear.
- Suggest component API changes only when the current props make responsibilities unclear, duplicate business logic, or increase inconsistent behavior risk.
- Check whether boolean props or premature abstractions make component behavior harder to understand or extend.

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
- Leave comments for actionable issues that affect correctness, regression risk, security, user impact, maintainability, readability, or testability.
- Non-blocking comments are acceptable when they are specific, practical, and likely to improve the code.
- If no blocking issue exists, still mention any specific actionable non-blocking issue that would improve correctness, maintainability, readability, user experience, or testability.
- If no actionable issue exists, leave a concise Korean summary stating what was reviewed and that no actionable issue was found.
- If something is unclear, ask a question instead of making a firm claim.
