# Example Use Cases

**1. Historical thinkers.** Compile the complete works of a thinker into a face. Ask it the
questions they never answered, and let its cause steer whichever model answers.

**2. Customer panel from transcripts.** Upload 20 interview transcripts, one face per
participant. Run `face:diff` across the panel to see who is alike before reading a word, then
ask the whole panel the same question with `faces decide` and compare the numbers.

**3. A board of advisors.** Assemble a scientist, an artist, a pragmatist and a mystic. Route
every major decision through all four, and see the full range of consistent answers before
choosing a direction.

**4. The opposite view.** After building a face from your own writing (your `me` face), find
its furthest neighbor with `face:neighbors me --direction furthest`. That is the face least
like yours in the collection. Ask it the questions you asked yourself; the gap between the two
answers is where your blind spot is.

**5. A proxy for yourself.** Compile your own emails, notes, essays and voice memos into `me`.
Share it through a scoped API key so collaborators can consult your point of view when you are
unavailable.

**6. Drift over time.** Compile new material into a face every quarter, and compare it with
`face:diff` against a face compiled from the earlier material, to see whether a person's or an
organization's thinking is moving.

**7. Boolean composition.** You have a pragmatist and a visionary. Their union
(`pragmatist | visionary`) holds both outlooks. Their intersection (`pragmatist & visionary`)
keeps only the common ground. Their difference (`visionary - pragmatist`) is the visionary
without the practical instinct. Each is a face you can chat with, and none needed another
document compiled.

**8. Synthetic focus group.** Build faces for an early adopter, a skeptic, a pragmatist, a
regulator and a loyalist. Run a product pitch or a policy change past each, with
`faces decide` for numbers and `chat:chat` for prose.

**9. Stress-testing an argument.** Compile a position into a face. Its nearest neighbors are
who already agrees; its furthest is who opposes it most. Ask the furthest for the sharpest
counter-argument.

**10. Your own writing voice.** Compile your posts, threads and captions into a face, then
build a style for each medium you write in (`style:make`). Draft new copy with
`chat:chat me --style "social post" -m "<brief>"`. Compiling new material over time keeps it
current.

**11. A deliberation pipeline.** Compile an `expert` face from domain literature. Make a
`critic` as `expert - consensus`, and a `synthesizer` as `expert | critic`. Ask `expert` first,
pass its answer to `critic`, then pass both to `synthesizer`. Each stage is one face; together
they are a pipeline built from set algebra.

**12. Debate between faces.** Get one face's cause on the question and hand it to another.
`faces causes penrose -m 'What resolves the information paradox?'` prints
Penrose's cause; then `faces chat:chat hawking --llm gpt-4o-mini -m 'Penrose holds: <the
cause>. Defend your position against it.'` Alternate for as many rounds as the exchange needs.

**13. Neutral analysis across faces.** Get each face's cause on the same question, then give
them to a model with no face. `faces causes marx -m 'What drives history?'`
and the same for `hayek`, then `faces chat:messages gpt-4o-mini -m 'Marx: <cause>. Hayek:
<cause>. Where do they converge?'` The model compares both without taking either side.

**14. Steering your own pipeline.** Call `faces causes alias -m "…"` (the API's
`POST /v1/causes`) for the cause alone, and put it in front of whatever model or agent you
already run. You pay only for the cause.
