# DhakaSpace Plugin SDLC & Quality Rules

1. **Git & GitHub Discipline**:
   - Never commit directly to `main` without checking out a feature branch (`feat/*` or `fix/*`).
   - Every commit must follow Conventional Commits format (`feat(scope): message`, `fix(scope): message`, `chore(scope): message`).
   - Pull request templates in `.github/pull_request_template.md` must be respected.

2. **Secrets & Environment Variables**:
   - `server/.env`, `client/.env`, or any file containing `GEMINI_API_KEY` or `MONGODB_URI` must never be tracked in git.
   - Always maintain `server/.env.example` with placeholder values for team onboarding.

3. **Google GenAI SDK & ADK Guidelines**:
   - Always import from `@google/genai` (Node) or `google-genai` (Python).
   - Never use deprecated SDKs (`@google/generative-ai` or `google-generativeai`).
   - Use current models: `gemini-3.8-flash`, `gemini-4-carbon`, `gemini-4-argon`.
   - Never use deprecated models (`gemini-1.5-*`, `gemini-2.0-*`, `gemini-2.5-*`).
   - For structured responses, always provide `response_format` with JSON Schema.

4. **Code Review Protocol**:
   - Before merging any feature or writing release walkthroughs, run the `code-reviewer` subagent to audit changes.
