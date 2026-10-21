# Example Use Cases

**1. Historical resurrection** — Feed the complete works of a thinker into a Face. Ask it questions they never answered. The responses emerge from their actual cognitive structure, not an LLM's pastiche of their reputation.

**2. Customer panel from transcripts** — Upload 20 interview transcripts, one Face per participant. Run `face:diff` across the panel. Get a similarity matrix before reading a word. Cluster by centroid, not by manual theme-coding.

**3. The board of minds** — Assemble a council of thinkers: a scientist, an artist, a pragmatist, a mystic. Route every major decision through all four. Surface the full range of internally consistent responses before choosing a direction.

**4. The shadow** — After building a Face from your own writing, find its furthest neighbor. That is the mind most unlike yours in the collection — the perspective you are least equipped to anticipate. Chat through it. Let it answer the same questions you posed to yourself. The gap between the two responses is the shape of your blindspot.

**5. Character ensemble for fiction** — Build a cast from character backstory documents. Use `face:neighbors --direction furthest` to find natural antagonist pairs. Let the centroid geometry write the conflict structure.

**6. Living proxy** — Compile your own writing: emails, notes, essays, voice memos. The Face becomes a 24/7 proxy for your thinking. Share it via a scoped API key so collaborators can consult your perspective when you're unavailable.

**7. Ideological drift detection**: Compile new material into a Face quarterly. Compare centroid snapshots over time to detect whether a person's or organization's thinking is shifting, and in which direction.

**8. Boolean composition** — You have a pragmatist and a visionary. Their union (`pragmatist | visionary`) gives you someone who holds both worldviews. Their intersection (`pragmatist & visionary`) gives you only what they share — the narrow common ground. Their difference (`visionary - pragmatist`) gives you the visionary's thinking stripped of any practical instinct. Each is a real, chattable Face. None required a single additional document to compile.

**9. Synthetic focus group** — Build Faces for archetypal personas: early adopter, skeptic, pragmatist, regulator, loyalist. Run a product pitch or policy change through each. Get distinct, internally consistent reactions without scheduling a single session.

**10. Stress-testing an argument** — Compile a philosophical argument or policy position into a Face. Find its nearest neighbors — who already thinks this way. Find its furthest — who is most opposed. Use the furthest to generate the sharpest possible counter-argument, grounded in a real cognitive structure.

**11. Your social media voice** — Compile your posts, threads, captions, and YouTube videos into a Face. The compiler distills your tone, cadence, and perspective into a cognitive instruction set. Now use it to draft new content: feed it a topic, a product, a link, or a brief and get copy that sounds like you — not like an LLM. Because the Face is live, compiling new material over time keeps it current as your voice evolves.

**12. The cognitive circuit** — Build a deliberation pipeline from persona logic gates. Compile an `expert` Face from domain literature. Derive a `critic` as `expert - consensus` — the expert's knowledge minus received wisdom. Derive a `synthesizer` as `(expert | critic) - noise`. Route a question through all three in sequence: ask `expert` first, feed its response into `critic`, feed that into `synthesizer`. Each stage is a gate; together they are a circuit. You have just built a reasoning pipeline from persona primitives — the same way an FPGA builds computation from logic gates.

**13. Multi-face debate.** Ask one Face for its position, then hand that answer to another. `faces chat:chat penrose --llm gpt-4o-mini -m 'State your position on the information paradox.'`, then `faces chat:chat hawking --llm gpt-4o-mini -m 'Penrose argues: <Penrose's answer>. Defend your position against it.'` Hawking is the voice, answering what Penrose actually said: not a generic debate, but one shaped by two specific cognitive structures. Alternate for as many rounds as the exchange needs.

**14. Neutral analysis across minds.** Ask each Face the same question, then give their answers to a bare model with no persona. `faces chat:chat marx -m 'What drives history?'` and the same of `hayek`, then `faces chat:messages gpt-4o-mini -m 'Marx says: <answer>. Hayek says: <answer>. Where do they converge?'` The model acts as a neutral analyst over both minds' own words. This is comparative cognition: let the LLM reason across multiple minds without privileging any one of them.
