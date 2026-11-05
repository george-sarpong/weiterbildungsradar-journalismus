# B2 Near-term 39 — source differential and strict no-write ledger (05.11.2026)

This is an **offer-ID-level source-recheck staging ledger**, NOT E4/E5/website Gold and NOT a claim that all 39 offers have been verified. The original fixed 39/140 queue is preserved. This record is attached to the B4 technical mass-import hardening work on PR #10; no source-derived offer fields have yet been written to production files.

## Reconciled population
- Historical due pool: 140 IDs, decomposed into N01 15 + N02 8 + N03 16 = **39 near-term IDs**, and 101 other IDs.
- 39/39 IDs copied from `docs/b2/parallel-review-140-20261105.tsv`, with source URL, existing evidence_state and focus_field intact. No retitling or new offer IDs.
- **10** near-term records contain **partial official source observations**, often bounded by crawler freshness or unresolved edition fields. **29** retain `PENDING_FRESH_EDITION_PROOF`. No automatic broad completion.
- {"PENDING_FRESH_EDITION_PROOF":29,"PRIMARY_PARTIAL_TARIFF_MATCH":1,"PRIMARY_PARTIAL_PRICE_GAP_SIGNAL":1,"PRIMARY_PARTIAL_EDITION_VARIANT":1,"PRIMARY_PARTIAL_EDITION_MATCH":1,"PRIMARY_PARTIAL_SESSION_MATCH":1,"PRIMARY_PARTIAL_EDITION_PRICE_MATCH":2,"PRIMARY_INTERNAL_CONTRADICTION":1,"PRIMARY_PARTIAL_SESSION_PRICE":1,"PRIMARY_PARTIAL_PRICE_COMPLEX":1}.

## Material findings and non-findings

1. **MAZ Thementagung KI — OFFER-MAZ-100:** official MAZ course page displays **18 Nov 2026**, standard **CHF 380**, discounted **CHF 290** for journalists. Existing Smart sidecar `priceOptions=[]`. This is a **candidate sidecar evidence gap**, *not yet a patch*. Before writing, compare full offer text and source/conditional eligibility. No verified seat availability or city.
   Source: https://www.maz.ch/kurs/maz-thementagung-ki-im-journalismus

2. **Schreibszene V59-SZ01, V59-SZ04:** current official pages/index reproduce **17 Nov 2026, Zürich, CHF 700** (“Das gelungene Interview”) and **10 Nov 2026, Zürich, CHF 640** (“Redigieren”). Existing Smart sidecar numeric amounts already **match**. Source evidence improvement, not new offer, not justified price patch.
   Sources: https://schreibszene.ch/das-gelungene-interview/ | https://schreibszene.ch/redigieren/ | https://schreibszene.ch/kurse/

3. **PCC-P27 / PCC-P19:** official PC-COLLEGE pages support published 05–06 Nov 2026 InDesign XML, 2 days, **from EUR 990 excl 19% VAT**, and 06 Nov 2026 Creative Cloud “Neuerungen”, 1 day online with **EUR 630 excl VAT**. Existing sidecar FROM/min values already match the generic page. A generic “Basel, Bern, Zürich” headline is **not** the exact Nov edition venue; an online row is not onsite CH proof; “auf Anfrage” bespoke service is distinct from a scheduled online occurrence. No guaranteed course seat or Swiss gross fee.
   Sources: https://www.pc-college.ch/seminar/programmieren-fuer-anfaenger/adobe-indesign-und-xml-seminar-schulung-ixm.php | https://www.pc-college.ch/seminar/photoshop-cc/adobe-creative-cloud-cc-seminar-schulung-ade.php

4. **IF-G12:** current ifage detail S-03214 publishes **16–25 Nov 2026**, **five 3h sessions**, **CHF 620** and **ifage Montbrillant**. “5j / 15:00” means 5 meeting days with 15 contact hours, **not five full 8-hour tuition days**. No invented seat count.
   Source: https://www.ifage.ch/formation/tic/graphisme-infographie/mise-en-page-et-maquettage/

5. **V78-05 / V78-02:** ITTA Final Cut Pro fundamentals shows **18–20 Nov 2026** as separate virtual/Genève cohorts, **3 days**, display **CHF 2'350**. Premiere Pro Advanced source **internally contradicts** itself: header “2 jours” versus prose “sur trois jours”. Preserve `HOLD_DURATION_SOURCE_CONFLICT`, no verified duration or synthetic total.
   Sources: https://www.itta.net/formations/multimedia/video-et-son/final-cut-pro-fondamentaux/ | https://www.itta.net/formations/multimedia/video-et-son/adobe-premiere-pro-avance/

6. **V82-DAWAN-020:** 2-day course advertises distinct per-day, distanciel and tutoring pricing (CHF 875 per day ex tax, CHF 700 remote ex tax, 10h tutor credit CHF 750 ex tax). Not a single all-in price; observed October 2026 rows do not prove the queued Nov 19 edition.
   Source: https://www.dawan.ch/formations/audiovisuel/after-effects/after-effects-pour-le-motion-design-approfondissement

7. **MAZ-070:** MAZ “Klima” source publicly displays CHF 650 as journalist tariff, already in sidecar. Booking iframe prevents positive November exact edition proof; no new regular tariff should be invented.
   Source: https://www.maz.ch/kurs/klima-berichten-mit-einer-neuen-dimension

## Transaction policy and next batch
- **0** new canonical identities; **0** price/availability/location/date/source/approval edits to `data.js` or `smart-search-data.js` in this workblock.
- Candidate new write is limited to demonstrable field difference **MAZ-100 price sidecar** plus any independently proven updated edition fields after FULL canonical data.js readback. Exact old-value guard and owner scope needed.
- Parallel evidence workers keep unique owners N01 (15), N02 (8), N03 (16). A single writer may accept only 4–8 distinct, verified offer IDs per atomic commit with SHA lease, CI, readback and Band02 event.
- Pending status is **not proof of error**, no deferred-auto-reviewAfter refresh. NO E4/E5/G3/publication or master merge implied by this ledger.
