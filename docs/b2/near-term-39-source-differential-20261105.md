# B2 Near-term 39 — source differential and strict release-gated ledger (05.11.2026)

This is an **offer-ID-level source-recheck staging ledger**, NOT E4/E5/website Gold and NOT a claim that all 39 offers have been verified. The original fixed 39/140 queue is preserved. This record is attached to the B4 technical mass-import hardening work on PR #10; two price-only source-derived MAZ sidecar corrections have been committed to the **unmerged PR branch**; no source-derived changes were made to `data.js`, the main branch, the Drive master or the deployed website.

## Reconciled population
- Historical due pool: 140 IDs, decomposed into N01 15 + N02 8 + N03 16 = **39 near-term IDs**, and 101 other IDs.
- 39/39 IDs copied from `docs/b2/parallel-review-140-20261105.tsv`, with source URL, existing evidence_state and focus_field intact. No retitling or new offer IDs.
- **38** near-term records contain **bounded provider-source observations** (sometimes only an exact course listing, NOT a specific booked session). **1** retains `PENDING_FRESH_EDITION_PROOF`. This is not 38/39 E4 PASS or evidence of 38 defects.
- The prior 10 partial / 29 pending state (EVT216), followed by 22 partial / 17 pending and 29 partial / 10 pending, are historical parents; 36 partial / 3 pending are earlier states; **the current 38 partial / 1 pending state** is governed by the TSV row statuses. N01 15, N02 8 and N03 16 stay exclusive.

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

No sidecar modification to any of those ten other newly triaged IDs. The historical 29 partial / 10 pending status was a larger **triage** population, not proof of all mandated currentness or per-edition booking.

## Supplementary PCC, ifage, Microwin and VSM provider panel (7 source comparisons)

The following seven additional cases have bounded **primary provider observations**, not full E4/E5 approval. Review after does not change automatically. Dates in cached provider pages are publication evidence only, not proof of a guaranteed place.

- **PCC-P03, P05, P06, P10:** PC-COLLEGE course schedules display 18–20 Nov (Illustrator, Photoshop), 9–11 Nov (Premiere Pro) and 5–6 Nov (InDesign Aufbau) respectively; generic FROM prices and the VAT example are not verified Switzerland-specific final prices. A campus selector “Basel / Bern / Zürich” does not confirm a specific session venue. The price parsing for P03/P05 deliberately remains excluded from budget matching pending Swiss total.
  Sources: https://www.pc-college.ch/seminare-schulungen-kurse/illustrator/adobe-illustrator-grundkurs-ill.php | https://www.pc-college.ch/seminare-schulungen-kurse/photoshop/adobe-photoshop-grundkurs-psg.php | https://www.pc-college.ch/seminare-schulungen-kurse/premiere/adobe-premiere-pro-grundkurs-pre.php | https://www.pc-college.ch/seminare-schulungen-kurse/indesign/adobe-indesign-aufbaukurs-ina.php
- **IF-G06:** ifage listing S-03275 publishes 17 Nov–1 Dec 2026, CHF 620, ifage Montbrillant. It comprises five 3-hour evening sessions (= 15 contact hours), not five conventional 8-hour days. https://www.ifage.ch/formation/tic/graphisme-infographie/
- **MW-P08:** Microwin cached course calendar lists 11 Nov 2026, CHF 790, Wallisellen or livestream. The observed crawl is over a year old; it cannot support a *fresh* edition/seat guarantee. https://www.microwin.com/pages/coursedetails/phot.aspx
- **OFFER-VSM-001:** VSM published 17 Nov, WESTHIVE HARDTURM, Zürich; CHF 250 for nonmembers, CHF 150 for qualifying members/MAZ categories, and a journalist-specific free registration condition. Smart sidecar already has the differentiated tariff classes. Event signup does not guarantee admission. https://www.schweizermedien.ch/events/agenda/2026/2026-11-17-trendtagung-fach-und-spezialmedien-2026/

**Latest 39-ID cohort:** 38 bounded source observations, 1 source-pending proof. The other 101 R-lane IDs are now covered by the separate 101-source ledger and combined 140 field audit. No new full Offer-Gold claim, no booking OPEN claim, no live publication.

## Residual-provider primary differential — 7 additional limited observations (05.11.2026)

Additional **provider/publisher source observations** reconcile seven of the previous ten still pending IDs. This is source coverage only, never E4/G3/seat guarantee. No `data.js` / `smart-search-data.js` update in this batch. Distinguish SOURCE_URL in frozen queue from supplemental external official URL; no canonical URL replacement without a verified stable redirect/alias.

