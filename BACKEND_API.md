# Mobile Learning Backend

## Folder structure

```text
src/
  modules/
    learning/
      course.model.ts
      unit.model.ts
      lesson.model.ts
      lesson-content.model.ts
      quiz.model.ts
      quiz-question.model.ts
      learning.repository.ts
    lessons/
      lesson.repository.ts
      lesson.service.ts
      lesson.controller.ts
      lesson.route.ts
    progress/
      progress.model.ts
      user-progress.model.ts
      quiz-attempt.model.ts
      xp-ledger.model.ts
      progress.repository.ts
      progress.helpers.ts
      lesson-unlock.helper.ts
      progress.service.ts
      progress.controller.ts
      progress.route.ts
      progress.types.ts
    quiz/
      quiz.service.ts
      quiz.controller.ts
      quiz.route.ts
    review/
      daily-review.model.ts
      review.repository.ts
      review.service.ts
      review.controller.ts
      review.route.ts
  scripts/
    seed.ts
  utils/
    apiResponse.ts
```

## Routes

- `GET /api/me/progress/summary`
- `GET /api/me/progress?courseId=m2`
- `GET /api/me/profile`
- `PATCH /api/me/profile`
- `POST /api/me/avatar`
- `GET /api/tests/levels`
- `GET /api/tests/:levelId/types`
- `GET /api/tests/:levelId/:testType/questions`
- `POST /api/tests/:levelId/:testType/submit`
- `GET /api/units/m2-u1/lessons`
- `GET /api/lessons/m2-u1-l1`
- `POST /api/lessons/m2-u1-l1/complete`
- `GET /api/lessons/m2-u1-l1/quiz`
- `POST /api/quizzes/quiz_m2_u1_l1/submit`
- `GET /api/review/today`
- `POST /api/review/submit`

## Example requests

### Complete lesson

```http
POST /api/lessons/m2-u1-l1/complete
Authorization: Bearer <token>
Content-Type: application/json
```

Response:

```json
{
  "success": true,
  "data": {
    "lessonId": "m2-u1-l1",
    "completed": true,
    "xpGained": 30,
    "totalXp": 30,
    "nextLessonUnlocked": {
      "id": "m2-u1-l2",
      "title": "Daily Routine Phrases"
    }
  }
}
```

### Submit quiz

```http
POST /api/quizzes/quiz_m2_u1_l1/submit
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "answers": [
    { "questionId": "quiz_m2_u1_l1_q1", "selected": "Ticket desk" },
    { "questionId": "quiz_m2_u1_l1_q2", "selected": true },
    { "questionId": "quiz_m2_u1_l1_q3", "selected": "Thank you" }
  ]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "quizId": "quiz_m2_u1_l1",
    "score": 83,
    "passed": true,
    "correctCount": 5,
    "totalQuestions": 6,
    "xpGained": 18,
    "totalXp": 48
  }
}
```

### Submit review

```http
POST /api/review/submit
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "reviewId": "daily_review_2026_04_09_<userId>",
  "answers": [
    { "questionId": "review_q1", "selected": "Thank you" },
    { "questionId": "review_q2", "selected": true }
  ]
}
```

### Upload avatar

```http
POST /api/me/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

Form field:

- `avatar`: image file up to 5 MB (`image/jpeg`, `image/png`, `image/webp`, or `image/gif`)

Response:

```json
{
  "message": "Avatar updated successfully",
  "avatarUrl": "/uploads/avatars/<userId>-<timestamp>.png",
  "profile": {
    "name": "User Name",
    "email": "user@example.com",
    "avatarUrl": "/uploads/avatars/<userId>-<timestamp>.png"
  }
}
```

### Get level test list

```http
GET /api/tests/levels
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "levelId": "m1",
      "title": "M1",
      "activeTypes": ["vocabulary", "grammar"],
      "questionCounts": {
        "vocabulary": 8,
        "grammar": 8
      }
    }
  ]
}
```

### Get test types for a level

```http
GET /api/tests/m1/types
```

Response:

```json
{
  "success": true,
  "data": {
    "levelId": "m1",
    "types": [
      {
        "testType": "vocabulary",
        "title": "M1 Vocabulary Exam",
        "active": true,
        "status": "available",
        "questionCount": 8
      },
      {
        "testType": "grammar",
        "title": "M1 Grammar Exam",
        "active": true,
        "status": "available",
        "questionCount": 8
      },
      {
        "testType": "listening",
        "title": "Listening",
        "active": false,
        "status": "coming_soon",
        "questionCount": 0
      },
      {
        "testType": "speaking",
        "title": "Speaking",
        "active": false,
        "status": "coming_soon",
        "questionCount": 0
      }
    ]
  }
}
```

### Get level test questions

```http
GET /api/tests/m1/vocabulary/questions
```

Response:

```json
{
  "success": true,
  "data": {
    "levelId": "m1",
    "testType": "vocabulary",
    "title": "M1 Vocabulary Exam",
    "passingScore": 75,
    "totalQuestions": 8,
    "questions": [
      {
        "id": "m1_vocab_q1",
        "levelId": "m1",
        "testType": "vocabulary",
        "prompt": "What does \"сайн\" mean?",
        "options": [
          { "id": "a", "text": "good" },
          { "id": "b", "text": "small" }
        ],
        "order": 1
      }
    ]
  }
}
```

### Submit level test

```http
POST /api/tests/m1/vocabulary/submit
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "answers": [
    { "questionId": "m1_vocab_q1", "selectedOptionId": "a" },
    { "questionId": "m1_vocab_q2", "selectedOptionId": "b" }
  ]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "levelId": "m1",
    "testType": "vocabulary",
    "score": 88,
    "passed": true,
    "correctCount": 7,
    "totalQuestions": 8,
    "xpGained": 24,
    "totalXp": 124,
    "explanations": [
      {
        "questionId": "m1_vocab_q1",
        "prompt": "What does \"сайн\" mean?",
        "selectedOptionId": "a",
        "selectedOptionText": "good",
        "correctOptionId": "a",
        "correctOptionText": "good",
        "correct": true,
        "explanation": "\"сайн\" means good or well."
      }
    ]
  }
}
```

Response:

```json
{
  "success": true,
  "data": {
    "reviewId": "daily_review_2026_04_09_<userId>",
    "correctCount": 4,
    "totalQuestions": 6,
    "score": 67,
    "xpGained": 32,
    "totalXp": 200,
    "results": [
      {
        "questionId": "review_q1",
        "selected": "Thank you",
        "correctAnswer": "Thank you",
        "correct": true,
        "explanation": "Bayarlalaa is the standard way to say thank you."
      }
    ]
  }
}
```

## Seed data included

- Course `m1` with unit `m1-u1`
- Course `m2` with unit `m2-u1`
- Three lessons under `m2-u1`
- One lesson quiz attached to `m2-u1-l1`
- One daily review payload for `2026-04-09` with six mixed question types
