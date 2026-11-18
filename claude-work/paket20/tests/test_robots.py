"""Paket 20 – robots.txt (E125): Trainings-Crawler gesperrt, Such- und Nutzer-Crawler erlaubt, Sitemap bleibt.
Aufruf: python3 -I claude-work/paket20/tests/test_robots.py claude-work/paket20/website/robots.txt"""
import sys, urllib.robotparser
txt = open(sys.argv[1], encoding="utf-8").read()
rp = urllib.robotparser.RobotFileParser(); rp.parse(txt.splitlines())
TRAINING = ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "meta-externalagent", "Amazonbot", "Bytespider"]
OFFEN = ["Googlebot", "Bingbot", "OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "Applebot",
         "meta-webindexer", "Amzn-SearchBot", "PerplexityBot", "DuckDuckBot"]
URLS = ["https://mediaskills.ch/", "https://mediaskills.ch/methodik.html", "https://mediaskills.ch/data-p18.js"]
ok = n = 0
def t(name, cond, info=""):
    global ok, n
    n += 1; ok += bool(cond); print(("PASS " if cond else "FAIL ") + name + ("" if cond else f" – {info}"))
gesperrt = [b for b in TRAINING if any(rp.can_fetch(b, u) for u in URLS)]
t(f"R1 Trainings-Crawler gesperrt ({', '.join(TRAINING)})", not gesperrt, str(gesperrt))
offen = [b for b in OFFEN if not all(rp.can_fetch(b, u) for u in URLS)]
t(f"R2 Such- und Nutzer-Crawler erlaubt ({len(OFFEN)} geprüft)", not offen, str(offen))
t("R3 Sitemap-Zeile bleibt", rp.site_maps() == ["https://mediaskills.ch/sitemap.xml"], str(rp.site_maps()))
# RFC 9309: jede Gruppe beginnt mit User-agent; nur bekannte Felder; jede Trainings-Gruppe hat genau «Disallow: /»
zeilen = [z.split("#")[0].strip() for z in txt.splitlines()]; zeilen = [z for z in zeilen if z]
felder = {z.split(":", 1)[0].strip().lower() for z in zeilen}
t("R4 nur Felder user-agent, allow, disallow, sitemap (RFC 9309)", felder <= {"user-agent", "allow", "disallow", "sitemap"}, str(felder))
gruppen = {}; ua = None
for z in zeilen:
    k, v = [s.strip() for s in z.split(":", 1)]
    if k.lower() == "user-agent": ua = v; gruppen[ua] = []
    elif k.lower() != "sitemap": gruppen[ua].append(f"{k}: {v}")
t("R5 je Trainings-Crawler eine eigene Gruppe mit genau «Disallow: /»", all(gruppen.get(b) == ["Disallow: /"] for b in TRAINING), str({b: gruppen.get(b) for b in TRAINING}))
t("R6 Datei unter 500 KiB (Google-Grenze), UTF-8", len(txt.encode()) < 500 * 1024)
print(f"{ok}/{n} PASS"); sys.exit(0 if ok == n else 1)
