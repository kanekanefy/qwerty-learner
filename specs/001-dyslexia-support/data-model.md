# Data Model

This document outlines the key entities for the Dyslexia Support Features.

## User

A child learning to read, or a parent/teacher.

- **Existing Attributes**:
  - (Assumed to have existing user attributes)
- **New Attributes**:
  - `isDyslexiaModeEnabled`: A boolean to indicate if the dyslexia-friendly mode is enabled.
  - `learningProfile`: A reference to the user's learning profile.

## Word

An English word, including its spelling, pronunciation (phonemes), and meaning.

- **Existing Attributes**:
  - (Assumed to have existing word attributes)
- **New Attributes**:
  - `isIrregular`: A boolean to indicate if the word has an irregular pronunciation.

## LearningProfile

A user-specific profile that stores their progress, error patterns, and preferred learning style.

- **Attributes**:
  - `userId`: The ID of the user.
  - `errorPatterns`: A list of common error patterns for the user (e.g., confusing 'b' and 'd').
  - `preferredLearningStyle`: The user's preferred learning style (e.g., "visual", "auditory", "kinesthetic").

## ProgressReport

A summary of a user's learning activities and achievements over a period of time.

- **Attributes**:
  - `userId`: The ID of the user.
  - `date`: The date of the report.
  - `wordsLearned`: A list of words learned during the reporting period.
  - `errorSummary`: a summary of the errors made during the reporting period.
