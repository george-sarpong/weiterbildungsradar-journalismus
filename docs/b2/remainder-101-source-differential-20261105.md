# B2 Remainder 101 — Source differential, limits and unresolved proof (05.11.2026)

This is a **bounded, record-level evidence staging ledger**, **NOT** a claim of publication-ready data or confirmed registration. It documents exact source checks against the pre-existing `docs/b2/parallel-review-140-20261105.tsv`. The frozen due cohort has 140 distinct offer IDs: 39 immediate N-lanes + 101 disjoint R-lanes. **Due ≠ defect.**

## Persisted counts and reproducible lineage

- R01_DJA: **21/21 source-partial**, 0 pending. Eleven individual courses have offer/price/intake fields checked; ten have *programme identity only* from an official provider index. None has a newly confirmed admission window after the old 1 October 2026 intake.
- R02_RUNNING: **11/11 source-partial**, 0 pending. An already-running or completed edition is retained historically, not represented as a fresh future registration.
- R03_JOURNALISM_LATER: **9/9 source-partial**, 0 pending. Some provider pages disagree with queued future dates. Individual edition proof remains open.
- R04_PCC_LATER: **13/15 source-partial**, 2 pending. Generic venue selectors, European VAT example fees and alias changes must not be promoted to Swiss confirmed fee, exact city or seat.
- R05_TECH_LATER: **23/26 source-partial**, 3 pending. Includes ifage session-by-session durations, format-specific Dawan remote variants, Studio1 sold-out/version separation, ITTA duration conflicts.
- R06_SINGLE_LATER: **9/9 source-partial**, 0 pending.
- R07_UNDATED: **10/10 source-partial**, 0 pending. Confirmed institution-level 2027 admissions and qualification constraints are not exact programme start dates.
- Total: **96 source-partial / 101**, **5 pending / 101**. Combined with N-lane source differential **36/39 partial, 3/39 pending** = **132/140 with at least one bounded evidence signal, eight without sufficient fresh-field proof**.
- Only the B2 **evidence ledger** is newly edited in this batch. No edit to `data.js`, `smart-search-data.js`, Drive Master, `main`, or the deployed site. No broad `review_after` reset, no duplicate stable IDs, no E4/E5/G3/owner release.

## Important material findings and preserved holds

