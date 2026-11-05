# B2 Near-term 39 — source differential and strict release-gated ledger (05.11.2026)

This is an **offer-ID-level source-recheck staging ledger**, NOT E4/E5/website Gold and NOT a claim that all 39 offers have been verified. The original fixed 39/140 queue is preserved. This record is attached to the B4 technical mass-import hardening work on PR #10; no source-derived offer fields have yet been written to production files.

## Reconciled population
- Historical due pool: 140 IDs, decomposed into N01 15 + N02 8 + N03 16 = **39 near-term IDs**, and 101 other IDs.
- 39/39 IDs copied from `docs/b2/parallel-review-140-20261105.tsv`, with source URL, existing evidence_state and focus_field intact. No retitling or new offer IDs.
- **22** near-term records contain **partial official source observations**, bounded by crawler freshness and still open booking/edition/scope details. **17** retain `PENDING_FRESH_EDITION_PROOF`. This is not 22/39 E4 PASS and not a claim of 22 material defects.
- The prior 10/29 state (EVT216) is an earlier parent; the current 22/17 state is governed by the TSV row statuses. N01 15, N02 8 and N03 16 stay exclusive.

## Material findings and non-findings

1. **MAZ Thementagung KI — OFFER-MAZ-100:** official MAZ course page displays **18 Nov 2026**, standard **CHF 380**, discounted **CHF 290** for journalists. Existing Smart sidecar originally had `priceOptions=[]`; the old-value-guarded PR-only commit `d39da35bf7aedd1a25aaa668ffedb876d70a46f6` inserted exact CHF 380 REGULAR and CHF 290 CONDITIONAL/PROFESSION options. Full 1,352-Offer and 1,352-Sidecar comparison found exactly two altered sidecar IDs (MAZ077/100), with no delivery promotion. This is NOT a seat or edition booking confirmation.
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
- **0** new canonical IDs and **0** `data.js` edits. Exactly **2** price-only Sidecar IDs were changed on Draft PR (`OFFER-MAZ-077` and `OFFER-MAZ-100`); **0** delivery/location/bookability or other sidecar IDs modified in that transaction. The published site and Drive master were not updated.
- The two MAZ price corrections have been applied to the **draft branch only**. Remaining price-variant conflict at MAZ080 and scope cases MAZ131/149 require source-/owner-specific decisions; the ITTA duration conflict stays open. Further writes require exact old-value guards and Source/CI/Git/Drive readback.
- Parallel evidence workers keep unique owners N01 (15), N02 (8), N03 (16). A single writer may accept only 4–8 distinct, verified offer IDs per atomic commit with SHA lease, CI, readback and Band02 event.
- Pending status is **not proof of error**, no deferred-auto-reviewAfter refresh. NO E4/E5/G3/publication or master merge implied by this ledger.

## Supplementary MAZ / CFJM source panel, 05.11.2026 — 12 newly triaged IDs

These are **offer-field** checks only; exact late-Nov 2026 booking, available seats, venue and price validity per edition are not independently proven by a provider landing page. Keep crawler snapshot age in the TSV, and preserve original `review_after` timestamps rather than silently extending them.

- **OFFER-CFJM-019:** official CFJM JRI page explicitly confirms **09.–27.11.2026** and a three-week intensive module. It does NOT publish a numerical tuition price on the accessible page and does not independently reverify the 2027 follow-on edition. https://www.cfjm.ch/model/formation-continue/fc-jri-29
- **OFFER-MAZ-004:** official MAZ CHF 1'950 journalist tariff; existing structured price already correct. https://www.maz.ch/kurs/audio-radio-interview
- **OFFER-MAZ-044:** CHF 990 regular / CHF 650 journalist, both already present in Sidecar. https://www.maz.ch/kurs/grundlagen-der-interviewfuehrung-workshop
- **OFFER-MAZ-077:** CHF 4'250 regular / CHF 3'100 journalist. These two prices, missing from the earlier structured Sidecar, are now corrected *in PR10 only*. The public course target group says communication professionals and producers; the existing owner scope decision must stay separate from the price fix. https://www.maz.ch/kurs/kompaktkurs-video-fuer-web-und-social-media-kommunikation
- **OFFER-MAZ-080:** archived MAZ `-k` URL shows CHF 999 regular / CHF 650 journalist (older 6-month crawl); newer canonical URL shows only CHF 650 journalist (1-month crawl). **HOLD: cross-version price evidence**. No guaranteed CHF 999 option and no auto-forced deletion of historic base display. https://www.maz.ch/kurs/kreativitaetstraining-mit-mikael-krogerus-k | https://www.maz.ch/kurs/kreativitaetstraining-mit-mikael-krogerus
- **OFFER-MAZ-118:** CHF 650 journalist, already conditional in Sidecar. https://www.maz.ch/kurs/multimedial-erzaehlen-im-lokaljournalismus
- **OFFER-MAZ-120:** CHF 990 regular / CHF 650 journalist, exact match. https://www.maz.ch/kurs/open-source-intelligence-osint-grundlagen-k
- **OFFER-MAZ-131:** CHF 990 regular, exact match. Official target group expressly communication executives/communications staff/speakers; **owner scope signal**, no silent deletion or automatic journalistic scope certification. https://www.maz.ch/kurs/praesentationen-halten
- **OFFER-MAZ-135:** CHF 990 regular / CHF 650 journalist, exact match. https://www.maz.ch/kurs/recherche-in-oeffentlichen-registern-j
- **OFFER-MAZ-146:** **older** official crawl (8 months ago) CHF 1'060, **newer** official crawl (2 weeks ago) CHF 1'300 journalist; current `data.js` / Sidecar have CHF 1'300, so **NO_CHANGE**, do not regress to stale price. https://www.maz.ch/kurs/satire-kolumne-glosse-grundlagen
- **OFFER-MAZ-149:** CHF 1'980 regular matches current offer; official target explicitly employees in companies/agencies/NPOs. Existing **OWNER_SCOPE_HOLD** remains. https://www.maz.ch/kurs/schreiben-fuers-web-onlinetexten-leichtgemacht
- **OFFER-MAZ-163:** CHF 990 regular / CHF 650 journalist, exact match. Current data lists an undetailed 1-day start; the displayed `duration` remains not source-verified. https://www.maz.ch/kurs/tiktok-junge-zielgruppen-professionell-erreichen-k

No sidecar modification to any of those ten other newly triaged IDs. New 22/17 status is a larger **triage** population, not proof of all mandated currentness or per-edition booking.
