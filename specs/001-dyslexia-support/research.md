# Research for Dyslexia Support Features - Pronunciation Logic Refinement

## Unknowns from Technical Context & Research Tasks:

### 1. Testing Strategy for React Hooks
- **Research Task**: How are React hooks (specifically `useLetterSound` and `usePronunciation`) typically tested in this project? Are there existing unit/integration tests for these or similar hooks? What are the best practices for testing custom hooks that interact with browser APIs like `speechSynthesis` (e.g., mocking `speechSynthesis`, testing event handlers)?

### 2. `useLetterSound` Modification for Last Letter Pronunciation
- **Research Task**: The current `useLetterSound` uses a `setTimeout` and `speechSynthesis.cancel()`. How can this logic be modified to ensure the last letter of a word is always pronounced, even when typing quickly? This might involve:
    - Implementing a speech queue.
    - Using `utterance.onend` to manage the timing more precisely.
    - Adjusting the `setTimeout` delay or removing it in certain contexts.

### 3. `usePronunciation` Modification for Whole Word Replay and Transition Delay
- **Research Task**: How can `usePronunciation` be modified to:
    - Trigger the whole word pronunciation *after* the word is fully typed.
    - Ensure the transition to the "next word" is delayed until *after* this whole word pronunciation is complete.
    - This will likely require coordination between the component handling typing input, `useLetterSound`, and `usePronunciation`. Investigate mechanisms like:
        - Callbacks or Promises returned by speech functions.
        - State management (e.g., Jotai atoms) to signal speech completion.
        - Event listeners for `utterance.onend` to control the flow.

### 4. Browser Compatibility and `speechSynthesis` Event Handling Best Practices
- **Research Task**: Given the recent Chrome bug, what are the most robust patterns for handling `speechSynthesis` events (`onstart`, `onend`, `onerror`) to ensure reliable sequencing of speech and transitions? How can we make the speech logic resilient to browser-specific quirks or delays in `speechSynthesis`?

---