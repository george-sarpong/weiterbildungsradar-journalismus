"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),
 path=require("node:path"),os=require("node:os");
const {run}=require("../scripts/target5-bulk-preview-v1.cjs");
const {jobs,excludeProtected}=require("../scripts/target5-source-snapshot-v1.cjs");
const root=path.resolve(__dirname,"..");
const dir=fs.mkdtempSync(path.join(os.tmpdir(),"sfj-no-reopen-"));
try{
 run(dir);
 const all=JSON.parse(fs.readFileSync(path.join(dir,"source-workpacks.json"),"utf8"));
 const policy=JSON.parse(fs.readFileSync(path.join(root,"data/staging/evt270-currentness-policy-20261107.json"),"utf8"));
 const before=all.flatMap(p=>p.items);
 const filtered=excludeProtected(all,policy),after=filtered.flatMap(p=>p.items);
 const protectedIds=new Set(policy.protectedB2.map(r=>r.offerId));
 assert.equal(before.length,140);
 assert.equal(after.length,111);
 assert.equal(protectedIds.size,29);
 assert.equal(new Set(after.map(r=>r.id)).size,111);
 assert.ok(before.some(r=>r.id==="OFFER-MAZ-176"),"Frozen course must exist in old 140");
 assert.ok(!after.some(r=>r.id==="OFFER-MAZ-176"),"Frozen source must not be fetched again");
 assert.ok(after.some(r=>r.id==="OFFER-MAZ-004"));
 assert.ok(after.every(r=>!protectedIds.has(r.id)));
 const permitted=jobs(filtered);
 assert.ok(permitted.length<=111&&permitted.length>0);
 assert.equal(new Set(permitted.flatMap(j=>j.offerIds)).size,111);
 assert.ok(permitted.every(j=>j.offerIds.every(id=>!protectedIds.has(id))));
 const broken={...policy,protectedB2:policy.protectedB2.slice(1)};
 assert.throws(()=>excludeProtected(all,broken),/NO_REOPEN_POLICY_REQUIRED/);
 const missing={...policy,origin:{...policy.origin,protectedDue:0}};
 assert.throws(()=>excludeProtected(all,missing),/NO_REOPEN_POLICY_REQUIRED/);
 console.log("TARGET5_EVT271_NO_REOPEN_29_PROTECTED_111_ALLOWED_NO_NETWORK_PASS");
}finally{fs.rmSync(dir,{recursive:true,force:true})}
