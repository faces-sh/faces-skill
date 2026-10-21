# Full command reference

```
faces auth:login        --email  --password
faces auth:logout
faces auth:register     --email  --password  --username  [--plan free|connect|pro]  [--invite-key]
                                                       # username: 1-32 chars, a lowercase letter first, then lowercase letters,
                                                       # numbers or underscores. NO DASHES. Password: at least one digit.
                                                       # 1.21.0+ checks both before sending.
faces auth:whoami
faces auth:refresh
faces auth:connect      openai   # device-code flow: prints a code + URL, polls until approved
faces auth:disconnect   <provider>                     # nothing connected is an error, not a success (1.21.0+)
faces auth:connections

faces face:create       --name  --alias  [--default-model MODEL]  [--description TEXT]  [--specialty TEXT]  [--tag TAG...]  [--formula EXPR | --attr KEY=VALUE... --tool NAME...]  [--profile-addendum TEXT | --profile-addendum-file PATH]
                                                       # --name: at most 200 characters, no control or text-direction characters
                                                       # (refused before sending, 1.21.0+, also on face:edit). Tags that fail after
                                                       # the face saved exit 1 (1.21.0+): the face exists, re-run face:tag:set.
faces face:list         [--has-style]  [--tag TAG...]  [--team TEAM_ID...]  [--include tags,teams,profile,sharing,avatar,usage,owner_follow]  [--public]  [--shared]  [--system]  [--from-users USER...]  [--not-from-users USER...]
                        [--search TEXT]  [--sort created|alias|relevance|usage]  [--order asc|desc]
                                                       # faces-cli 1.11.0+. --search matches alias, name and description.
                                                       # OMIT --order to keep each field's own direction: newest first for
                                                       # created, most used first for usage, best match first for relevance,
                                                       # A to Z for alias. Sending the direction a field already had looks
                                                       # like a no-op and flips the others.
                                                       # --sort relevance ranks against --search and needs one.
                                                       # --public = open to everybody; --shared = shared with YOU. Independent, and they
                                                       # compose. A face reachable both directly and via a workspace appears ONCE with
                                                       # both routes — never deduplicate. Faces you do not own print as owner:alias.
faces face:get          <alias | owner:alias>  [--include tags,teams,profile,sharing,avatar,usage]  [--full]
                                                       # prints `style: installed` when the face has a captured style.
                                                       # owner:alias is looked up through the LISTING, which is the only route that
                                                       # serves other accounts' faces. The listing can lag the resolver, so a miss
                                                       # is not proof of absence: a published face may answer chat before it is
                                                       # listed. Do not report a miss to a user as "no such face".
                                                       # a published or shared face resolves under owner:alias, the same address chat
                                                       # uses, and prints an `access:` line saying you do not own it: it can be
                                                       # chatted with or added to a team, but only its owner can edit it.
                                                       # A BARE alias can be answered by another account's published face of that
                                                       # name; 1.21.0+ compares the owner with you and shows it as not yours,
                                                       # with its owner:alias address. face:share --list does the same.
                                                       # Plain output shows the description and tags too (1.21.0+; before, only --json).
                                                       # A 404 on `me` is never "no such face": every account has its own `me`,
                                                       # made with the account, so a missing one is a server-side fault to report.
faces face:attributes
faces face:edit       <alias>  [--name]  [--default-model MODEL]  [--description TEXT]  [--specialty TEXT]  [--tag TAG...]  [--formula EXPR]  [--attr KEY=VALUE]...  [--tool NAME...]  [--profile-addendum TEXT | --profile-addendum-file PATH | --clear-profile-addendum]
                                                       # --formula on a face with compiled sources of its own, or one another
                                                       # composite uses, is a 409: make a new composite with face:create --formula
                                                       # instead. --formula "" turns a composite back into an ordinary face.
faces face:delete       <alias>  [--yes]
faces face:lock         <alias>              # freeze the face (read-only)
faces face:unlock       <alias>              # unfreeze the face (writable)
faces face:share        <alias>  (--list | --add ACCOUNT... | --with ACCOUNT... | --none)  [--yes]
faces face:unshare      <alias>  (--from ACCOUNT... | --all)  [--yes]
                                                       # --add keeps the current list; --with REPLACES it and refuses without --yes when
                                                       # that would drop someone. Accounts are usernames or emails, mixed freely; the
                                                       # stored list is canonical USERNAMES, so revoke by username even if you shared by
                                                       # email. Read the current list with --list (or shared_with on face:get).
                                                       # Sharing grants CHAT ONLY — not documents, compiling, re-sharing, or the addendum.
faces face:publish      <alias>  --yes        # every account can chat it; a global override on top of sharing
faces face:unpublish    <alias>
faces face:sources      <alias>  [--type doc|thread]
                                                       # STATUS reads `finishing` first: a source the server is still working on,
                                                       # including an automatic retry, shows `finishing` and needs NO action.
                                                       # GAVE is how much it contributed; 0 means it had nothing usable in it.
                                                       # A compiled source reads `compiled` (1.21.0+; before, `synced`), and an
                                                       # ID column gives the id every action on a row takes. In --json the
                                                       # `synced` boolean is unchanged.
                                                       # every source in the face, docs and threads in one table: label, tokens, status,
                                                       # medium, updated. Exits 4 for a face that does not exist, which is a DIFFERENT
                                                       # answer from a face with no sources (exit 0). Never prints content and never
                                                       # truncates. --json carries a stable id per row for later delete/recompile.
faces face:stats
faces face:diff         --face ALIAS  --face ALIAS  [--face ALIAS]...
                                                       # one overall similarity score (`face`) per pair. The API no longer returns
                                                       # per-component scores. Every face named needs something compiled.
faces face:neighbors    <alias | owner:alias>  [--k N]  [--component face]  [--direction nearest|furthest]
                                             # owner:alias works on the face routes from 1.10.0. The face being compared may
                                             # belong to another account; the faces it is ranked against are always your own.
                                                       # ranks on overall similarity; --component takes only `face` (a number is a 422).
                                                       # A face with nothing compiled is refused.
                                                       # --direction nearest (default) = most SIMILAR; furthest = most DIFFERENT / unlike / opposite

faces face:avatar:list    <alias | owner:alias>          # versions, which one is served, which no longer match the face.
                                                       # On a face you do not own it says so, and suggests no regeneration (1.21.0+).
faces face:avatar:get     <alias | owner:alias>  [--size sm|md|lg]  [--format png|svg]  [--width PX]  [--version N]  [--prefer organic|uploaded]  [--out PATH]
                                             # FREE. Writes the image and reports which version arrived, generated or
                                             # uploaded, and whether it still matches what the face knows.
faces face:avatar:make    <alias>  --allow-paid  [--seed N]
                                             # COSTS MONEY. Refuses without --allow-paid and sends nothing. Prints the
                                             # amount charged. --seed reproduces a particular avatar.
faces face:avatar:upload  <alias>  --file PATH          # your own picture: png, jpeg, webp, gif or bmp. Free; replaces any previous upload.
faces face:avatar:delete  <alias>  [--yes]              # removes only the UPLOAD. Generated versions stay and one is served again.

faces user:get           <username>           # name, follower counts, and whether you follow them
faces user:follow        <username>
faces user:unfollow      <username>
faces user:followers     <username>           # followed to the end, not just the first page
faces user:following     <username>

faces face:tag:list     <alias>
faces face:tag:add      <alias>  --tag TAG  [--tag TAG...]
faces face:tag:set      <alias>  --tag TAG  [--tag TAG...]
faces face:tag:remove   <alias>  (<tag> | --tag TAG)   # --tag like add and set (1.21.0+). A tag change
                                                       # that fails after the face saved exits 1 (1.21.0+).
faces face:tag:all
faces face:teams        <alias>  --team TEAM_ID  [--team TEAM_ID...]

faces chat:chat         <[+]alias | owner:alias>  -m MSG  [--llm MODEL]  [--system]  [--no-stream]  [--medium KIND]  [--best-of N]  [--reasoning | --reasoning-only]   # owner:alias@model for a published face, e.g. head:socrates@gpt-5.4
                                                       # --reasoning: the face's reasoning to stderr before the reply.
                                                       # --reasoning-only: that alone, no reply (1.13.0+).
                                                       # --cause TEXT | --cause-file PATH: supply the face's reasoning yourself;
                                                       # it answers on that, free of the reasoning charge (1.15.0+). Needs a model.
                                                       # Streamed by default (1.14.0+); --no-stream and --json are not, and
                                                       # wait out a warm-up 503 once by themselves. See "Streaming face chats".
                                                       # PREFIX THE ALIAS WITH + to answer in the style the face captured. Without it
                                                       # the face uses its ordinary voice; both are valid and the caller chooses per
                                                       # request. --medium selects WHICH captured style, since a face holds one per
                                                       # medium. + on a face with no style is a 409, not a fallback. Check
                                                       # with face:list --has-style, or drop the +.
                                                       # --best-of N (1-5) writes N replies and serves the closest to the style.
                                                       # It multiplies the cost by N, needs a + alias, and is never streamed.
                        [--max-tokens N]  [--temperature F]  [--file PATH]  [--responses]  [--oauth-only]
                                                       # --max-tokens is at least 1 (1.21.0+; before, 0 went out as no cap).
                                                       # --temperature is 0 to 2, checked before sending (1.21.0+; before, a
                                                       # value that was not a number was silently dropped).
                                                       # A streamed reply the model refused is reported as an error, not
                                                       # printed as an empty reply with exit 0 (1.21.0+).
                                                       # --medium declares WHAT THE WRITING IS so the reply is shaped for the occasion.
                                                       # ELEVEN VALUES, SPELLED EXACTLY: email, text message, social post, essay,
                                                       # academic paper, blog post, legal document, thread reply, conversation,
                                                       # lecture, other. It is NOT tone or style.
                                                       # Which one to reach for: `conversation` is dialogue — a transcript, an
                                                       # interview, a call. `lecture` is sustained speech nobody interrupts — a
                                                       # talk, a sermon, a keynote. `other` is writing in none of the named forms.
                                                       # THOSE ARE DESCRIPTIONS, NOT ACCEPTED INPUTS: send the value itself.
                                                       # There are NO SYNONYMS any more. `transcript`, `keynote`, `sms` and the
                                                       # other 32 aliases used to fold and are each a 422 on compile now.
                                                       # OMIT IT IF YOU DO NOT KNOW — never infer it from the text. A wrong
                                                       # declaration is worse than none, because a declaration is trusted.
                                                       # On CHAT the medium picks WHICH CAPTURED STYLE answers, so it does nothing
                                                       # without a `+` alias; with one, a medium the face has no style for is
                                                       # refused naming the ones it has. Omitting it classifies one from the text.
                                                       # On COMPILE it is required and the spelling is held to exactly.
faces chat:messages     <alias@model | owner:alias@model | model>  -m MSG  [--system]  [--no-stream]  [--max-tokens N]  [--medium KIND]  [--oauth-only]  [--reasoning]  [--cause TEXT | --cause-file PATH]
faces chat:responses    <alias@model | owner:alias@model | model>  -m MSG  [--instructions]  [--max-tokens N]  [--temperature F]  [--no-stream]  [--medium KIND]  [--oauth-only]  [--reasoning]  [--cause TEXT | --cause-file PATH]
                                                       # --max-tokens (at least 16) and --temperature from 1.21.0.
                                                       # These two send the model as typed. A bare alias gets the face's
                                                       # reasoning only, no reply (printed in its place, with a note).
faces chat:thread       <alias | owner:alias>  -m MSG  [--llm MODEL]  [--system]  [--file PATH]  [--max-tokens N]  [--temperature F]  [--no-stream]  [--medium KIND]  [--oauth-only]  [--reasoning]  [--cause TEXT]   # start a new thread
                                                       # --medium is per REQUEST, not per thread: send it on each turn you want shaped.
faces chat:thread       --id THREAD_ID  -m MSG  [--max-tokens N]  [--temperature F]  [--no-stream]  [--oauth-only]  [--reasoning]  [--cause TEXT]  # resume a thread
faces chat:thread       --list                                                                                                                    # list saved threads
faces chat:thread       --id THREAD_ID  (--show | --delete [--yes])                                                                                # show transcript / delete

faces compile:import       <alias>  --url YOUTUBE_URL  [--type document|thread]  [--medium KIND]  [--perspective first-person|third-person]  [--face-speaker LABEL]  [--no-wait]
                                                       # --medium is required with --type document and refused with thread (1.16.0+).
                                                       # --perspective defaults to third-person here: pass first-person when the
                                                       # subject is the speaker.
faces compile:upload       <alias>  --file PATH  [--kind document|thread]  [--medium KIND]  [--perspective first-person|third-person]  [--face-speaker NAME]  [--no-wait]
                                                       # --medium is required with --kind document and refused with thread (1.16.0+).
                                                       # --perspective defaults to third-person here: pass first-person for the
                                                       # subject's own writing.
                                                       # Accepts text, PDF, Word (.docx), audio and video. Text is extracted server-side.
                                                       # Legacy .doc is refused (400) — save it as .docx first. A .docx with no text 422s:
                                                       # images and text boxes are not read, only document text.

faces compile:doc          <alias>  (--content TEXT | --file PATH...)  --medium KIND  [--label]  [--perspective first-person|third-person]  [--timeout N]  [--no-wait]
                                                       # --file is repeatable: each file becomes its OWN document (not concatenated).
                                                       # Returns {"documents":[{file, document_id}...]} in input order; a bad file is
                                                       # reported in place and the rest still compile. --label is single-document only.
                                                       # A document SAVED but then refused at compile keeps its document_id, with
                                                       # `saved: true` and an error starting "saved, but not compiled" (1.21.0+;
                                                       # before, it read as never accepted although face:sources listed it).
                                                       # Fix and compile:doc:make it rather than uploading it again.
                                                       # Text only — for PDF, Word (.docx), audio or video use compile:upload.
                                                       # --medium on compile:upload applies to --kind document only.
faces compile:doc:create   <alias>  [--label]  (--content TEXT | --file PATH)  --medium KIND  [--perspective first-person|third-person]
                                                       # 1.21.0+ (and compile:doc:edit): --content and --file are exclusive, and a
                                                       # file that is empty, whitespace only, binary, a known non-text format or
                                                       # not UTF-8 is refused before sending. Before, Latin-1 text was saved with
                                                       # characters replaced: convert it to UTF-8 on an older CLI.
                                                       # --medium is required: the server will not save a document without one (1.16.0+).
faces compile:doc:make     <doc_id>  [--timeout N]  [--no-wait]
faces compile:doc:pause    <doc_id>  [--no-wait]  [--timeout N]
faces compile:doc:reset    <doc_id>  [--yes]
faces compile:doc:list     <alias>  [--verbose]
                                                       # document text is omitted unless --verbose (--json always includes it)
faces compile:doc:get      <doc_id>  [--status-only]   # --status-only leaves out the text: a few hundred bytes rather than the
                                                       # whole document, which was 21KB in one measurement and grows with it. Poll with it.
faces compile:doc:edit     <doc_id>  [--label]  [--content TEXT | --file PATH]  [--medium KIND]  [--perspective first-person|third-person]
                                                       # A document's medium can be changed, never cleared.
faces compile:doc:delete   <doc_id>  [--yes]

faces compile:thread:create   <alias>  [--label]  [--oauth-only]
faces compile:thread:list     <alias>
faces compile:thread:get      <thread_id>  [--status-only]  # --status-only leaves out the messages: a few hundred bytes rather than
                                                       # every message, 120KB in one measurement. Poll with it.
faces compile:thread:edit     <thread_id>  [--label TEXT]  [--medium KIND | --clear-medium]  [--face-speaker NAME]
                                                       # --medium corrects what a thread is READ as, and sticks. Use it on an imported
                                                       # corpus room whose messages declared nothing (it shows as medium `unknown`,
                                                       # which is not a medium and contributes no style). --clear-medium removes the
                                                       # correction. What the corpus arrived as is never overwritten.
faces compile:thread:replace  <thread_id>  --file PATH  [--face-speaker NAME]
                                                       # REPLACE every message in a thread, keeping its id. This is how a GROWING
                                                       # conversation stays ONE thread: send the whole transcript again and
                                                       # compile:thread:make it, instead of uploading each new stretch as another
                                                       # thread. Takes the same "SPEAKER: text" transcript compile:upload --kind
                                                       # thread accepts, or a JSON array of {role, content, name}; which one is
                                                       # detected and reported. `name` is the speaker label. An input file may
                                                       # still say `from` and the CLI maps it, but the API itself rejects `from`
                                                       # outright, so faces-cli BELOW 1.10.0 cannot run this command at all:
                                                       # every call is a 422. Check with `npm list -g faces-cli`.
                                                       # Writes content only — nothing generated, nothing
                                                       # billed. Refuses an empty file rather than emptying the thread, and (1.21.0+)
                                                       # a --face-speaker that names nobody in the transcript; before, that was
                                                       # saved with no lines from the face, so check compile:thread:get after.
faces compile:thread:message  <thread_id>  -m MSG  [--oauth-only]
                                                       # NOT the same thing: this INTERVIEWS the face — it appends your message AND
                                                       # generates a reply, and it bills. Use :replace to update content.
faces compile:thread:make     <thread_id>  [--timeout N]  [--no-wait]
faces compile:thread:pause    <thread_id>  [--no-wait]  [--timeout N]
faces compile:thread:reset    <thread_id>  [--yes]
faces compile:thread:delete   <thread_id>  [--yes]

faces style:upload      <alias>  <file>  [--type jsonl|email_jsonl|thread_json]  [--messages-per-room N]  [--strict]
                                                       # load a corpus of the person's OWN writing (mail, messages, anything with
                                                       # one JSON object per line: author, sender, date, snippet; see "Corpus
                                                       # line format" below). Stores only: nothing compiled, nothing billed.
                                                       # Invalid rows are skipped and reported; --strict refuses the whole file.
                                                       # UPLOAD ONE MEDIUM PER FILE. The output line `medium:` is what the rooms
                                                       # were actually stamped with; `none` means they teach NO writing rules and
                                                       # cannot be asked for by medium later. Check it, do not assume it.
                                                       # --messages-per-room sets the ROOM size, and a room is the unit a style is
                                                       # learned from. Set it ABOVE the length of a conversation you want kept
                                                       # whole; the default 50 slices a long one into arbitrary fragments.
faces style:make        <alias>  (--all | --source ID[:MEDIUM]...)  [--medium KIND]  [--model MODEL]  [--allow-paid]  [--no-compile]  [--best-of N]  [--timeout N]  [--no-wait]
                                                       # capture how the face writes and install it. --all takes every document and
                                                       # every thread that is ready, INTERVIEW THREADS INCLUDED, and --medium stamps
                                                       # any of them that declare none; live threads still compiling are skipped and
                                                       # named. Prefer --source when the face has anything but the subject's own
                                                       # writing in one medium. Each medium is analysed separately, so an essay never teaches a rule
                                                       # about email. A source that does not declare a medium is REFUSED, not
                                                       # guessed — declare it with --medium (all) or --source ID:MEDIUM (one).
faces style:status      [JOB_ID]  [--face ALIAS]  [--limit N]  [--wait]  [--timeout N]
                                                       # exits 1 for a failed job (1.21.0+; before, --wait exited 0 on one).
                                                       # read one build, or list a face's builds. Listing is how you recover a job id.
                                                       # MEDIUM says what the build is for, stamped at creation so it is there on the
                                                       # first poll. A build started for several shows them all; one started before
                                                       # this was recorded shows `-`. A build can be started from anywhere, so this
                                                       # is the only way to name one this client did not start.
faces style:versions    <alias>                        # (1.21.0+ says when the face is another account's: only its owner captures.)
                                                       # what has been captured, per medium, and which is in use. SOURCES is how
                                                       # many the build behind each version read, so a Revert confirmation can say
                                                       # what it goes back to. SEVERAL can be in
                                                       # use at once — one per medium — and version numbers restart per medium.
                                                       # REVERTABLE says whether style:revert would succeed. Exits 4 for no such
                                                       # face; a face with no style yet exits 0 and says so.
faces style:revert      <alias>  [--medium KIND]  --yes # toggle between the two versions kept for a medium: running it again returns
                                                       # to where you started. A face holds one style PER MEDIUM, so --medium is
                                                       # required once it has more than one (see style:versions). Requires --yes.
faces style:delete      <alias>  [--medium KIND | --all]  [--yes]
                                                       # forget a captured style. A face holds ONE PER MEDIUM: name which with
                                                       # --medium, or --all for every one. An unscoped delete on a face with
                                                       # several is REFUSED rather than taking them all.
                                                       # NEVER deletes documents, threads or uploaded material. To delete source
                                                       # text use compile:doc:delete; to withdraw a source from the face while
                                                       # KEEPING it, use compile:doc:reset / compile:thread:reset.

faces catalog:doctor      [--fix]  [--generate]
faces catalog:list
faces catalog:backup                                   # uploaded threads and style corpus rooms included (1.21.0+)
faces catalog:restore     [FILE]  [--compile]          # exits non-zero listing anything it could not restore, and says
                                                       # when FILE is not a backup (1.21.0+)
faces catalog:manyfaced   [--skill NAME]  [--install NAME --skills-dir PATH]  [--refresh]

faces compile:all         [--timeout N]
faces compile:status      [--watch]  [--interval SECONDS]
                                                       # faces-cli 1.12.0+. What is compiling on the ACCOUNT, grouped by face,
                                                       # in one small call: 123 bytes idle against 2.1MB for the document list.
                                                       # --watch polls until nothing is in flight, then exits.
                                                       # Branch on sources_active. 0 means nothing is RUNNING, not nothing
                                                       # outstanding: paused sources are listed apart in `paused` (printed
                                                       # from 1.20.0), one the server is retrying is counted. Not compile:stats, which
                                                       # is this month's compile usage against the allowance.

faces keys:create   --name  [--expires-days N]  [--budget F]  [--face ALIAS]...  [--model NAME]...  [--no-save]
                                                       # --expires-days 1 to 36500. --budget is a lifetime cap in plain dollars
                                                       # (5 or 0.50; anything else is refused). --face limits CHAT to those
                                                       # aliases; other faces can still be read. --model limits the models.
                                                       # Below 1.20.1 every one of these limits is refused by the API.
faces keys:list
faces keys:revoke   <key_id>  [--yes]                  # 1.21.0+ also removes it from the config when it is the saved api_key
faces keys:update   <key_id>  [--name]  [--budget F]  [--reset-spent]

faces billing:balance
faces billing:subscription                             # plan (free|connect|pro|team), and on a paid plan a meter of each allowance.
                                                       # allowances.*.limit < 0 in --json means UNLIMITED (Team), never "used up".
faces billing:subscription:activate  [--plan connect|pro]    # alias billing:subscribe. First subscription, or reactivate.
                                                       # With no --plan, a plan set to cancel is kept (1.21.0+; before, it
                                                       # defaulted to connect, which a Pro user did not want).
faces billing:subscription:plan      <connect|pro>  [--yes]  # already subscribed: switch in place, prorated (1.17.0+).
                                                       # Refused while the plan is set to cancel (1.21.0+): keep it first.
faces billing:subscription:cancel    [--yes]
faces compile:stats                                    # plan, compile source tokens this month against the allowance, and the
                                                       # pay-as-you-go rate (1.18.0+; older versions call a retired endpoint).
                                                       # Per-face numbers: face:stats.
faces billing:usage      [--group-by api_key|model|llm|date]  [--from DATE]  [--to DATE]
                                                       # 1.21.0+ prints a table (requests, tokens, cost, total) and refuses a
                                                       # date that is not a real YYYY-MM-DD or a --from after --to. Before, a bad
                                                       # date gave an empty report and exit 0. COST is what you were charged; a
                                                       # COVERED column (absorbed_cost_usd) is what Faces paid on your behalf.
faces billing:topup      --amount F  [--card PM_ID]  [--payment-ref REF]  [--yes]  [--allow-duplicate]
                                                       # charges a card: from an agent it needs --yes (1.21.0+). --amount must be a
                                                       # plain dollar amount (5 or 0.50); anything else is refused (1.21.0+).
                                                       # A repeat of a recent top-up is a 409 duplicate_topup and nothing is
                                                       # charged. Check billing:balance; only if the user confirms, repeat it with
                                                       # --allow-duplicate (1.21.0+). --yes does not imply it.
faces billing:cards                                    # saved cards, newest first; one is the default (1.17.0+)
faces billing:card-setup [--no-default]                # alias billing:card:add: a Stripe link to save a card
faces billing:card:default  <PM_ID>
faces billing:card:remove   <PM_ID>  [--yes]
faces billing:llm-costs  [--provider openai|anthropic|qwen|...]
                                                       # 1.21.0+: one line per model by lab, prices per million tokens, your spend,
                                                       # the markup from each row's markup_rate, then compile and reasoning prices.
                                                       # one row per model, under its lab's id. --provider is the LAB (the row's
                                                       # `lab`) that made it, never the service that runs it.

faces team:create       --name  [--description TEXT]  [--protocol TEXT]  [--protocol-file PATH]  [--tag TAG...]
                                                       # --protocol-file drops a leading frontmatter block, so a TEAM.md can be
                                                       # passed as it is (1.21.0+). Before, the file was stored as written.
faces team:list
faces team:get          <team_id>
faces team:edit       <team_id>  [--name]  [--description TEXT]  [--protocol TEXT]  [--protocol-file PATH]
faces team:delete       <team_id>  [--yes]             # 1.21.0+ also removes the local TEAM.md
faces team:members      <team_id>                      # FACE / STATUS / ID. A member you do not own can become unreachable when its
                                                       # owner revokes access or deletes it; it stays LISTED with the reason rather
                                                       # than vanishing, so the team never silently changes shape. "access was
                                                       # revoked" can be undone by the owner; "the face was deleted" cannot.
faces team:add          <team_id>  --face ALIAS | owner:alias  [--face ...]
                                                       # Any face you can reach may join: your own, a published one, or one shared
                                                       # with you. Name someone else's as owner:alias, the same address chat uses.
                                                       # Never create a copy of a face to put it in a team — a copy is a different
                                                       # face with different compiled material that then drifts from the original.
faces team:remove       <team_id>  <alias>

faces team:tag:list     <team_id>
faces team:tag:add      <team_id>  --tag TAG  [--tag TAG...]
faces team:tag:set      <team_id>  --tag TAG  [--tag TAG...]
faces team:tag:remove   <team_id>  <tag>

faces account:state
faces account:preferences [KEY] [VALUE]  [--allow-paid]
                                                       # KEY: api_fallback, default_model, auto_style, auto_style_thresholds.
                                                       # auto_style on|off|default. Turning it on off Connect and Pro bills per capture,
                                                       # so it is refused there without --allow-paid. 1.13.0+ for auto_style*.

faces decide (<alias> | --baseline)  (--state TEXT | --state-file PATH)
                      [--question TEXT [--type noul|choice|score] [--option NAME[=DESCRIPTION]... | --level DESCRIPTION...] [--id KEY] | --questions-file PATH]
                      [--model jev-latest|clef|clef-flash]  [--reasoning]  [--no-retry]
                                                       # faces-cli 1.18.0+. Jev's typed answers, as this face, or with no
                                                       # face for --baseline. A face with no questions gives its reasoning
                                                       # alone. A .json --state-file is sent as JSON. See Decisions.
                                                       # 1.21.0+: --model is checked against GET /v1/models?kind=decision
                                                       # (any case; sent as the catalog spells it), and at most 10 questions
                                                       # with a face, 32 with --baseline, 2 to 255 options a choice, are
                                                       # checked before a face is asked to reason.

faces config:set    <key> <value>                      # keys: base_url, api_key, token, user_id, catalog, catalog_model,
                                                       # credentials_base_url. 1.21.0+ refuses any other key (naming the closest)
                                                       # and a base_url that is not an http(s) URL.
faces config:show
faces config:clear  [--yes]
```

