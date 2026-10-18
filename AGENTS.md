<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read these installed skill files directly (use these paths even if a same-named global skill exists):
- Core filter, always on: `antislop`: `.opencode/skills/antislop/SKILL.md`
- UI / visual: `antislop-ui`: `.opencode/skills/antislop-ui/SKILL.md`
- Copy & text: `antislop-copywriting`: `.opencode/skills/antislop-copywriting/SKILL.md`
- People: `antislop-human`: `.opencode/skills/antislop-human/SKILL.md`
- Mobile / responsive: `antislop-layoutmobile`: `.opencode/skills/antislop-layoutmobile/SKILL.md`
- Code comments: `antislop-code`: `.opencode/skills/antislop-code/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: `npx antislop-ai --update`, or run `npx antislop-ai` and pick Overwrite them.
<!-- antislop:end -->

<!-- architecture:start -->
## architecture
For any question about project architecture (directory layout, layering, routing, data flow, gateway pipeline, provider adapters), read `docs/ARCHITECTURE.md` first and follow it. It is the single source of truth for code organization. For visual and interaction design, read `DESIGN.md`. When a task touches both structure and visuals, read the architecture file before the design file.
<!-- architecture:end -->

<!-- git:start -->
## git

This project is hosted on GitHub at `nexarioneo/omniswitch.ai` (public, remote `origin`), so commits are pushed, not kept local. Commit each finished and verified work item as one coherent commit, with a short Indonesian message that says what changed and why (subject in the imperative, body only when the reason is not obvious). Never commit runtime data (`storage/data/`, `storage/uploads/`, `backups/`), `.env.local`, or anything else listed in `.gitignore`. Run the checks that fit the change (`npx tsc --noEmit`, `npm run lint`, `npm run build`, the smoke scripts) before committing, then push and leave `git status` clean afterwards.
<!-- git:end -->