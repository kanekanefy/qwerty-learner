# Tasks: Dyslexia Support Features

**Input**: Design documents from `/specs/001-dyslexia-support/`
**Prerequisites**: plan.md, research.md, data-model.md, quickstart.md

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Setup
- [X] T001 Verify that all dependencies are installed correctly by running `yarn install`.

## Phase 3.2: Core Implementation
- [X] T002 [P] Create a new Jotai atom in `src/store/atomForConfig.ts` to store the "read out typed letters" setting.
- [X] T003 [P] Create a new setting in `src/pages/Typing/components/Setting/ViewSetting.tsx` to enable/disable the "read out typed letters" feature.
- [X] T004 [P] Implement the "read out typed letters" feature in `src/hooks/useKeySounds.ts` by using the browser's `SpeechSynthesis` API.

## Phase 3.3: Testing
- [ ] T005 [P] Write a unit test for the new Jotai atom in `src/store/atomForConfig.test.ts`. (Blocked: Test environment setup failed)
- [ ] T006 [P] Write a unit test for the new setting in `src/pages/Typing/components/Setting/ViewSetting.tsx`. (Blocked: Test environment setup failed)
- [ ] T007 [P] Write an integration test for the "read out typed letters" feature in `tests/e2e/dyslexia.spec.ts`. (Blocked: Test environment setup failed)

## Dependencies
- T001 must be completed before all other tasks.
- T002 must be completed before T003 and T005.
- T004 must be completed before T007.

## Parallel Example
```
# Launch T002-T004 together:
Task: "Create a new Jotai atom in src/store/atomForConfig.ts to store the \"read out typed letters\" setting."
Task: "Create a new setting in src/pages/Typing/components/Setting/ViewSetting.tsx to enable/disable the \"read out typed letters\" feature."
Task: "Implement the \"read out typed letters\" feature in src/hooks/useKeySounds.ts by using the browser's `SpeechSynthesis` API."
```

```