## Default model (`--default-model`)

The `--default-model` flag on `face:create` and `face:edit` sets the LLM used when no `--llm` override is provided to `chat:chat`. Without a default model, the face inherits the user's account-level default model (set via `account:preferences`).

```bash
faces face:create --name "Ada" --alias ada --default-model gpt-5.4-mini
faces chat:chat ada -m "hello"    # uses gpt-5.4-mini automatically
```

The user's account default model can be viewed and changed with:

```bash
faces account:preferences                            # show current preferences
faces account:preferences default_model gpt-5.4      # set default model
```

New faces inherit the account default model at creation time (one-time copy, not a live link). Changing the account default does not update existing faces.

## Chat auto-routing

`chat:chat` routes each request to the right API endpoint off the model catalog (`GET /v1/models`, cached locally ~1h) — no model name needs to be hardcoded:

| Model class | Endpoint | Response shape |
|-------------|----------|----------------|
| `gpt-5.x` / codex (`gpt-5.2`, `gpt-5.4`, `gpt-5.3-codex`, `gpt-5-nano`, …) | `/v1/responses` | OpenAI Responses (`output` / `output_text`) |
| `claude-*` | `/v1/messages` | Anthropic Messages |
| everything else (`gpt-4o`, xai, qwen, z-ai, …) | `/v1/chat/completions` | OpenAI ChatCompletion |

