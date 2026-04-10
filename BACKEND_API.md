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
