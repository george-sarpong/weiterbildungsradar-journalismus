# EVT245 – Atomic P40 source-identity closure and 140-way no-rediscovery execution register

Date: 2026-11-06; parent PR10 draft HEAD a1308e663b764a6bf44ff2346167459438cb8f5a; paired project bible EVT244.
This transaction performs exactly one evidence-backed **field closure** rather than a claim that a whole course is Website Gold, and materializes an exact-ID execution register for all 140 already-known due records. No new offers, no 116 QA09 reopen, no master/main/hosting release.

## Closed
- `PCC-P40`: exact official same title, same `kursbp1`, same session `BP1 261123`, 23–24 November 2026 2 teaching days and mode choice on both provider pages:
  - https://www.pc-college.ch/seminare-schulungen-kurse/barrierefreie-pdf/barrierefreie-pdfs-dokumente-mit-ms-word-und-adobe-acrobat-professional-bp1.php
  - https://www.pc-college.ch/seminar/acrobat/barrierefreie-pdfs-seminar-schulung-bp1.php
- `SOURCE_VERSION_OR_IDENTITY_GUARD` has been removed from the **CURRENT** matrix, backlog and trust row for this exact ID. The **historical** frozen `source_decision=HOLD_ORIGINAL_URL_ALIAS` is intentionally retained as an earlier observation, superseded solely for BP1 edition identity by EVT245. Neither route HTTP redirect nor current individual bookings inferred.
- Reclassed pending priority from `P0_SOURCE_IDENTITY_SCOPE` to `P1_PRICE_ACCESS_VENUE` (P0 27; P1 86; P2 18; P3 9). Current source guard count **16** (previously 17).
- All nonidentity holds **survive**, exactly `CH_FINAL_FEE_NOT_PROVEN|BOOKING_OR_INTAKE_NOT_PROVEN|CURRENTNESS_REVIEW_DUE|VENUE_FORMAT_SESSION_CROSSWALK`. Provider choice between Basel/Bern/Zürich or Live-Online does not establish an actual chosen venue, final Swiss price or a free seat. `website_gold_gate=NOT_PROVEN`, publication `HOLD_NO_AUTOMATIC_RELEASE`.

## Parallel processing and anti-repeat state
- `docs/b2/evt245-active-140-execution-register-20261106.tsv` contains 140 unique already-known IDs, with independently identifiable work groups and per-ID next evidence trigger, not a new research roster.
- This is a **work registry**, not independent evidence. It references the canonical source and current matrix/backlog; only P40 is proven field-closed here.
- Groups: {"CH_CFJM":11,"CH_MAZ":20,"CH_MAZ_OTHER":1,"CH_PCC_OTHER":18,"CH_PCC":7,"OTHER_CATALOGUE":46,"CH_HELIAS_SYNDICOM":2,"CH_ORSYS":2,"CH_ITTA":5,"CH_DAWAN":10,"CH_DAWAN_OTHER":4,"AT_OTHER":1,"CH_JJS":1,"AT_ACADEMIC":8,"CADSCHOOL":1,"AT_FH_JOANNEUM":1,"AT_FJUM":1,"LI_WORK_ENTRY":1}.
- Open-work classification: {"EXACT_DELIVERY_OR_OCCURRENCE_EVIDENCE_REQUIRED":39,"EXACT_SOURCE_IDENTITY_OR_EDITION_CONFIRMATION_REQUIRED":15,"PRICE_ACCESS_EVIDENCE_REQUIRED":54,"OWNER_SCOPE_DECISION_REQUIRED":10,"REMAINING_FIELD_EVIDENCE_REQUIRED":14,"INDIVIDUAL_BOOKING_EVIDENCE_REQUIRED":7,"IDENTITY_CLOSED_PRICE_VENUE_SEAT_HOLDS_OPEN":1}.
- Batches may fetch independent providers/occurrence surfaces in parallel and must persist per-ID decisions. If an exact source is unavailable, record provider or owner dependency; never retry unchanged source in the next chat without a new trigger/version or explicit operator instruction.
- Tests protect the P40 exact scope and unchanged 140 IDs, 55 delivery-tier unverified, 10 owner-scope decisions and every publication hold.
- Atomic Git commit path uses Git blob objects, one tree, one commit, one compare-and-set ref update, never partial multi-file branch state. If a guard, object write, CI or readback fails, no release and cause is explicitly recorded.

## Other pending evidence
PCC-P13 ACP/ACD and P20 PDL/PSI code guards remain; their confirmed current alternate-page price floors remain in EVT244 only. MAZ booking iframe, CFJM edition detail, Dawan CH live vs in-person evidence, AT academic intake/access and other source-specific holds remain unresolved. Each is keyed in the full 140-item register.
