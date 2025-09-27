
# Implementation Plan: Dyslexia Support Features - Pronunciation Logic Refinement

**Branch**: `001-dyslexia-support` | **Date**: 2025-09-24 | **Spec**: /Users/kane/Desktop/project/qwerty-learner/specs/001-dyslexia-support/spec.md
**Input**: Feature specification from `/specs/001-dyslexia-support/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {{path}}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
This plan outlines the implementation of refined pronunciation logic for the Dyslexia Support Features. The primary goal is to enhance the user experience by ensuring all typed letters are pronounced, replaying the full word pronunciation upon completion, and delaying the transition to the next word until the full word pronunciation finishes. This addresses FR-005 and FR-006 from the feature specification.

## Technical Context
**Language/Version**: TypeScript  
**Primary Dependencies**: React, Jotai, Web Speech API (`speechSynthesis`)  
**Storage**: N/A  
**Testing**: NEEDS CLARIFICATION  
**Target Platform**: Web (browser)
**Project Type**: Web application  
**Performance Goals**: Low latency for speech playback (important for typing feedback), smooth user experience without noticeable delays.  
**Constraints**: Browser compatibility (especially `speechSynthesis` nuances and event handling), user experience (smooth, non-interruptive feedback), potential for voice loading delays.  
**Scale/Scope**: Single-user, real-time typing feedback within the `qwerty-learner` application.

**User-specific pronunciation logic requirements:**
1.  Ensure the last letter of a word is pronounced.
2.  After typing the entire word, play the pronunciation of the *whole word* one more time, similar to how it was pronounced at the beginning of typing that word.
3.  Delay the transition to the next word until *after* this whole word pronunciation is complete.

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. 以暗猜接口为耻，以认真查阅为荣**: `speechSynthesis` usage has been researched.
- **II. 以模糊执行为耻，以寻求确认为荣**: User's request is clear and confirmed.
- **V. 以跳过验证为耻，以主动测试为荣**: Changes will require testing.
- **VI. 以破坏架构为耻，以遵循规范为荣**: Changes will integrate idiomatically within existing React/Jotai hook structure.
- **VIII. 以盲目修改为耻，以谨慎重构为荣**: Existing `useLetterSound` and `usePronunciation` hooks will be understood before modification.

## Project Structure

### Documentation (this feature)
```
specs/001-dyslexia-support/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 2: Web application (frontend only for this feature)

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research 

