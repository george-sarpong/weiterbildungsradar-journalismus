# P30 U3: Soll der 20 Testangebote (von Hand, vor dem Code)

Festgelegt am 23.11.2026 von Claude, bevor Abruf und Abgleich geschrieben wurden (wie P29 V5).
Grundlage: drei einfache Handprobe-Läufe auf dem GitHub-Runner (curl, Auszüge im Laufprotokoll; Läufe 45207319796, 45208687309, 45209448942), Ablauf danach entfernt. WebFetch im Chat war ohne Freigabe nicht möglich; Artefakte der Läufe kann diese Arbeitsumgebung nicht laden (Speicher von GitHub gesperrt), das Protokoll schon.

Die Auswahl deckt jeden Status ab, dazu maz.ch, orsys.fr, digicomp.ch und mediencampus.ch. Vier Angebote sind HOLD (bekannte defekte Links aus E097, E103, E139, E142), die übrigen 16 sind am 23.11. sichtbar.

Lesart: Ein Wert gilt als «auf der Seite», wenn er im sichtbaren Text, in den strukturierten Daten oder in den Termindaten des Quelltexts steht, in einer üblichen Schreibweise (Datum mit Monatsname oder Zahlen, auch als Zeitraum; Betrag mit oder ohne Tausendertrennzeichen). Ein Titel gilt als vorhanden, wenn er bis auf Satzzeichen, Akzente, Apostrophe oder einen Zusatz wie «- 1 jour» gleich ist. Status nach Vorrang LINK_DEFEKT, NICHT_LESBAR, WEITERLEITUNG, WERT_FEHLT, GEAENDERT, OK; `soll_merkmale` nennt alle zutreffenden.

GEAENDERT kann im ersten echten Lauf nicht vorkommen (keine Hash-Basis, Spezifikation §1.1). Der Test gibt deshalb für OFFER-MEDIENCAMPUS-001 einen absichtlich falschen Vormonats-Hash vor.

Befund schon jetzt: OFFER-CFJM-007 ist sichtbar, der Link liefert 404.
