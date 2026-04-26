# Lesson seed batch

This batch is prepared to match the current backend/frontend lesson structure:

- one JSON file = one lesson
- each file contains:
  - lesson
  - contents[]
  - quiz
  - quizQuestions[]
- supported content block types used:
  - text
  - alphabet_table
  - classification
  - grammar_note
  - vocab_list
  - exercise_repeat
  - exercise_write
  - exercise_fill
  - exercise_word_build
  - quiz_link

## Recommended backend placement

Place these files in:

`apps/server/src/data/seed/lessons/`

Keep old files only as backup under:

`apps/server/src/data/seed/lessons/archive/`

## Seed loading rule

Load only active lesson files.
Ignore backup files such as `*_old.json`.

## Suggested curriculum map

### B1 / Unit 1
- b1_u1_l1.json — Монгол цагаан толгойн танилцуулга
- b1_u1_l2.json — Цагаан толгойн ангилал
- b1_u1_l3.json — Сонсож, дагаж унших дасгал
- b1_u1_l4.json — Үсэг бичих дасгал
- b1_u1_l5.json — Үе ба үг бүтээх дасгал

### M1 / Unit 1
- m1_u1_l1.json — Эгшиг үсгийн ангилал
- m1_u1_l2.json — Эгшгийн дуудлага ба үе
- m1_u1_l3.json — Эгшиг бичих ба үгийн сан

### M1 / Unit 2
- m1_u2_l1.json — Эгшиг авианы ангилал
- m1_u2_l2.json — Богино, урт, хос эгшиг унших
- m1_u2_l3.json — Эгшиг бичих дасгал

### M1 / Unit 3
- m1_u3_l1.json — Эгшиг зохицох ёс
- m1_u3_l2.json — Эгшгийн дараалал
- m1_u3_l3.json — Эгшиг зохицох ёсны онцгой тохиолдол

## Notes

- B1 is kept focused on Cyrillic literacy.
- The later vowel and harmony PDFs are mapped into M1 content.
- Files are intentionally small so they are easier to render, test, and maintain.