1. **DJA 21**: All offers remain identifiable on programme or direct provider pages. For eleven specific programmes official detail lists the past **1 Oct 2026** start and **15 Sep 2026** application deadline. This does **not** support new future applications. For other ten, the index proves programme existence only; tariff and exact current admission remain HOLD.
2. **CFJM R03**: `OFFER-CFJM-005` queue claims March 2027 while inspected official detail showed only Sept/Oct 2026. `OFFER-CFJM-013` queue claims April 2027 but its specific source showed only Oct 2026. Both are **edition-proof HOLD**, not automatic cancellations, archival moves, or claims of definite falsehood. Other CFJM 2027 pages confirm published individual sessions with multi-tier professional prices. No blanket membership/CHF0 entitlement.
3. **FHWien/FH Wiener Neustadt/Jänner 2027**: official 2027 application windows captured at the individual programme/institution levels. Swiss admission is subject to the programme rules; `AT-PROD-OFFER-144` JKU requires a qualifying current/previous university degree, so Swiss citizenship alone does not convey eligibility.
4. **PCC 13/15**: source-confirmed course codes/dates are bounded by snapshot age and unspecified actual delivery campus. Price examples in EUR + German VAT are **not** Swiss CHF gross prices. `PCC-P20` legacy PDL and new PSI course code crosswalk remains HOLD. `PCC-P09` only an old course page supports generic programme, not the 26 Nov edition.
5. **ifage 2027**: `IF-G04` session S-03279 Photoshop five evenings 4 March–15 April, **5 × 3 hours = 15 contact hours**, CHF620, Montbrillant. `IF-G08` InDesign 20 April–4 May 2027, S-03280, 15 contact hours CHF620, Montbrillant; **the Nov 2026 S-03213 edition is full**, which does not prove the 2027 cohort is full. `IF-W03` WordPress S-05999 Feb1–5 2027 and S-06000 Apr14–28, 15h CHF630, ifage Augustins, with synchronous online/in-person model requiring variant differentiation. Sources: https://www.ifage.ch/formation/tic/formations-cao-dao-pao/photoshop-niveau-1/ ; https://www.ifage.ch/formation/tic/formations-cao-dao-pao/indesign-niveau-1/ ; https://www.ifage.ch/formation/tic/formations-cms-developpement-web/wordpress-creer-son-site-internet-facilement/
6. **CAD-002/003/005/025**: official Cadschool descriptions distinguish tutor-supported/in-person CHF500, autonomous online CHF250, optional certificate CHF150 for the graphics courses; WordPress CHF1950, or potentially CHF1450 after **conditional Geneva CAF subsidy**, not an automatically available discount for all Swiss applicants. Original Nov/Dec future course start dates are not confirmed by the older static page snapshots. Sources: https://www.cadschool.ch/formation/photoshop/photoshop-base/ ; https://www.cadschool.ch/formation/photoshop/photoshop-intermediaire/ ; https://www.cadschool.ch/formation/indesign/indesign-base/ ; https://www.cadschool.ch/formation/wordpress-base-intermediaire/
7. **Microwin**: `MW-P07` official Jan12–13 2027 InDesign Professional, CHF1690 ex VAT, Wallisellen or separately selected LiveStream. `MW-P09` old cached Nov23–24 2026 course at CHF1490 ex VAT; old content includes technologies requiring owner currentness judgment. `MW-P06` current exact course page inaccessible and remains unproven. Sources: https://www.microwin.com/pages/coursedetails/indf.aspx ; https://www.microwin.com/pages/coursedetails/webda.aspx
8. **Studio 1**: `V58-S1-04` DaVinci Resolve March8–10 2027, Wallisellen CHF1690; its separate November 2026 class explicitly sold out. `V58-S1-07` smartphone video Feb8–10 2027 CHF1690 Wallisellen, plus later cohorts. Past sold-out and available registration button must not be mapped across occurrences. Sources: https://www.studioeins.ch/kurse/davinci-resolve/ ; https://www.studioeins.ch/kurse/video-mit-smartphone/
9. **ITTA**: `V78-01` Premiere Pro Fundamentals and `V78-03` After Effects Fundamentals each explicitly describe **2 jours in header vs sur trois jours in introductory body**. Keep `HOLD_DURATION_SOURCE_CONFLICT` and no synthetic 2026 booking status. `V78-04` Advanced page not accessible for full review. Sources: https://www.itta.net/formations/multimedia/video-et-son/adobe-premiere-pro-fondamentaux/ ; https://www.itta.net/formations/multimedia/video-et-son/adobe-after-effects-fondamentaux/
10. **Dawan**: Provider's live `Sessions confirmées` published 2026-11-23–27 DaVinci Resolve, 2026-11-30–12-02 shorter DaVinci communication video, 2026-11-30–12-02 WordPress initiation, and multiple Premiere/After Effects/Illustrator dates in Dec, all as **FOAD remote**. A confirmed *cohort date/mode is not a confirmed individual seat*. In particular, `V82-DAWAN-100` original display says Geneva physical location for a different occurrence; its Nov30 FOAD must **not** inherit that city silently. `V82-DAWAN-029` direct provider page distinguishes CHF1375 physical vs CHF1100 remote ex-tax, plus separate per-day and tutoring prices, not one simple full fee. Sources: https://www.dawan.ch/sessions-confirmees ; https://www.dawan.ch/formations/audiovisuel/davinci/davinci-resolve-multicam
11. **ORSYS fact-checking** `OFFER-ORSYS-069`: Swiss official FCK programme lists remote **23 Nov 2026**, with journalists/editors explicitly in target audience. General Paris location rows do not imply CH onsite delivery. Source: https://www.orsys.fr/suisse/formation/fck
12. **BeVisible** `V77-04`: provider old cached booking page lists **20 Nov 2026**, 1 day CHF689, **Downtown Studio Rue des Vieux-Grenadiers 10, 1205 Genève**. Source was crawled four months before check; the booking button does not prove available seats today. Source: https://www.bevisible.swiss/book-online

## Five R-lane IDs still without adequate field proof

| ID | Reason / next proof needed |
|---|---|
| `PCC-P29` | Specific current edition of Photoshop Composing and course-identity/code requires direct page or dated official index; unavailable via current web layer. |
| `PCC-P31` | Specific current edition Photoshop Complex Freisteller/Masken, fees and attendance mode not reliably accessible. |
| `MW-P06` | Microwin INDE course-specific page not retrievable; do not substitute another INDF course (different offer). |
| `V78-04` | ITTA After Effects Advanced page timed out; no current duration/edition proof. |
| `V82-DAWAN-037` | Exact Dawan Graphiste Adobe initiation PDF not accessible; do not infer identity from generic Adobe catalogue. |

Near-term N-lane three held IDs remain: `OFFER-CFJM-018`, `PCC-P41`, `OFFER-HELIAS-014`. **Eight still awaiting sufficient fresh-field proof ≠ eight confirmed content defects.**

## Transaction and quality contract

- This document complements `remainder-101-source-differential-20261105.tsv`, whose rows retain all original frozen IDs, lanes, original source URLs, review_after, due date, focus field and evidence state.
- Evidence states named `PRIMARY_*` mean **some bounded primary source evidence exists**; never confuse with E4/E5, full price access, offer completeness, current available seat or full Website-Gold.
- Limit all later canonical edits to separately approved, small, exact-ID old-value-guarded transactions; after each, CI and readback; do not modify currentness without actual evidence. Maintain historical past dates in catalog and filter in website rather than deleting.
- Existing four FAM-Holds, DE/USA website-Gold, live hosted E5/G3, owner scope approval and external red-team gates are **still OPEN**. No publication, merge or master transfer authorised.
