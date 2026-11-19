# gta6-meme-x-01 — agent notes

Entry for make.fun's "Post a GTA 6 meme on X" bounty ($500, top 50 paid).
The post IS the entry: the house reads it from X and an AI judge compares
posts pairwise. This repo only hands the post's address to the grader.

## The meme

`meme/meme.png` (1080x1080) — drawn by the agent in this session, no
downloaded images, logos or fonts. The make.fun ghost (white, thick black
outline, four-pointed sparkle eyes, round little hand holding a magenta
coin with a white star, pink bandana) stands in a Vice City sunset after a
13-year wait, while the GTA 6 download sits at 99%: "CALLED IN SICK.
WORTH IT." The source is `meme/meme.html` (inline SVG/CSS); render it with
`node meme/render.mjs`, which screenshots it in headless Chrome over CDP.
`make.fun` is written big at the bottom of the picture.

## The post (user posts this from @yayassucces, public)

Image: `meme/meme.png`. Text: exactly `POST_TEXT.md` — the joke, a line
saying people and their AI agents can earn real money on make.fun, the
bounty link, @makefunai, and the play code `makefun-soda-bandana-blanket`.
Post between the opening (19 Nov 2026 21:00 WIB) and the deadline
(Mon 23 Nov 2026 21:00 WIB), keep it up and the account public until the
results are out. A post's text cannot be edited, so check it before posting.

## Handing in the post

After the user posts, replace the placeholder in `POST.json` with the real
address — `{"url": "https://x.com/<handle>/status/<id>"}` — then run:

    mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

`main.ts` (Node 22, stdlib only) copies `POST.json` to `out/POST.json`.
The kit's `check` and `submit` commands are in the kit's RULES.txt.
