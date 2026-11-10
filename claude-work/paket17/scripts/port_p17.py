"""Paket 17: app-v42.js = paket15/website/app-v41.js + E114–E116.
E115 Zahlen: bis vier Stellen ohne Trennzeichen (CHF 1300), ab fünf Stellen mit Apostroph (CHF 13'000), Währung vor dem Betrag.
     Preise mit publiziertem «zzgl./exkl. MWST» zeigen den Zusatz auf der Karte (sonst gilt E108: inkl. MWST).
E116 Badge «Anbieterland» nur, wenn bekannt. E114 Niveau «Expert» → «Experte/Expertin».
Aufruf (aus claude-work/): python3 -I paket17/scripts/port_p17.py"""
import hashlib, pathlib, re
R = pathlib.Path(__file__).resolve().parents[2]
s = (R / "paket15/website/app-v41.js").read_text(encoding="utf-8")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90]); s = s.replace(a, b)
# E115: Zahlformat
rep('''  const compactAmount = value => String(value ?? "")
    .replace(/’/g, "'")
    .replace(/\\.00\\b/g, "")
    .replace(/[.,](?:[-–—])?$/, "");''',
'''  // E115: Schweizer Schreibweise – bis vier Stellen ohne Trennzeichen (1300), ab fünf Stellen mit Apostroph (13'000).
  const swissInt = digits => digits.length > 4 ? digits.replace(/\\B(?=(\\d{3})+(?!\\d))/g, "'") : digits;
  const swissNumber = value => {
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value ?? "");
    const [int, dec] = Math.abs(n).toFixed(2).split(".");
    return `${n < 0 ? "-" : ""}${swissInt(int)}${dec === "00" ? "" : `.${dec}`}`;
  };
  const swissAmountToken = token => {
    let t = token.replace(/’/g, "'").replace(/[.,](?:[-–—])?$/, "").replace(/\\.00$/, "");
    if (/^\\d{1,3}(?:[',]\\d{3})+(?:\\.\\d{1,2})?$/.test(t)) t = t.replace(/[',](?=\\d{3})/g, "");
    const m = t.match(/^(\\d+)([.,]\\d{1,2})?$/);
    return m ? `${swissInt(m[1])}${m[2] ?? ""}` : t;
  };
  const compactAmount = value => String(value ?? "").replace(/\\d[\\d'’.,]*(?:[-–—](?!\\d))?/g, swissAmountToken);''')
s, k = re.subn(r'([A-Za-z_][\w.]*(?:\([^()]*\))?)\.toLocaleString\("de-CH"\)', r'swissNumber(\1)', s)
assert k == 12, k
rep('"501_2000": "501 bis 2\'000",', '"501_2000": "501 bis 2000",')
rep('UEBER_2000: "Über 2\'000",', 'UEBER_2000: "Über 2000",')
rep('[c.mid, "501–2\'000"], [c.high, "Über 2\'000"]', '[c.mid, "501–2000"], [c.high, "Über 2000"]')
# E115: publizierter MWST-Zusatz bleibt auf der Karte sichtbar
rep("  const compactPrice = offer => {\n    const raw = String(offer.priceDisplay ?? \"\").trim();",
    "  const compactPriceBase = offer => {\n    const raw = String(offer.priceDisplay ?? \"\").trim();")
rep("  const compactAccess = offer => {", '''  const compactPrice = offer => {
    const shown = compactPriceBase(offer);
    const vatExcluded = /\\b(?:zzgl|exkl|excl|exklusive|zuzüglich)\\.?\\s*(?:\\d[\\d.,]*\\s*%\\s*)?(?:MWST|MwSt|Mehrwertsteuer|TVA|VAT)\\b/i.test(String(offer.priceDisplay ?? ""));
    return vatExcluded && /^(?:ab\\s+)?(?:CHF|EUR|USD)\\s*\\d/.test(shown) && !/MWST/i.test(shown) ? `${shown} zzgl. MWST` : shown;
  };

  const compactAccess = offer => {''')
# E116: Anbieterland nur, wenn bekannt
rep('''          <span class="badge">Anbieterland: ${escapeHtml(providerCountryLabel(offer))}</span>''',
    '''          ${providerCountryLabel(offer) !== NOT_RECORDED ? `<span class="badge">Anbieterland: ${escapeHtml(providerCountryLabel(offer))}</span>` : ""}''')
# E114 Punkt 8
rep('EXPERT: "Expert",', 'EXPERT: "Experte/Expertin",')
(R / "paket17/website/app-v42.js").write_text(s, encoding="utf-8")
print("app-v42.js", hashlib.sha256(s.encode()).hexdigest()[:16])