- **PCC-P13:** official course title “Adobe Acrobat – PDF für die Druckvorstufe” on current PC-COLLEGE `acd.php` page, course code ACD 261106, **6 Nov 2026, one day**, online and selectable attendance variants. The queue uses `acp.php`, and **ACD↔ACP identity/version is not yet proven**; put original alias on HOLD. Generic fee is not certified Swiss gross and live-venue/seat remain unproven. [Official ACD page](https://www.pc-college.ch/seminare-schulungen-kurse/acrobat/adobe-acrobat-pdf-fuer-die-druckvorstufe-acd.php)
- **OFFER-HELIAS-011:** dpsuisse official Helias course page confirms **6 Nov 2026**, 09:45–16:45, **Impact Hub Bern**, CHF **0 / 140 / 420** by eligibility category. Do not treat CHF0 as universal; category eligibility requires explicit mapping, and enrolment deadline in the provider detail is already in the past. [Official detail](https://dpsuisse.ch/kurs/weiterf%C3%BChrend-k%C3%BCnstliche-intelligenz?hsLang=de)
- **OFFER-HELIAS-012:** publisher course index confirms **14 Nov 2026, Bern** and exact course title. It does **not** independently reconfirm CHF0/140/420 tiers, Impact Hub room or place availability. [Official index](https://dpsuisse.ch/kurse)
- **OFFER-ORSYS-137:** ORSYS CH official detail confirms **17 Nov 2026, remote**, **2 days / 14h**, **CHF 2'170 ex tax**, matching the original offer and sidecar. The declared audience comprises IT/business/marketing decision-makers; **owner journalism-scope review signal**, no automatic reclassification. [Official detail](https://orsys.fr/suisse/formation/formation-user-experience-etat-art-tendances-en-ergonomie-ihm)
- **V82-DAWAN-039:** official Dawan “Premiers pas en création graphique à Distance” schedule shows **2–3 Nov** and **12–13 Nov 2026**, FOAD remote. It does not prove the original CHF 1'475/1'180 tariff or specific Swiss eligibility. [Official Distance schedule](https://www.dawan.ch/formations/pao/formations-premiers-pas-en-creation-graphique-Distance)
- **V82-DAWAN-049:** Dawan own **“Sessions confirmées”** feed lists **InDesign Initiation 16–18 Nov 2026**, FOAD remote. This is stronger than an undated course description for scheduling but still not a seat guarantee, Swiss gross tuition or price tier verification. [Official confirmed sessions](https://www.dawan.ch/sessions-confirmees)
- **V82-DAWAN-050:** same feed lists **InDesign Approfondissement 19–20 Nov 2026**, FOAD remote. No new price field written, and no availability OPEN inferred. [Official confirmed sessions](https://www.dawan.ch/sessions-confirmees)

**Parent snapshot (historical):** three near-term IDs were source-pending at this stage. In the 140-wide successor, CFJM-018 and PCC-P41 have bounded official catalogue evidence; only OFFER-HELIAS-014 remains source-pending. No one was cancelled or archived.

**Residual work beyond this stage:** 38/39 source-partial is not 38/39 verified or publication-ready; explicitly unresolved eligibility, venues, fees, booking evidence and owner-scope questions remain open. The **101 other due IDs** in disjoint R-lanes have not been moved by this near-term triage. All gates remain enforced.

## 140-wide successor (same date; supersedes previous counts)

- **OFFER-CFJM-018:** the official CFJM continuing-training catalogue has the *exact linked course* “Photoreportage / Post-production et gestion des données”, **6 Nov 2026**. The linked detail URL still cannot be fetched reliably. Only programme identity/date are provider-index-evidenced; price, city/room and individual seat stay HOLD. Source: https://www.cfjm.ch/model/formation-continue
- **PCC-P41:** PC-COLLEGE current online course index explicitly lists “PDF in Adobe Creative Cloud CC – PDF Erstellung ... Workflow für die Druckvorstufe.” This verifies the stable advertised topic but **not** the original queue's 6 Nov session, exact seminar code or Swiss total fee; do not alias to ACD or ADD courses. Source: https://www.pc-college.ch/seminar/online-trainings/index.php
- **OFFER-HELIAS-014:** syndicom original booking URL not accessible, and generic member-registration pages are not offer evidence. It remains the **sole source-pending ID in the 140-wide cohort**; no cancellation or archival decision.

Current N source ledger = **38 bounded partial / 1 pending / 39 total**. Combined 140-wide field matrix covers all 140, with all publication gates held. No canonical course data edits in this successor.
