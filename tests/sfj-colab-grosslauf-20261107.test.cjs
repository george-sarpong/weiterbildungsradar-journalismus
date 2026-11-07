"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict"),path=require("node:path"),cp=require("node:child_process");
const root=path.resolve(__dirname,"..");
const nb=JSON.parse(fs.readFileSync(path.join(root,"notebooks/SFJ_Media_Skills_Grosslauf_3818_OneClick_20261107.ipynb"),"utf8"));
assert.equal(nb.nbformat,4);
assert.equal(nb.cells.length,7);
const cells=nb.cells.map(x=>Array.isArray(x.source)?x.source.join(""):x.source);
assert.ok(cells[1].includes('MODUS = "GROSSLAUF_KOSTENLOS"'));
assert.ok(cells[4].includes("max(newer)<273"));
assert.ok(!cells[4].includes("max(newer)>271"),"Regression: stale EVT271 freeze blocks current Control Plane");
assert.ok(cells[4].includes("SFJ_GROSSLAUF_TARGET5_"));
assert.ok(cells[4].includes("len(all_3818)==3818"));
assert.ok(cells[4].includes("if sha(content)!=manifest271['sources'][k]"));
assert.ok(cells[5].includes("MAX_FREE_URLS"));
assert.ok(cells[5].includes("robot_allowed(url)"));
assert.ok(cells[5].includes("ROBOT_HOST_LOCKS"));
assert.ok(cells[5].includes("PAID_RESERVED_UNCERTAIN_NO_AUTO_RETRY"));
assert.ok(cells[5].includes("z.testzip() is not None"),"Corrupt Drive checkpoint must fail");
assert.ok(cells[5].includes("sha(body)!=rec['body_sha256']"),"Restore checkpoint source fingerprint");
assert.ok(cells[5].includes("allow_redirects=False"),"Redirects must be inspected individually");
assert.ok(cells[5].includes("REDIRECT_ROBOTS_NOT_ALLOWED"),"Redirect robots gate missing");
assert.ok(!cells[5].includes("'HTTP_403','FETCH_FAILED'"),"Never escalate 403 to Firecrawl");
assert.ok(cells[5].includes("Widersprüchliche bezahlte Firecrawl-Reservation"),
 "Paid reservations must reject conflicting replays");
assert.ok(cells[4].includes("max(newer)>273"),"Later successor must be reviewed with source SHA");
assert.ok(cells[3].includes("len(archive_ids)!=191"),"Full historical archive guard must cover 191, not only 95 due");
assert.ok(cells[3].includes("additional_archived_no_reopen"),"96 non-due historical archives remain blocked");
assert.ok(cells[4].includes("EVT257_191_ARCHIVE_116_QA09_CONTRACT_DRIFT"),
 "Historical archive and QA09 source identity must be verified");
assert.ok(cells[4].includes("ARCHIVED_OFFER_SENT_TO_NETWORK_QUEUE"),
 "Never re-fetch a protected archive offer");
assert.ok(cells[4].includes("archive_ids,TODAY.isoformat()"),
 "Source planner must receive the exact protected archive roster");
assert.ok(cells[4].includes("Geschützter B2-Fall versehentlich in Research-Queue"),
 "Protected B2 no-reopen contract missing");
assert.ok(cells[5].includes("if MODUS=='MIT_FIRECRAWL'"));
assert.ok(cells[5].includes("'formats':['markdown']"));
assert.ok(!cells.slice(3).join("\n").includes("EVT-BIBEL-20261106-247"));
for(const [i,s] of cells.entries()){
 if(i<=2||i===6)continue;
 const p=cp.spawnSync("python3",["-c","import ast,sys;ast.parse(sys.stdin.read())"],{input:s,encoding:"utf8"});
 assert.equal(p.status,0,"Notebook Python compile cell "+i+" "+p.stderr);
}
const py=String.raw`
import json, pathlib, re, collections
p=pathlib.Path("notebooks/SFJ_Media_Skills_Grosslauf_3818_OneClick_20261107.ipynb")
n=json.loads(p.read_text())
ns={}
exec("".join(n["cells"][3]["source"]),ns)
data=pathlib.Path("data.js").read_text()
offers=ns["parse_site_js"](data)
staged=json.loads(pathlib.Path("data/staging/target5-de-usa-wave1-r4-20260915.json").read_text())["records"]
policy=json.loads(pathlib.Path("data/staging/evt270-currentness-policy-20261107.json").read_text())
assert len(offers)==1352 and len(staged)==2466
assert len(policy["protectedB2"])==29
assert sum(1 for x in staged if not re.fullmatch(r"https://[^\s;|]+",x["source_url"]))==30
assert ns["normalize_url"]("https://www.maz.ch/kurs/test?utm_source=xyz")=="https://www.maz.ch/kurs/test"
assert len(ns["find_evidence"]("Course title", "CHF 800\n2027-10-10\nOnline", "https://example.org"))>=2
print("SFJ_COLAB_ONE_CLICK_3818_30_COMPOSITE_NO_NETWORK_PASS")
`;
const p=cp.spawnSync("python3",["-c",py],{cwd:root,encoding:"utf8"});
assert.equal(p.status,0,"Notebook helper/roster smoke failure: "+p.stderr);
console.log(p.stdout.trim());