**One model, one name.** `GET /v1/models` lists each model once, under the id its lab gives it,
and its `provider` (and `owned_by`) is that **lab**: `openai`, `anthropic`, `xai`, `qwen`,
`z-ai`, `moonshot`, … Which service actually runs a model is the platform's choice, can change
without notice, and is never shown, so do not group, label or reason about models by host. A
model's price is the same whichever service runs it; read it from `faces billing:llm-costs`
rather than writing it down. Old host-prefixed ids (`openai-gpt-52`, `z-ai-glm-5-3-flash`) are
still accepted in any case, in requests, `--default-model` and API-key model lists, and resolve
to the public id (`gpt-5.2`, `glm-5-3-flash`). Do not offer them. The free route is
`codex_eligible: true` on the one entry; the separate `openai_oauth` copies are gone.

For a bare alias (no `@model`) the CLI resolves the face's `default_model` (local catalog, else `GET /v1/faces`) to pick the endpoint, and on `chat:chat` and `chat:thread` (faces-cli 1.13.0+) sends `alias@default_model`, because the API answers a bare alias with the face's reasoning only. A face with no `default_model` is refused before sending: name the model, or use `--reasoning-only` for the reasoning alone. A bare alias only ever resolves **your own** faces; a namespaced `owner:alias` (e.g. `head:socrates`) addresses a published face owned by another account — see [System & published faces](#system--published-faces). System faces have no `default_model`, so they always require an explicit `@model`.

**Models with `codex_eligible: true` are free when a ChatGPT account is linked** (Connect or Pro; `gpt-5.6-luna`, `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-6-astra`, `gpt-6-luna` and `gpt-6.1-sol` today), otherwise billed at the paid API rate. `gpt-5-mini`, `gpt-5.4` and the rest of gpt-5 through gpt-5.5 are always paid. The endpoint and response are the same either way. A connect-plan user with no linked token (and `api_fallback` off) gets a 422 on codex; the CLI then suggests `faces auth:connect openai`.

`codex_eligible` says a model **can** run on ChatGPT, not that the user's ChatGPT plan serves it. A
plan that does not answers `422 model_not_supported`; pick another model, or allow paid fallback.

`--responses` forces the Responses endpoint as an escape hatch; routing is automatic otherwise. In `--json` mode the response includes a `_meta` block with `provider` (the model's lab), `billing` (`oauth` or `credits`, 1.13.0+) and `cost_usd` (a string); `chat:chat` adds `endpoint` and `model`. **`billing` is how to tell free from paid.** `provider` used to read `openai-codex` on a free call and no longer does.

`chat:messages` (always `/v1/messages`) and `chat:responses` (always `/v1/responses`) remain available for direct, single-endpoint access.

**Only chat models route a chat.** Each `GET /v1/models` entry has a `kind`: `chat`, `image`,
`transcription`, `decision`, `cause` or `compile`. With no `?kind=` the list is chat models only;
pass one kind or a comma list (`?kind=chat,image`), or `?kind=all`. An unknown kind is a `422`.
`faces-compile-latest` (`?kind=compile`) prices compiling: $28 per million source tokens, with
`included_tokens_per_month` per plan. faces-cli 1.18.0+ routes chats only to `kind: chat`
models, and a chat that names a decision model (`alias@jev-latest`, `clef`, `clef-flash`) is
refused before sending: use `faces decide`.

## The `me` face

Every account has one face with the alias **`me`**: the account's own face, made with the
account. The alias is literally `me` (there is no `@me`). Another account's is
`<username>:me`, readable only if that account published or shared it.

- **It starts with the account's name only**: no description, attributes or default model, and
  not published. Until a source is compiled for it, its reasoning is a `409` ("nothing
  compiled"), and a reply needs a model named (`me@gpt-5.4-mini`).
- **Edit it like any face**: `faces face:edit me --name ... --description ... --attr key=value`
  (`faces face:attributes` lists the keys). Its alias cannot change; no face's can (`422`).
- **It cannot be made or removed**: creating another face aliased `me` is a `400`, and
  `face:delete me` is refused. Publishing, sharing, locking, tags and teams work as for any face.
- **Nothing goes to it by itself**: uploads, compiles and style captures go to whichever face is
  named. `faces style:upload me <file>` then `faces style:make me --all` captures the user's own
  writing style.
- **A 404 on `me` is a fault on the server**, never "no such face": some accounts made before it
  was created with every account still lack one. Say so plainly and report it (see
  [CONTRIBUTING.md](CONTRIBUTING.md)); faces-cli 1.21.0+ says the same on `face:get`, `face:edit`,
  `face:delete` and chat.

## System & published faces

Besides your own faces, the platform serves a curated set of **system faces** under the `head` account, available to every account. Discover them (and any other public faces) with `face:list`:

| Command | Shows |
|---|---|
| `faces face:list` | your own faces (default — unchanged) |
| `faces face:list --public` | your faces **plus** all published faces from other accounts |
| `faces face:list --system` | only the curated system faces (owned by `head`) |
| `faces face:list --from-users alice,bob` | only published faces from these owners |
| `faces face:list --not-from-users head` | published faces, excluding these owners |

`--from-users` and `--not-from-users` are repeatable / comma-separated and **mutually exclusive**. In `--json`, published faces carry `published: true` and `owned_by` (the owner account). In the human-readable list they render as the chat handle `owner:alias` with a `[public · requires @model]` marker.

**Addressing a published face in chat** uses an `owner:alias` namespace, and the model is **required** (system faces have no `default_model`):

```bash
# System faces — owner:alias@model
faces chat:chat head:socrates@gpt-5.4 -m "Is this argument valid?"

# Your OWN faces stay bare — a bare alias only ever resolves your own catalog
faces chat:chat logician@gpt-5.4 -m "..."
```

The same `owner:alias@model` handle works on `chat:messages`, `chat:responses`, and `chat:thread`. A bare `head:socrates` (no `@model`) is rejected — always pin a model. Billing is unchanged: the **caller** pays inference at normal per-token rates; the face owner is never charged.

## Run-time composite faces

You can chat with a **composite of several faces composed on the fly**, without first persisting it with `face:create --formula`. Put a Face Math formula in the face position (the part left of `@`):

```bash
# Pass-through: type the formula directly where you'd name a face
faces chat:chat "(socrates | nietzsche)@claude-sonnet-4-6" -m "What is virtue?"

# --formula convenience: the CLI assembles (expr)@model for you
faces chat:chat --formula "socrates | nietzsche" --llm claude-sonnet-4-6 -m "What is virtue?"
```

The backend merges the operand faces' knowledge per request, the same merge a persisted composite does, so latency is effectively identical. Works on `chat:chat`, `chat:messages`, and `chat:responses`, on a face's reasoning alone (`chat:chat "(a | b)" --reasoning-only`, or `--formula` with no `--llm`; faces-cli 1.21.0+), and on `faces decide "(a | b)"`. A saved composite works the same way on all of them. Pricing is the same as one face. Purely additive: single faces (`alias@model`), published faces (`owner:alias@model`), and bare models all behave as before.

Operators (same as persisted composites): `|` union, `&` intersection, `-` difference, `^` symmetric diff. Parentheses group and nest, e.g. `((a | b) & c)@gpt-5.4`.

**Naming.** A run-time composite has no name of its own, so it **takes the name of its first operand** — `(socrates | nietzsche)@model` answers as *Socrates*. The operand order therefore matters for identity, not just for union conflict-resolution. If you want the blend to have its own distinct name, persist it instead with `face:create --alias … --formula …`, which creates the composite as a named face.

Rules the CLI surfaces:

- **A reply needs an explicit `@model`**: a run-time composite has no `default_model`. A bare `(a | b)` asking for a reply is rejected locally with a "specify a model" message before any round-trip; pass `@model` or `--llm`. Its reasoning alone (`--reasoning-only`) needs no model.
- **An empty result is a `422 empty_composite`**: `{"detail": {"error_code": "empty_composite", "message": "the intersection between these two faces is null"}}`. Match on `error_code` and show `message` as it is. A composite with nothing compiled is a `409`: each face in it needs a source.
- **Operands must be your own, concrete faces.** Unknown/unowned → `404 Composite references unknown or unowned face`. A synthetic/composite operand → `422 Composite operands must be concrete faces, not synthetic` (compose from concrete faces only; no nesting persisted composites). Bad syntax → `422 Composite formula syntax error`.
- **Difference needs spaces:** `a - b` (a dash between alphanumerics, `news-bot`, stays one alias).
- **Aliases starting with a digit can't appear in a formula** (`2pac`) — single-face `2pac@model` still works, only the formula path is limited.
- **No `owner:alias` operands inside a formula yet** — run-time composites are over your own faces only (`(me:a | you:b)` → 422).

Billing is unchanged (the caller pays, the usage ledger records the formula string as the model label). Scoped API keys are enforced **per operand**: a key restricted to specific faces may use a composite only if it can access *every* operand, else a 403 naming the disallowed operand.

The curated set is **dynamic** — faces are added and retired without notice, so never hardcode it or copy a list from documentation. Read the current set with `faces face:list --system`.

## Multi-turn threads (`chat:thread`)

`chat:chat`, `chat:messages`, and `chat:responses` are stateless — each call is a single turn with no memory. `chat:thread` adds persistent, resumable conversation history so a face remembers earlier turns.

Conversation state is stored **locally** (no server-side session) at `~/.faces/threads/<id>.json` (created `0700`, files `0600`). Each turn the full message history is replayed to the model, so the face stays coherent across many turns. Threads are not part of `catalog:backup`.

```bash
# Start a new thread — needs a face alias. Prints the assistant reply + a thread id.
faces chat:thread socrates -m "What is justice?"
#   …reply…
#   [thread t_abc123  ·  2 turns]

# Resume by id — the face remembers the earlier turns
faces chat:thread --id t_abc123 -m "Say more about that"

# Manage threads
faces chat:thread --list                  # all saved threads, newest first
faces chat:thread --id t_abc123 --show    # full transcript (system + every turn)
faces chat:thread --id t_abc123 --delete --yes  # remove the local thread file (--yes: 1.21.0+ asks first)
```

**Message input:** provide the user message with `-m/--message` or read it from a file with `--file PATH` (one or the other is required when sending).

**`--llm` and `--system` are start-only.** They are read **only when starting a new thread** and then frozen onto the thread:
- `--llm MODEL` sets the model for the whole thread. Starting with `--llm` pins the model as `alias@MODEL` (e.g. `socrates@claude-haiku-4-5`); without it, the thread resolves the face's `default_model` and pins that as `alias@MODEL` (faces-cli 1.13.0+; a thread saved earlier with a bare alias is moved onto its default model on the next turn). Either way the endpoint is resolved once (via the same [auto-routing](#chat-auto-routing) as `chat:chat`) and **cached on the thread**, so every resume hits the same provider/endpoint.
- `--system TEXT` sets a system prompt stored on the thread and re-sent every turn (as Anthropic `system`, Responses `instructions`, or a Chat Completions `system` message, depending on the routed endpoint).
- Passing `--llm` or `--system` together with `--id` (resume) prints a warning and **ignores them** — the values stored on the thread always win. To change the model or system prompt, start a new thread.

**The face's reasoning adds up across turns** (faces-cli 1.13.1+). Each assistant turn on the thread keeps the face's cause, and every resume sends it back exactly as the endpoint returned it: `cause` on a chat completions turn, the `rs_faces_…` reasoning item before a responses message, the `faces-reasoning` thinking block on a messages turn. The face then builds on its earlier thoughts instead of starting fresh; the server carries the last 10. Nothing has to be stripped. If you build a transcript yourself against the API, do the same: send back what was returned. `--reasoning` shows each turn's cause on stderr. `--cause TEXT` (or `--cause-file PATH`) on a turn supplies that turn's cause instead of letting the face reason (1.15.0+); it is kept on the thread the same way, and later turns build on it.

**Per-turn flags** (honored on every send, new or resumed): `--max-tokens N` (Anthropic defaults to 1024 when unset), `--temperature F` (Chat Completions, and Responses from 1.21.0; a model that does not take it answers without it, and the CLI says so), `--no-stream` (turns are streamed by default from 1.14.0), and `--oauth-only` (see below). A refused turn is not saved, so the same message can be sent again on the thread.

**`--json` output** returns `{thread_id, model, provider, assistant, turns}`; `--list` returns an array of `{id, face, model, turns, created_at, updated_at}`; `--show` returns the full stored thread object.

## Streaming face chats

A face reasons about the conversation before it answers, and the reasoning can take a while.
How long a request may wait for it depends on whether it is streamed:

- **Streamed** (`"stream": true`): waits as long as it takes. If the reasoning runs past 20s the
  response starts `200` and sends `: keep-alive` comment lines every 10s until the answer
  begins. (The edge cuts a request that sends nothing for 50s; the keep-alives prevent that.)
- **Not streamed**: 35s, then a `503` with `Retry-After` (seconds) while the models warm from a
  cold start. Refused before any work, so nothing is charged; wait exactly that long and retry
  once.

From faces-cli 1.14.0 every `chat:*` command streams by default. `--json` is never streamed
(it returns the whole body with `_meta`), nor is `--best-of`; `--no-stream` turns it off. When
not streamed, the CLI waits out a warm-up `503` and asks once more by itself, saying so on
stderr. Do not wrap it in a retry loop of your own.

**When you call the API directly**, stream any chat with a face. If you cannot, honour
`Retry-After` on a `503`. A hand-written SSE reader has two jobs the OpenAI and Anthropic SDKs
already do:

1. **Skip every line that starts with `:`.** Those are the keep-alives.
2. **Treat an error event as a failure.** Once the `200` has gone, a late refusal can only
   arrive inside the stream, as one error event. Show its message and stop. Nothing was charged.

| endpoint | late refusal |
|---|---|
| `/v1/chat/completions` | `data: {"error": {"message": "...", "code": 503}}`, then `data: [DONE]` |
| `/v1/responses` | `event: error` with `{"type": "error", "code": "503", "message": "..."}` |
| `/v1/messages` | `event: error` with `{"type": "error", "error": {"type": "overloaded_error", "message": "..."}}` |

**Refusals.** A face's answer always comes with its cause now; where the cause cannot be given,
the chat is refused, never quietly answered without it. Every refusal ends "Nothing was charged."

| code | meaning | do |
|---|---|---|
| `409` | Compiled before reasoning launched (no face is in this state today). Also the reasoning alone (`"model": "alias"`, or `decide` with no questions) of a face with nothing compiled | Recompile, or give it a first source (`compile:upload`). Do not retry |
| `422` | No message in the conversation for the face to answer | Fix the request. Do not retry |
| `503` + `Retry-After` | Warming up (requests that are not streamed only) | Wait `Retry-After` seconds, then retry once |
| `503` | A step of the reasoning failed | Retry |

A face with **nothing compiled** still chats: it answers from its name, `profile_addendum` and
attributes, with no cause and no reasoning charge. A caller with no credit gets the `402` at
once.

## OAuth-only mode (`--oauth-only`): Connect and Pro

The `--oauth-only` flag and `api_fallback` preference only apply to **Connect and Pro** users who have linked their ChatGPT account via `faces auth:connect openai`. Pay-per-token users do not use OAuth, and cannot be OAuth-only: on pay-per-token (Free), `--oauth-only` on `chat:chat`, `chat:responses` or `chat:messages` is refused with `422` `error_code: "oauth_only_unavailable"` and nothing is charged; `account:preferences api_fallback false` is refused with a `422`; and reading the preferences reports `api_fallback: true` while the account is on Free.

What `--oauth-only` guarantees: the reply is not paid from credits. A request the ChatGPT route cannot serve (a model that is not `codex_eligible`, no link, a ChatGPT plan that does not serve it) is refused with `422 oauth_only_unavailable` and nothing is charged; a failed OAuth call returns a 422 instead of falling back to credits. The face's own reasoning still counts against the plan's allowance as usual. Available on `chat:chat`, `chat:messages`, `chat:responses`, `chat:thread`, `compile:thread:create`, and `compile:thread:message`.

The account-level equivalent is the `api_fallback` preference. When `api_fallback` is `false` (default for Connect and Pro; Free is always `true`), all requests behave as if `--oauth-only` is set: OAuth failures return 422 instead of falling back to paid keys. Set it to `true` to allow automatic paid fallback when OAuth fails.

```bash
faces account:preferences api_fallback false    # default: no fallback (Connect and Pro)
faces account:preferences api_fallback true     # allow paid fallback when OAuth fails
```

## Account preferences

Server-side preferences stored on the user's account. Viewed and modified with `account:preferences`:

| Key | Values | Default | Effect |
|---|---|---|---|
| `api_fallback` | `true` / `false` | `false` | When false, OAuth failures return 422 instead of falling back to paid system keys |
| `default_model` | any valid model | `gpt-5.4` | Model inherited by new faces that don't specify `--default-model` |
| `auto_style` | `on` / `off` / `default` | `default` | Capture each face's style automatically once it has enough of its own writing in a medium. `default` follows the plan: on for Connect and Pro (free), off for pay-per-token (bills per token when on). 1.13.0+; before 1.21.0 the CLI treated Pro as pay-per-token here and refused `on` without `--allow-paid` |
| `auto_style_thresholds` | `medium=words,...` | 10,000 / 15,000 | Words of the face's own writing before a capture runs, per medium. At least 500; `default` resets one. Merged into what is stored. 1.13.0+ |

Read back, `auto_style` is the **effective** answer (is it running now) and
`auto_style_setting` is what was stored, `null` meaning the plan's default. The human output
says which, and whether it costs anything. `auto_style_thresholds` lists every medium with
defaults filled in. `other` appears there but is never captured automatically.

**Leave `auto_style` alone unless the user asks.** Its cost depends on the plan, and on
pay-per-token every automatic capture bills; the CLI refuses `auto_style on` there without
`--allow-paid`, and sends nothing when it refuses.

## Decisions (`decide`)

*Requires faces-cli 1.18.0 or newer.*

Chat gives you what a face would **say**. `faces decide` gives you what it would **decide**:
describe a situation, ask typed questions about it, and get back numbers, as this face. It is
TypeSafe's Jev API exactly (same `state`, `questions` and answers, same confidence formulas),
with a face in it. It needs faces-cli 1.18.0.

On the API this format is `POST /v1/systemone`. `POST /v1/decisions` takes OpenAI's Decisions
format instead (`input`, and `questions` as an array of `{type: predicate|choice|score, name,
instructions, choices|levels}`, answered with `answers` as an array). Each path refuses the
other's format with a `422` naming the right one, and a face alone (`"model": "alice"`, no
questions) works on both.

```bash
faces decide alice --state "A colleague asks you to put your name on a grant proposal you have not read, due in an hour. They say it is a formality." \
  --question "Does the speaker sign the proposal?" \
  --option yes="signs it as asked" --option no="declines to sign" --option later="asks for time to read it first"
# answer: no, confidence 0.90
#   no      96.6%  ###################
#   later    2.6%  #
#   yes      0.9%
```

Three question types. With `--question`, the type follows from the flags, or say it with `--type`:

| Type | Flags | Answer (`--json`) |
|---|---|---|
| `noul` | neither `--option` nor `--level` | `{type, noul}`: the probability of yes, 0 to 1 |
| `choice` | `--option name="description"` (2 or more; a bare name sends no description) | `{type, choice, probabilities, confidence}` |
| `score` | `--level "description"` (2 to 10, lowest first) | `{type, score, legend, probabilities, confidence}`: the expected level, 0 to n-1 |

With `--json` the result is the API's own: `{"model", "answers", "usage", "cause", "causes"}`,
`answers` keyed by question id (`--id` renames the default `answer`). `model` comes back with
the decision model's versioned id (`alice@jev-1.13.0`).

For several questions (1 to 32), write them to a file in the API's shape and pass
`--questions-file`. A whole request body (`{"model", "state", "questions"}`) also works; its
`questions` are used:

```json
{"sign":  {"type": "choice", "instructions": "Does the speaker sign?", "criteria": {"yes": "signs it as asked", "no": "declines to sign", "later": null}},
 "irked": {"type": "noul", "instructions": "Is the speaker irritated?"},
 "firm":  {"type": "score", "instructions": "How firm is the reply?", "criteria": ["yields", "hedges", "firm"]}}
```

A noul's `criteria` are optional, `{"true": "...", "false": "..."}`. `instructions` may be a
string, an object or an array. The old `{instructions, options}` shape is a `422`.

- **`--state`** is the turn the face is answering, up to 60,000 characters. Write it the way
  the face would hear it. `--state-file` reads it from disk; a `.json` file is sent as the JSON
  it holds, so the state can be an object or an array.
- **Criteria do the work.** `no` alone is ambiguous; `declines to sign` is not. Keep choice
  options mutually exclusive, because the probability is split between them.
- **`--model`** picks the **decision model** (default `jev-latest`): the model that answers
  your questions over the situation and the face's reasoning, as opposed to a generative model
  that writes text. On the wire this is `face@decision-model`, e.g. `alice@clef-flash`. Call
  these "decision models" when talking to a user. The face can be a saved composite or a
  formula (`"(a | b)"`, sent as `(a | b)@jev-latest`), priced like one face; never a `+` alias.
  `faces-latest` is no longer a decision model: the API answers it with a `400`.
- **`--baseline`** asks the decision model alone (no-face baseline): exactly what Jev would say,
  in about a second, costing only the decision model. It is the number to compare a face's
  answer against (`no` at 0.99 from a face means more next to 0.63 from the baseline).
- **The face's reasoning** comes back in `cause` whenever a face is named: how it reads the
  situation, in its own voice, which is what the decision model reads beside the state.
  `causes` holds one per question, keyed by question id, each read from the situation with
  that question in mind, so with several questions they differ (`cause` is the first
  question's). `--reasoning` prints them to stderr in human output, under each question when
  they differ. Name a face and ask **no questions** for the reasoning alone (`{model, cause,
  usage}`). The field used to be `reasoning`; it is gone, and faces-cli 1.16.0+ reads `cause`.

**Timing.** A face's answer takes about 10 to 20 seconds; a baseline about one. A slow answer
is held open: past about 40 seconds the server answers `200` with the header `X-Faces-Held: 1`,
sends spaces to keep the connection alive, and then the JSON, which any JSON parser reads past
the spaces. Allow `faces decide` with a face at least 60 seconds. If the call fails after the
hold, the `200` carries `{"detail": ..., "error": {..., "status": <real status>}}` and no
`answers`: check for `error` before reading `answers` (faces-cli 1.19.0+ does, and reports the
real status). This applies to `/v1/decisions`, `/v1/systemone` and `/v1/causes`. After an idle
spell the models behind decisions start cold, and warming takes about two minutes. During the
warm-up every request is answered `503` at once with a `Retry-After` header (seconds); the CLI
waits **exactly** that and asks again, for up to five minutes in all, printing the wait to
stderr. `--no-retry` returns the 503 instead. Do not wrap it in your own retry loop. A `503`
with **no** `Retry-After` is a step or the decision model failing: retry, and if the message
names the decision model, another `--model` may answer.

**Cost.** The face's reasoning counts against a Connect or Pro allowance (past it,
`api_fallback` decides between billing credits and a `429`), or bills on Free. The decision
model is charged at the provider's cost plus 5% **on every plan**, so a decision needs credit
even on Connect and Pro: with none it is a `402`. Nothing is charged for a request refused before work starts (`400`, `402`, `403`,
`409`, `422`, `429`).

| Code | Meaning | What to do |
|---|---|---|
| `400` | `model` is not `face@decision-model`, a bare decision model or a bare face | Fix the request |
| `422 empty_composite` | The formula's result is empty, e.g. an intersection of faces with nothing in common | Show `message` as it is; use a formula whose result is not empty |
| `404` | No such face, or not yours to use | Check the alias |
| `409` | The face needs recompiling (not compiled since decisions launched) | Compile one of its sources again; not retryable as it is |
| `422` | Wrong shape: missing `type`, criteria that do not fit the type, questions with a bare face | Read the message |
| `402` | No credit for the decision model (on every plan) | `faces billing:topup --amount <USD> --yes`, once the user agrees |
| `429` naming an allowance | A reasoning allowance used up, `api_fallback` off | Wait for the reset, or turn on `api_fallback` |
| `429 Rate limit` | The account's per-minute limit | faces-cli 1.19.0+ waits `Retry-After` once; after that, wait the seconds named |
| `503` + `Retry-After` | Warming up from a cold start | The CLI waits it out; with `--no-retry`, retry after that many seconds |
| `503`, no `Retry-After` | A step or the decision model failed | Retry; another `--model` if the message names the decision model |

Decisions never answers `502`.

## Face description (`--description`)

The `--description` flag on `face:create` and `face:edit` sets a plain-text bio stored on the server (max 1500 chars). It is also synced to the local FACE.md catalog.

```bash
faces face:create --name "Ada" --alias ada --description "Theoretical physicist and first-principles thinker"
faces face:edit ada --description "Updated bio"
```

`catalog:doctor --fix` pulls descriptions from the server. `catalog:doctor --generate` creates descriptions via LLM and syncs them back to the server.

## Face specialty (`--specialty`)

A short line saying what the face is for, shown beside its name in listings and on its
card. Separate from `--description`, which is the bio.

```bash
faces face:create --name "Ada" --alias ada --specialty "first-principles physics"
faces face:edit ada --specialty "theoretical physics"
faces face:edit ada --specialty ""                   # clears it
```

`face:get` also reports `updated` — when the face itself last changed, which moves
independently of its compiled material — and `usage` with `--include usage`, which
carries 30-day user and token counts used for discovery sorting. Both are null unless
asked for, so their absence says nothing was requested rather than nothing happened.

## Per-face system prompt (`profile_addendum`)

A face can store an arbitrary system prompt (`profile_addendum`). At inference the backend assembles the instruction stack as **persona profile → profile_addendum → per-request system prompt**, so it's durable, face-level behavior that still leaves room for a per-call `--system`/`--instructions`. Applies on all three endpoints (`chat:chat`, `chat:messages`, `chat:responses`).

```bash
# Set on create (inline or from a file — file is friendlier for long prompts)
faces face:create --name "Support Bot" --alias support-bot --default-model claude-sonnet-4-6 \
  --profile-addendum "Always answer in under 3 sentences. Never promise refunds."
faces face:create --name "Support Bot" --alias support-bot --profile-addendum-file ./prompt.txt

# Replace or clear on an existing face
faces face:edit support-bot --profile-addendum "New instructions."
faces face:edit support-bot --profile-addendum-file ./prompt.txt
faces face:edit support-bot --clear-profile-addendum        # sends "" to remove it

# Inspect (owner only): preview + char count, or the whole prompt
faces face:get support-bot            # profile_addendum (58 chars): Always answer in under 3 sentences…
faces face:get support-bot --full     # dumps the full prompt
```

Rules:
- **Max 100,000 chars** (the CLI also checks locally before sending; over the limit → 422 from the server).
- **`--clear-profile-addendum` sends `""` to remove it**; omitting the flags leaves it unchanged (same semantics as `--description`). `--profile-addendum`, `--profile-addendum-file`, and `--clear-profile-addendum` are mutually exclusive.
- Formatting (blank lines, indentation) is preserved; control chars are stripped and CRLF→LF normalized.
- **Proprietary:** returned only for your **own** faces, never on published/cross-user listings, and not echoed back in chat responses.
- **Composites:** a persisted composite uses its own `profile_addendum`; a run-time composite `(a | b)@model` borrows the **first operand's**. There's no way to pass one inline on a run-time composite — persist it if you need a bespoke prompt.

## Face tags (`--tag`)

Lowercase string labels for organization and search. Max 64 chars, max 32 per face.

```bash
# Set tags on create
faces face:create --name "Ada" --alias ada --tag research --tag physics

# Replace all tags
faces face:tag:set ada --tag research --tag updated

# Add tags (append, idempotent)
faces face:tag:add ada --tag new-tag

# Remove a tag
faces face:tag:remove ada old-tag

# List tags
faces face:tag:list ada

# List all tags across all your faces
faces face:tag:all

# Filter face list by tags (AND logic)
faces face:list --tag research --tag physics

# Filter by team (OR logic, composes with --tag)
faces face:list --team TEAM_ID

# Include extra fields in list/get responses
# tags: tag labels. teams: team memberships. profile: compilation stats.
faces face:list --include tags,teams,profile
faces face:get ada --include tags,teams,profile

# Discover published / system faces (see "System & published faces")
faces face:list --public          # your faces + all published faces
faces face:list --system          # only the curated system faces (owned by head)

# Bulk set a face's team memberships (replaces all)
faces face:teams ada --team TEAM_ID_1 --team TEAM_ID_2
```

## Teams

Named groups of faces with optional description, protocol (mermaid diagram), and tags.

```bash
# Create a team
faces team:create --name "Review Panel" --description "Research critique panel" --tag review

# Add faces
faces team:add TEAM_ID --face alice --face bob

# A face you do not own joins by its owner:alias address, the same one chat uses
faces team:add TEAM_ID --face head:socrates

# List teams (personal Guild is filtered out)
faces team:list

# Set protocol (mermaid diagram)
faces team:edit TEAM_ID --protocol-file workflow.mmd

# Manage members
faces team:members TEAM_ID
faces team:remove TEAM_ID alice

# Team tags (same pattern as face tags)
faces team:tag:add TEAM_ID --tag urgent
faces team:tag:list TEAM_ID
```

Teams also have a local TEAM.md representation at `~/.faces/teams/<name>/TEAM.md` with YAML frontmatter (name, description, tags, members as aliases) and the protocol as the markdown body. From faces-cli 1.21.0 `--protocol-file` strips the frontmatter, so `team:edit TEAM_ID --protocol-file ~/.faces/teams/<name>/TEAM.md` pushes an edited protocol directly; `team:edit` writes `members:` as aliases (1.20.0 wrote ids), a frontmatter key the CLI does not manage is kept, and `team:delete` removes the local folder.

## Compiling documents (`compile:doc`)

`compile:doc` is the recommended one-step command for compiling a document into a face. Pass the face alias as the first argument. It handles create → compile automatically with real-time progress:

```bash
faces compile:doc alice --file essay.txt --medium essay --perspective first-person
```

`--medium` is required: the server will not save a document that has not said what it is
(a `422` naming the eleven), and faces-cli 1.16.0+ refuses before creating anything. Eleven
values, spelled exactly — `academic paper`, `blog post`, `conversation`, `email`, `essay`, `lecture`,
`legal document`, `other`, `social post`, `text message`, `thread reply`. Never guess one — a wrong medium teaches the wrong voice and nothing
afterwards says it happened.

**No synonyms.** `transcript`, `keynote`, `sms`, `article` and the other 32 aliases used
to fold and are each a 422 naming all eleven. Only case and surrounding spaces are
forgiven. The folding was removed because it threw away what the caller said: a document
sent `medium: "transcript"` was stored as `conversation` and the word "transcript" was
kept nowhere, so afterwards nothing recorded what had been declared.

**`other`** is for writing in none of the named forms, read as prose with no
form-specific conventions assumed. Its rules are stored under `other` and applied only
to `other`. It is not a dumping ground: a letter, a diary entry and a memo are forms
with rules of their own, and filing them under `other` is the same error as filing them
under `essay`.

`other` and a null medium are not the same thing, and the difference is the point:

| | |
|---|---|
| no `--medium` | refused: a document cannot be saved without one. Only a document saved before that was required has none: `compilable: false`, `no_medium`, and it can never teach the face until `compile:doc:edit <id> --medium <medium>` declares one. |
| `--medium other` | the author says it is not one of the forms. Compiles. |

**The same flag name does different work on each surface**, which is worth holding
separately:

| surface | no `--medium` | what it does |
|---|---|---|
| `chat:*` | fine — one is classified from the request text | picks which captured style answers. Only does anything on a `+` alias; with one, a medium the face has no style for is refused naming the ones it has. So `other` on chat needs an `other` style captured, and is not a form-neutral fallback. |
| `compile:doc`, `compile:doc:create`, `compile:upload --kind document`, `compile:import --type document` | refused: the document cannot be saved without one | decides how the writing is read, and the spelling is held to exactly. It can be changed later, never cleared |

Output:
```
Creating document... done (abc123)
Compiling:
  compiling, 0%  0 components
  compiling, 43%  11 components
  compiling, 86%  25 components
  compiled  45 components
Done.
```

A source waiting behind the face's other sources, or interrupted and about to resume,
prints `queued` until its turn (`compile:doc:make` and `compile:thread:make` say so up
front: `Compiling (queued, and it starts on its own):`). Output as of faces-cli 1.20.0.

For an already-created document, use `compile:doc:make <doc_id>` to compile it.

`--timeout` sets the polling timeout in seconds (default: 600 / 10 minutes).

**`--perspective`: by them or about them?** Use `first-person` for the person's own
words (essays, letters, interview answers, talks) and `third-person` for material
*about* the person: a biography, an encyclopedia/Wikipedia article, a news profile,
anyone else's writing about them. **The default differs by command, so always pass it:**

| command | default |
|---|---|
| `compile:doc`, `compile:doc:create` | `first-person` (text pasted in is usually theirs) |
| `compile:upload --kind document`, `compile:import --type document` | `third-person` (an uploaded file is as often someone else's) |
| `compile:doc:edit` | none: changes it only when passed |

Omitting the flag on about-them text silently compiles it as if the subject wrote it, and
omitting it on the subject's own PDF or video compiles it as writing about them, which
teaches no style and which `style:make` refuses. Fix either afterwards with
`compile:doc:edit ID --perspective ...`.

## Style: how a face writes (`style:*`)

*Requires faces-cli 1.8.0 or newer.*

Compiling and style capture are two different acts on the same face. **Compile teaches a
face what it knows. Style teaches it how it sounds.** You can do either without the other,
and most faces only ever need compiling.

Style is worth capturing when the face is a real person whose own writing you have — their
mail, their messages, their essays. It is learned from first-person material only: writing
*about* someone teaches the wrong writer.

```bash
# 1. Load material. Stores only — nothing is compiled, nothing is billed.
faces style:upload alice ./mail.jsonl

# 2. Capture from the rooms that upload made, named by id.
faces face:sources alice --type thread --json | jq -r '.threads[] | "\(.id)  \(.medium)  \(.label)"'
faces style:make alice --source ROOM_ID_1 --source ROOM_ID_2

# 3. Check what happened
faces style:versions alice
faces chat:chat alice -m "Write a short reply declining the meeting."
```

**Using a captured style.** Capturing does not apply it. Prefix the alias with `+`:

```bash
faces style:make alice --all --medium email
faces chat:chat +alice -m "Reply to the note below." --medium email   # captured style
faces chat:chat alice  -m "Reply to the note below."                  # ordinary voice
```

`--medium` selects which captured style, since a face holds one per medium. A `+` on a
face with no style is a **409, not a fallback** — check first with `face:list --has-style`,
or drop the `+`. `--best-of N` (1-5) writes N replies and serves the one closest to the
style; it multiplies cost by N and cannot be streamed.

**Which faces have a style, and which media it covers.** `face:list` marks them
`[style: email, lecture]` and `--has-style` filters to them; `face:get` prints the media
too. In `--json` the field is `deepself`, an **object**:

| value | means |
|---|---|
| `null` | no style |
| `{"style": []}` | has a style, but no media recorded; naming one will be refused |
| `{"style": ["email"]}` | a style, and the media you may ask for with `--medium` |

**Test the KEY, not the length of its value** — `{"style": []}` is a face whose style
predates media-stamping, and reading it as "no style" is wrong. It was a plain list
(`["style"]`) before 2026-08-31.

`deepself.style` enumerates the **`+` set**: the media with a captured style behind them.

**A plain alias accepts any medium.** Declaring one there replaces the classifier's guess
and nothing else — a medium the face has no material for simply contributes nothing, and
costs nothing. So a picker can offer the whole vocabulary plain, and offer `+` only for
what is in `deepself`.

**`+alias` with a medium not in that set is a `400`** (`style_medium_unavailable`), not a
fallback to the ordinary voice: `+` promises a captured voice and a style is per medium,
so there is nothing to speak in. Read `deepself` first to avoid the round trip. This is
the cheap bulk answer — no per-face call.

```bash
faces face:list --has-style
faces face:list --json | jq '[.data[] | select(.deepself) | .alias]'
faces face:list --json | jq '.data[] | {alias, media: (.deepself.style // [])}'
```

**Correcting a thread's medium.** An imported corpus room whose messages declared nothing
shows as `unknown`. That is not a medium and contributes **no style**, which is
deliberate: no style beats the wrong style. Correct it, and the correction sticks:

```bash
faces compile:thread:edit THREAD_ID --medium lecture
faces compile:thread:edit THREAD_ID --clear-medium
```

What the corpus arrived as is kept underneath and never overwritten.

**Uploading a corpus: one medium per file.** The upload response reports the medium the
rooms were stamped with, derived from the messages rather than anything you send:

```bash
faces style:upload alice ./messages.jsonl --messages-per-room 500
# medium:   text message      <- assert this
```

`medium: none` means the file mixed media, or its messages declared none. Those rooms
**teach no writing rules and cannot be asked for by medium at inference** — the upload
succeeds and the face quietly learns nothing about how its subject writes. It is the one
silent failure on this path, so check the line rather than assuming it.

Set `--messages-per-room` above the length of a conversation you want kept whole: a room
is the unit a style is learned from, and the default of 50 cuts a long conversation into
arbitrary slices.

**Corpus line format.** For `--type jsonl` (and the older `email_jsonl` spelling), each line
is one JSON object, one message. Required: `author` (`self` when the face's subject wrote
it, `other` when someone else did), `sender`, `date` (ISO-8601) and the message text in
`snippet`. Optional: `kind`, which must spell one of the eleven media. `body`, `content`
and `role` are not accepted; a line that uses them in place of the required fields is
invalid, skipped and reported (or, with `--strict`, the whole file is refused).

```json
{"author": "self", "sender": "alice@example.com", "date": "2026-03-14T09:12:00Z", "kind": "email", "snippet": "Friday works. I'll bring the draft and we can cut it down together."}
{"author": "other", "sender": "bob@example.com", "date": "2026-03-14T08:40:00Z", "kind": "email", "snippet": "Can we meet Friday to go over the proposal?"}
```

**`--all` with `--medium` stamps every undeclared source, interview threads too.** `--all`
takes every ready document and thread on the face, not only corpus rooms. On a face that
also has an interview thread, `style:make alice --all --medium email` stamps that thread
`email` and learns from the interview transcript as if it were mail. Use `--all` only when
everything on the face is the subject's own writing in one medium; otherwise pick sources:

```bash
faces face:sources alice                                   # every source, with its id and medium
faces style:make alice --source ROOM_ID --source "$DOC_ID:essay"
```

**Declare the medium.** Each medium is analysed on its own, so an essay never teaches a
rule about email. A source that does not say what it is gets refused rather than guessed:

```bash
faces style:make alice --source "$DOC_ID:essay"           # one source, one medium
faces style:make alice --all --medium email               # fills in ONLY where nothing is declared (see the --all warning above)
faces compile:doc:edit DOC_ID --medium essay              # record it on the document itself
```

`--medium` does not override a source that already declares one; it only fills the gaps.
To change what a document says it is, edit the document.

> **Quote `--source ID:MEDIUM` when the id is a shell variable.** In zsh, `$DOC_ID:essay`
> is parsed as a history modifier and silently becomes `ssay`. Write `"$DOC_ID:essay"` or
> `${DOC_ID}:essay`.

A wrong declaration is worse than a missing one. A mislabelled source teaches the wrong
voice for that medium and nothing afterwards says it happened.

**Cost.** The analyst model runs the whole capture, which makes it the most expensive call
in the product. The default model runs on your own linked ChatGPT account and costs
nothing. A model that would bill is **refused**, not warned about:

```bash
faces style:make alice --all --medium email --model gpt-5.6-luna
# Error: 'gpt-5.6-luna' is not on the free tier, so this build would bill you.
```

If a capture fails on authentication, no ChatGPT account is linked or the link has expired.
Check with `faces auth:connections`, then link or reconnect with `faces auth:connect openai`.
From faces-cli 1.21.0 `style:make` checks for a link before queuing a free capture and refuses
with none ("Nothing was started"; link one, or `--allow-paid`). Do not switch to a paid model, which turns a fixable login
into a permanent bill. Pass `--allow-paid` only when you mean to pay.

**One style per medium.** A face does not have "a style", it has one per medium. An email
style and an essay style are separate and do not replace each other, so `style:versions`
can show several in use at once and version numbers restart per medium:

```bash
faces style:versions alice
# MEDIUM  VERSION  IN USE  REVERTABLE  MODEL          CAPTURED
# essay   2        yes     yes         gpt-5.6-terra  2026-08-27 20:21:54
# email   1        yes     -           gpt-5.6-terra  2026-08-27 20:23:26
```

**Undoing.** `style:revert` toggles between the two versions kept for a medium — running
it again returns to where you started. Name which style with `--medium` once the face has
more than one. It requires `--yes` because it changes how the face writes the moment it
runs.

```bash
faces style:versions alice                        # REVERTABLE says whether it will work
faces style:revert alice --medium essay --yes
```

**Deleting.** A face holds one style per medium, so say which:

```bash
faces style:delete alice --medium email --yes   # that one, leaving the rest
faces style:delete alice --all --yes            # every one
```

An unscoped delete on a face with more than one style is **refused**, naming them, rather
than taking them all. Documents, threads and uploaded material are always kept either way,
so a style can be captured again without re-uploading.

**To withdraw a SOURCE from a face without deleting it**, use `compile:doc:reset` /
`compile:thread:reset`. That wipes what was extracted, so the knowledge leaves the face,
and leaves the material to be recompiled. It is the way to undo a compile that went wrong
without paying to upload again.

**Third-person material cannot produce a style.** A capture naming only sources marked
`perspective: third-person` is refused: writing rules come from what the subject wrote,
not from writing about them. `face:sources --json` reports each document's perspective.

It cannot delete source text. To remove that, use the commands that own it —
`compile:doc:delete` and `compile:thread:delete` — where deleting is the point of the call
rather than a side effect.

**Long builds.** A capture is asynchronous. `style:make` blocks and prints progress;
`--no-wait` returns a job id instead. If you lose the id, list the face's builds:

```bash
faces style:make alice --all --medium email --no-wait
faces style:status --face alice        # recover the job id
faces style:status JOB_ID --wait
```

`style:status` exits 1 when the job failed, with `--wait` or without, `--json` or not
(1.21.0+). Before 1.21.0 a failed `--wait` exited 0: read `status`, not the exit code.

**One capture per face and medium at a time.** Starting another while one runs is refused
with `409 build_in_progress`, naming the running job; the CLI prints the `style:status
JOB_ID --wait` to follow it. Nothing was started or charged. Do not retry in a loop.

**What a finished capture warns about.** Two report fields, printed by `style:make` and
`style:status JOB_ID`, and kept in `--json` under `report`:

- `skipped_third_person`: documents left out because they are writing *about* the subject.
  If one is really their own writing, fix it with `faces compile:doc:edit ID --perspective
  first-person` and capture again.
- `thin_corpus`: `{medium: {words, threshold}}` for each medium captured from less writing
  than the automatic threshold. It installed anyway; a manual capture has no minimum.

**When the free route refuses** (the default, with no `--allow-paid`), a failed job names its
code in `error_code` (older jobs only start `error` with it), and each has its own fix. A build
that can only run through ChatGPT, started with none linked, is refused up front instead: a
`409 chatgpt_not_linked`, with nothing started. Link one with `faces auth:connect openai`, or
pass `--allow-paid`.

| Code | Meaning | Fix |
|---|---|---|
| `CONNECT_REQUIRED` | Not on Subscription Connect, so there is no free route | `--allow-paid` to pay from credits, if the user agrees |
| `MODEL_NOT_FREE` | That model has no free ChatGPT route | Use the default model, or `--allow-paid` |
| `CHATGPT_AUTH` | No ChatGPT account is linked, or the link expired. 1.21.0+ says which ("No ChatGPT account is linked", or "most likely expired" when one is); when it cannot tell, it names `faces auth:connections` | `faces auth:connect openai`, then capture again |

**Automatic captures** (*faces-cli 1.13.0+ to see and control them*). The server captures a
medium on its own once the face has enough of its **own** writing in it: 10,000 words for
essay, academic paper, blog post and legal document, 15,000 for the rest. It runs again only
at 2x, 3x and so on, never on every upload. Only the face's own messages in uploaded threads
and `first-person` documents count; email and text message count only from uploaded message
threads; `other` never triggers one. The check runs when a compile finishes and when a mailbox
or transcript upload arrives.

It installs immediately and `style:revert` undoes it. `style:status --face` marks these rows
`BY auto`, and `style:status JOB_ID` says why it ran (`started by: automatic capture after an
upload (31240 words, past 2x the 15000-word threshold)`). `--json` carries the same under
`report.auto`. On Subscription Connect they are on by default, run on the linked ChatGPT
account and are never billed (an expired link fails and is retried later, not charged). On
pay-per-token they are off by default and bill per token when on. Control them with the
`auto_style` preferences (see Account preferences).

A capture after a revert keeps the version you reverted **to** as its previous one, so
reverting and then capturing again never loses the style you chose.


## Compile state: read `finishing` first

A source carries a `finishing` boolean as well as `synced`, `status` and `progress`.
**Branch on `finishing` first; read `status` only when it is false.**

| `finishing` | means | what to do |
|---|---|---|
| `true` | running, or queued for an automatic retry | show progress, **offer no action**, keep polling |
| `false` | finished, out of retries, or paused | read `status` to tell those apart |

`finishing: true` never coexists with `synced: true`. It is not the opposite of `synced`
(a source never compiled is neither), and it is **not** true for `paused`, because a pause
waits on you rather than on the server.

**Never offer to compile a source that is finishing.** A source being retried
automatically can report `failed` on the way, so presenting it as an error and telling
someone to re-run is asking them to do what the system is already doing, and invites a
second charge for work in flight. `faces compile:all` skips them and says how many it
skipped.

**`status` and `progress`** replaced `prepare_status`, `chunks_total` and
`chunks_completed`, which the API no longer sends, on every compile response: the
document and thread reads (with `?status_only=true` too), the lists, `PATCH`, `/make` and
`/v1/compile/activity`. A poll loop written against the old fields waits forever, and
faces-cli 1.20.0 is the first CLI that reads the new ones.

| `status` | meaning |
|---|---|
| `not_compiled` | never compiled; call `/make` |
| `transcribing` | an audio or video source is being transcribed |
| `queued` | waiting behind the face's other sources (one face compiles one source at a time), or interrupted and about to resume by itself |
| `compiling` | running |
| `compiled` | done. The face's style update for it can land up to about a minute later in the background; treat `compiled` as finished |
| `paused` | paused by the caller; nothing moves until it is resumed |
| `failed` | finished without success; `error_code` and `stall_reason` say why |

Treat an unknown value as `compiling`. `progress` runs from 0 to 1: it is 1 only when
`compiled`, and 0 while `queued` or `not_compiled`. Show queued work as queued, never as
"0%". `/make` is the only compile call, interview threads included; `/prepare` and
`/sync` are gone, and with them `compile:thread:sync`. A second `/make` of an unchanged,
compiled source answers `409` with `error_code: "already_compiled"` and charges nothing:
edit the source or reset it to compile again.

**A compiled source with `GAVE 0`** had nothing the compiler could use, such as a PDF that
is only images. A compile that extracts nothing from real text no longer reports success,
so this no longer hides a provider failure. Recompiling costs again and will usually give
the same result.

## Is anything compiling? (`compile:status`)

`finishing` above answers it for one source. For the account, `faces compile:status`
answers for everything at once — 123 bytes idle, against 2.1MB to walk the document
list. Needs faces-cli 1.12.0, and 1.20.0 for the current fields.

```bash
faces compile:status                 # grouped by face
faces compile:status --json          # branch on sources_active
faces compile:status --watch         # poll until quiet, then exit
```

Idle it is exactly:

```json
{"object":"compile_activity","faces":[],"faces_active":0,"sources_active":0,
 "progress":null,"measurable":false,"paused":[]}
```

With work in hand each entry in `faces` carries `alias`, `sources_active`, `progress`,
`measurable`, and a `sources` list of `{id, kind, label, status, progress, stall_reason}`.
Paused sources are not in `faces`. Each one is an entry in the top-level `paused` list,
`{alias, id, kind, label, status, progress, stall_reason}`, for example:

```json
"paused": [{"alias": "alice", "id": "549e…", "kind": "document", "label": "Letters",
            "status": "paused", "progress": 0.14, "stall_reason": null}]
```

faces-cli 1.20.0 prints them after the running work:

```
Nothing is compiling.

1 paused source(s), waiting for you to resume:
  alice  document Letters
         paused, 14%
         resume: faces compile:doc:make 549e…
```

**This is the question a resumed session cannot answer from memory.** A compile started
in an earlier turn, or by someone on another machine, is otherwise invisible, and the
failure is reporting work finished while it is still running.

**`sources_active: 0` means nothing is RUNNING, not nothing is outstanding.** Membership
in `faces` is the same `finishing` predicate as above: a retry is the server's, so a
source being retried is **counted**, and so is a queued one; a pause waits on you, so a
paused source is **not counted** and sits in `paused` instead. `--watch` exits without
waiting for paused sources. Having paused a compile, read `paused` before reporting that
the work completed.

**Branch on `measurable` before reporting a percentage.** On a face and on the account,
`progress` is `null` while it cannot be measured, during a transcription for one, and
`measurable` says so: call it working and give no number. A single face can be
`measurable: true` while the account is false. Read `sources_active` first, since
`measurable` is false on an idle account, which is neither true nor useful.

A **source** entry carries no `measurable` of its own and does not need one: its
`progress` is always a number from 0 to 1. When every source in a face is `queued`, the
face's progress is 0 because it is waiting, not stuck.

`faces` is activity, not a roster. A face appears only while it has work, so this is
never a listing of the account's faces.

Note `?status_only=true` is a per-item thing: the two account-wide list routes ignore it
and return the full body. `compile:status` is the account-wide question, not a trimmed
list.

## Compile state: is the compiled knowledge still current?

`synced: true` only ever meant "a compile ran at some point against some revision of this
text". It never said *which* revision, so a source edited after its compile reported
exactly the same as one that was current. The API publishes the revision now, and the
distinction matters more for an agent than for a person: an agent compiles a source,
edits it later in the same session, and has no reason to doubt a `synced: true`.

| | field | meaning |
|---|---|---|
| document | `version` / `synced_version` | the current revision, and the one the compile read |
| thread | `version` / `synced_version` | the same pair |
| thread | `synced_at` | the fixed point every message instant is compared against |
| each message | `timestamp` | when that message was last written — created, or edited in place |

- **A document is stale** when `synced_version < version`, by that many revisions.
- **A thread is stale per message**: `message.timestamp > thread.synced_at` identifies
  exactly the messages the compile never read. An agent that edited message 4 of 500 can
  see that message 4 alone is the reason to recompile.

**Two states are unknown, and unknown is not stale.** Reporting either as stale sends
someone to pay for a recompile they may not need:

- A **null `timestamp`** means the instant was never recorded. That is not the same as
  edited.
- A thread with **`synced_at` set and `synced_version` null** was compiled before the
  revision was recorded. That is 204 of 208 threads on a mature account, draining as they
  recompile.

**A reorder moves the revision and restamps no message.** Per-message staleness alone
cannot see it; the revision pair can. If the pair says stale and no message looks new,
the order changed.

The CLI reads all of this from 1.10.0 on. `face:sources` folds it into the STATUS cell,
so a row reads `stale (2 behind)` rather than `compiled` (`synced` before 1.21.0); `compile:doc:get`,
`compile:doc:list`, `compile:thread:get` and `compile:thread:list` say what moved and
what a compile would be refused for. Below 1.10.0 none of it is read and every compiled
source reads as current.

## `compilable`: whether the action exists at all

Every source row and detail response carries:

```json
{ "compilable": false, "compile_blocked_reason": "no_medium" }
```

`compile_blocked_reason` is a short stable code (`empty`, `no_medium`,
`no_user_messages`, `corpus_room`, `too_short`), and you write the sentence.

`too_short` is a document under the minimum length: it carries `word_count` and
`compile_min_words` (50 today), and a compile of it is a `400`. Add text or merge it into
a longer source. faces-cli 1.20.0 prints the code as it is, with no repair line; 1.21.0's
`face:sources` reads it as "under 50 words".

**The two booleans compose.** Branch on `finishing` to decide between showing progress
and offering an action, and on `compilable` to decide whether the action exists:

| `finishing` | `compilable` | what to do |
|---|---|---|
| `true` | either | show progress, offer nothing, keep polling |
| `false` | `true` | a compile is available; offer it if the source is stale or never compiled |
| `false` | `false` | say why from `compile_blocked_reason`; never offer a compile |

**Never offer to compile a source the server will refuse.** On a real account 33 of 70
documents are `no_medium` and 202 of 208 threads are `corpus_room`, so this is the common
case, not the edge. `faces compile:all` skips them from 1.10.0 and reports the counts by
reason.

Three traps, each worth being explicit about:

- **It is not about whether a compile would change anything.** That is `synced` and the
  revision pair above. A source whose text was rewritten is `compilable: true` and stale,
  and recompiling it is exactly right.
- **It is not transient.** A running compile, a locked face and an empty balance are
  refused too, but by other means (409, 409, 402) and none of them is a property of the
  source. `finishing` already covers the first.
- **Treat an unknown code as "cannot be compiled."** More will be added; the set is not
  closed.

## Deleting sources

`compile:thread:delete` and `compile:doc:delete` are clean — they remove all
cognitive components extracted from that source.
The face's profile and component counts update immediately. No re-sync needed.

Do NOT warn users that components may persist after deletion — they don't.

## Read-only sources

Documents and threads carry a `read_only` flag. When an item is frozen,
`compile:doc:list`/`:get` and `compile:thread:list`/`:get` print a bare
`read only` line; in human output nothing is printed when it's writable. In `--json`
the field is always present, `"read_only": true` or `false`, so branch on it there.

Frozen items are readable and can still be deleted. Writes to their content
(`compile:thread:message`, `compile:thread:replace`, a content edit) are refused:

```
Error (409): This document is read-only and cannot be edited.
```

Threads phrase it `This corpus is read-only…`. On a 409, don't retry the write —
surface that the item is frozen. Metadata is not content: on a frozen corpus room,
`compile:thread:edit --label`, `--medium` and `--clear-medium` are accepted, so the
medium correction under Style works there. Today only style **corpus** uploads
(`style:upload`) produce locked threads; nothing locks individual documents. There is no per-item toggle
for these; to freeze or thaw a whole face, use `face:lock` / `face:unlock` (see
**Face locking** below).

## Face locking

A whole face can be frozen with `face:lock <alias>` and thawed with
`face:unlock <alias>`. A locked face still reads and chats normally — it just
can't be changed.

While locked, any mutating call against the face or anything it owns — editing
the face, its documents/threads, uploads/imports, style capture, and
deleting the face — is refused with HTTP `409` (message contains `read-only`).
Don't retry; `face:unlock` first. The lock covers the face's captured style as
well, so a face and its style freeze and thaw together.

Reads, listing, and chat are unaffected. To recognize a locked face: `face:get`
shows a bare `read only` line and `face:list` shows a `[read only]` marker
(nothing shown when unlocked).

## Catalog

The CLI maintains a local catalog at `~/.faces/catalog/` with a `FACE.md` file per face (YAML frontmatter + markdown notes) and a consolidated `~/.faces/catalog.json` index. The catalog is managed automatically on `face:create`, `face:edit`, and `face:delete`.

- `faces catalog:doctor` — diagnose missing, stale, or orphaned catalog entries
- `faces catalog:doctor --fix`: rebuild catalog from API (syncs FACE.md descriptions/tags/attributes and TEAM.md files). It rewrites the frontmatter of **every** FACE.md and the whole of every TEAM.md from the server, but `Fixed N` counts only entries that were missing or renamed, so `Fixed 0` does not mean nothing changed. It does not add a missing description; that is `--generate`. A FACE.md body is kept. Frontmatter keys the CLI does not write are kept as written from faces-cli 1.21.0 and dropped before it (see the FACE.md schema in SKILL.md)
- `faces catalog:doctor --generate` — fix + generate descriptions via LLM (syncs back to server)
- `faces catalog:backup`: snapshot all faces (with descriptions, tags), teams, documents (with each one's medium, from 1.16.0), and threads to `~/.faces/backups/<timestamp>.json`. From 1.21.0 it also takes uploaded threads and style corpus rooms, each thread's medium and source, and each face's specialty and `profile_addendum`
- `faces catalog:restore [FILE]`: restore faces, tags, teams, and source material from a backup (defaults to most recent). `--compile` runs `compile:all` after upload. A document the backup records no medium for (an older backup, or a document saved before a medium was required) is refused by the server; restore names it, and it needs creating again with `compile:doc:create --medium`. Never guess the medium. From 1.21.0: threads are recreated from their backed-up messages without starting a paid interview (before, each one started one, and on an empty balance every thread was refused while the summary still counted it); style corpus rooms are **not** restored as threads, which would make them knowledge to compile, and are listed for you to load again with `style:upload`; a team that already exists is skipped rather than duplicated; specialty and `profile_addendum` are restored; and anything not restored is listed and the command exits non-zero. Before 1.21.0, read the summary rather than trusting exit 0.
- `faces catalog:list` — print catalog contents
- `faces compile:all` — compile all uncompiled documents and threads across all faces (one at a time with progress)
- `faces config:set catalog false` — disable catalog management
- `faces config:set catalog_model gpt-5-nano` — set the model used for description generation

## Attributes (`--attr`)

The `--attr KEY=VALUE` flag on `face:create` and `face:edit` sets basic facts about the person on a Face directly, without compiling a document. The flag is repeatable — pass one `--attr` per fact. These facts anchor the persona, and a face with nothing compiled answers from them.

**There are twelve keys, and no others.** Three are fields that take a plain value; nine take a short sentence.

| Key | Format | Holds | Example value |
|---|---|---|---|
| `age` | value | their age | `45` |
| `gender` | value | their gender | `woman` |
| `location` | value | where they live now | `Lisbon, Portugal` |
| `identity` | sentence | name, sexuality, where they are from | `Born in Seoul, raised in Los Angeles.` |
| `education` | sentence | schooling and study | `Holds a master's degree in nursing.` |
| `occupation` | sentence | work and career | `Works as a nurse practitioner at a county clinic.` |
| `religion` | sentence | faith, or its absence | `A practising Buddhist.` |
| `family` | sentence | parents, siblings, children | `Has two teenage sons.` |
| `relationships` | sentence | partner, marriage, close ties | `Married for twelve years.` |
| `health` | sentence | lasting health conditions | `Manages type 1 diabetes.` |
| `languages` | sentence | languages spoken | `Speaks English and Korean.` |
| `background` | sentence | formative history no other key covers | `Spent her twenties in the Peace Corps.` |

Anything else about the person goes in one of these as a sentence (nationality in `identity`, marital status in `relationships`). **Any other key is a `422` that names it, and nothing in that request is written**, so fix the key and send the whole request again. `faces face:attributes` lists the keys with what each holds and its `format` (`value` or `sentence`), from `GET /v1/faces/attributes`.

Attributes appear as `attributes` in CLI responses (the API sends `basic_facts` but the CLI renames it).

**Example — create a Face with attributes:**
```bash
faces face:create --name "Maria Chen" --alias maria \
  --attr gender=woman --attr age=34 \
  --attr location="Portland, OR" \
  --attr occupation="Works as a nurse practitioner at a county clinic." \
  --attr education="Holds a master's degree in nursing." \
  --attr relationships="Married for twelve years."
```

**Example — add facts to an existing Face:**
```bash
faces face:edit maria --attr religion="A practising Buddhist." --attr identity="Korean American, born in Seoul."
```

> Note: `--attr` cannot be combined with `--formula`. Composite faces inherit their facts from their component faces.

## Output format: `--json` and `--toon`

Every command that takes `--json` also takes `--toon`, which emits the **same data and the
same field names** in [TOON](https://toonformat.dev/) instead. Measured across this CLI it
is **about 40% fewer tokens** than `--json` — 73% on `billing:llm-costs`, 17% on
`face:list` — so for an agent paying for its own context it is the better default.

```bash
faces face:list --toon      # same fields as --json, fewer tokens
faces face:list --json      # unchanged
faces face:list             # human output, unchanged
```

The two are mutually exclusive. Errors keep the same structured shape in either, and with both
flags given an error is reported in JSON (1.21.0+).

**Errors under `--json`** (1.21.0+) are `{"error": {"message", "code", "status", "error_code",
"fallback_available", "retry_after"}}` on stdout. `code` is the exit code, the same one text
mode exits with; `status` is the HTTP status of the refused request (missing when nothing was
sent); `error_code`, `fallback_available` and `retry_after` appear when the API sent them.
Branch on `.error.status` and `.error.error_code`, never on the message text. Missing
credentials are a JSON error too. Before 1.21.0 the error held only `message` and `code`, and
the exit code was 1 for everything.

**Confirmations** (1.21.0+). Every command that deletes, revokes or charges asks first; `--yes`
skips the question. Under `--json`, or with no terminal to answer on, it does not ask: it
refuses with "Re-run with --yes to confirm. Nothing was changed." and exits 2. This includes
`compile:doc:delete`, `billing:topup` and `chat:thread --delete`, which did not ask before, and
`face:publish`, `face:share`/`face:unshare` (when removing access), `billing:subscription:plan`
and `billing:card:remove`, which `--json` used to let through unasked. Ask the user, then pass
`--yes`. Nothing
about the data changes, so anything that reads `--json` can read `--toon` by decoding it
instead of parsing JSON.

Requires faces-cli 1.9.0 or newer.

## Paged listings

`GET /v1/faces` is cursor-paged: 100 per page by default, with `has_more` and
`next_cursor` on the response. **faces-cli 1.10.0 follows the cursor to the end**, so
`face:list`, `compile:all`, `catalog:backup` and `catalog:doctor` see every face, and
each says so when a list came back short rather than presenting it as complete.
`catalog:backup` and `catalog:doctor` refuse outright on a short list — a backup that
restores short, and a comparison against rows it never read, are both worse than an
error.

**Below 1.10.0 these read only the first page.** On an account with more than 100 faces
`face:list` silently truncates and `compile:all` silently skips, with nothing said. Do
not tell a user a listing is complete unless 1.10.0 or newer is installed.

`user:followers` and `user:following` are paged the same way and followed the same way.

## Errors

A client's mistake is a `422`, not a `500`. Every error body uses one `detail` shape and
carries a reference code. **Branch on the status and `error_code`, never on the message text**:
messages are written for people, say what to do, and change. A refusal on a streamed request
(chat, Messages, Responses) comes back as an ordinary error response, or as the endpoint's SSE
error event on a held face turn, never as a `200` with a JSON body. `503` is the status worth retrying. A `409` means the thing is
busy or frozen, a `402` means no credits, and neither is fixed by retrying. A face chat's
refusals, and the ones that arrive inside a stream, are under
[Streaming face chats](#streaming-face-chats).

Compile refusals carry a stable `error_code` (`no_medium`, `empty`, `no_user_messages`,
`corpus_room`, `too_short`); see the `compilable` section above. The CLI prints the repair for each.
Under `--json` it is in `.error.error_code`, with the status in `.error.status` (1.21.0+).

**`may be out of date`** (1.16.0+): the CLI ends a refusal with `Your faces-cli (X) may be out
of date. Update with npm install -g faces-cli and try again.` when it looks like the API moved
under it: a route that is gone, a `405` or `410`, a `422` about a top-level field the CLI sent
or left out, or a response missing a field the CLI relies on. Update and retry. A missing face,
a bad medium or a mistake in a questions file never carries it, since those are about what was
asked. From 1.20.1 the CLI checks npm first (cached for six hours): when the installed version is
already the latest it says this **looks like a faces-cli bug** and where to report it instead, so
do not reinstall. From 1.21.0 a server that does not answer in JSON is named as not the Faces API,
a base URL ending in a path gets the exact fix, and a network failure names its cause.

**Ids stay ids** (1.20.1+). An id or alias given to any command is encoded into its path, and
`.` or `..` is refused, so no argument can reach a different route or a folder outside its own.

**Saved credentials stay with their API** (1.21.0+). A login or key is saved with the API it
came from (`credentials_base_url`; an older config falls back to its `base_url`, then
api.faces.sh), and is sent only there, so `--base-url` to another host does not carry it. A
token or key from a flag or the environment is always sent. Nothing goes over plain `http://`
except to localhost. A **saved** API key the API refuses falls back once to the saved login, with
a warning naming how to remove it; `auth:whoami` reports the same, on stdout. A `401` names
`auth:whoami` and `auth:login`. A corrupt `config.json` is backed up before anything overwrites
it.

Two refusals can come from almost any route, and the CLI adds what to do to both (1.13.0+):

- **`429` naming an allowance.** A Connect or Pro allowance (a face's reasoning over 5 hours,
  the week or the month, or compiling over the month) is used up and `api_fallback` is off.
  Starting a compile is refused this way too. The message says which, and when it resets: show
  it as it is. Wait, or turn on `api_fallback` to pay from credits. An ordinary rate-limit `429`
  names no allowance.
- **`429 Rate limit`.** Every route that runs a model or a compile counts against a
  per-account, per-minute limit set by plan; `GET /v1/rates` publishes it under
  `limits.requests_per_minute`. Over it, the route answers `429` with `Retry-After` and
  `{"detail": "Rate limit: 60 requests per minute on the connect plan. Retry in 15s."}`, before
  any work and with nothing charged. faces-cli 1.19.0+ prints the wait, waits it once and asks
  again; a second refusal is final. Do not retry in a tight loop: agents running in parallel
  share the account's limit, and asking early is refused too.
- **`402`.** No credit for the request. On Connect and Pro the answering model and `decide`'s
  decision model are still paid from credits, so this can happen on any plan; there the message
  says whether a ChatGPT account is linked and what to do. Top up. A `402`
  because no card is saved points at `faces billing:card-setup` (1.21.0+).
- **`502 oauth_incomplete`.** ChatGPT stopped its reply partway on two attempts. Nothing was
  charged; retry. With `api_fallback` on it would have finished on the paid route and billed.

## Global flags

Any command accepts these flags. They go **after** the command name; before it they are
read as the command (`faces --json face:list` fails with "command --json not found"):

```
faces COMMAND [ARGS] [--base-url URL] [--token JWT] [--api-key KEY] [--json | --toon]
```

## Environment variables

| Variable | Purpose |
|---|---|
| `FACES_BASE_URL` | Override API base URL (default: `api.faces.sh`) |
| `FACES_TOKEN` | JWT authentication token |
| `FACES_API_KEY` | API key authentication |
