# React Native Interview App (Expo)
A small Expo React Native app implementing Admin/Reviewer/Candidate interview flow.
See Loom script for demo steps.


# React Native Interview App (Expo)

**What this is:**
A small Expo React Native app that implements the requested interview platform features locally (no backend) so you can run a working demo quickly.

**Core features implemented:**
- Sign up / Sign in with 3 roles: Admin, Reviewer, Candidate (local accounts).
- Admin: create interviews (title, description, list of questions).
- Candidate: view interviews, record audio answers per question and upload (stored locally).
- Reviewer: view submissions, play audio answers, leave scores and comments.

**Tech stack & notes**
- Expo (managed workflow)
- React Navigation
- AsyncStorage to persist data locally
- expo-av for audio recording & playback

**What to submit**
- Source code (this repo)
- Working demo: run locally via Expo (instructions below)
- Loom video: suggested script included in `LOOM_SCRIPT.md`

--- FILE: LOOM_SCRIPT.md ---
1. Quick intro (10s) — what app does.
2. Show sign up / sign in with the three test accounts.
3. As Admin: create an interview with 2-3 questions.
4. Switch to Candidate: open interview, record answers for each question and upload.
5. Switch to Reviewer: open submission, play answers, add score & comments.
6. Wrap up: mention limitations.