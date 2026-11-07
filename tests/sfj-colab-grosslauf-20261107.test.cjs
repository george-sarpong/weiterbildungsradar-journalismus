"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict"),path=require("node:path"),cp=require("node:child_process");
const root=path.resolve(__dirname,"..");
const nb=JSON.parse(fs.readFileSync(path.join(root,"notebooks/SFJ_Media_Skills_Grosslauf_3818_OneClick_20261107.ipynb"),"utf8"));
assert.equal(nb.nbformat,4);
assert.equal(nb.cells.length,7);
const cells=nb.cells.map(x=>Array.isArray(x.source)?x.source.join(""):x.source);
assert.ok(cells[1].includes('MODUS = "GROSSLAUF_KOSTENLOS"'));
assert.ok(cells[4].includes("max(newer)<272"));
assert.ok(!cells[4].includes("max(newer)>271"),"Regression: stale EVT271 freeze blocks current Control Plane");
assert.ok(cells[4].includes("SFJ_GROSSLAUF_TARGET5_"));
assert.ok(cells[4].includes("len(all_3818)==3818"));
assert.ok(cells[4].includes("if sha(content)!=manifest271['sources'][k]"));
assert.ok(cells[5].includes("MAX_FREE_URLS"));
assert.ok(cells[5].includes("robot_allowed(url)"));
assert.ok(cells[5].includes("ROBOT_HOST_LOCKS"));
assert.ok(cells[5].includes("PAID_RESERVED_UNCERTAIN_NO_AUTO_RETRY"));
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
