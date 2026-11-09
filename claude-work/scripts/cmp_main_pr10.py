import json,sys,collections
def arr(p):
    t=open(p,encoding='utf-8').read(); return json.loads(t[t.index('['):t.rindex(']')+1])
def side(p):
    t=open(p,encoding='utf-8').read(); return json.loads(t[t.index('{'):t.rindex('}')+1])
G='/home/claude/git/'
m=arr(G+'main/data.js'); p=arr(G+'pr10/data.js')
mi={o['id']:o for o in m}; pi={o['id']:o for o in p}
print('offers main',len(m),'uniq',len(mi),'| pr10',len(p),'uniq',len(pi))
print('only main',len(mi.keys()-pi.keys()),'only pr10',len(pi.keys()-mi.keys()))
fc=collections.Counter(); changed=set()
for k in mi.keys()&pi.keys():
    a,b=mi[k],pi[k]
    for f in set(a)|set(b):
        if a.get(f)!=b.get(f): fc[f]+=1; changed.add(k)
print('changed offers',len(changed)); print('changed fields',fc.most_common(40))
print('country main',collections.Counter(o.get('country') for o in m))
sm=side(G+'main/smart-search-data.js'); sp=side(G+'pr10/smart-search-data.js')
print('side keys main',list(sm)[:5],'pr10',list(sp)[:5])
print('byId main',len(sm.get('byId',{})),'pr10',len(sp.get('byId',{})))
