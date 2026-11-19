"""Fresh install and exact published-version upgrade, including message changes."""
import hashlib,json,re,shutil,subprocess,sys,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];GAME=Path(sys.argv[1]).resolve()
(ROOT/'.test-artifacts').mkdir(exist_ok=True)
target=Path(tempfile.mkdtemp(prefix='route-install-',dir=ROOT/'.test-artifacts'))
for name in ['campaign-trail/index.html','localization/i18n.js','localization/en-US.json','localization/zh-CN.json']:
 p=target/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes((GAME/name).read_bytes())
def install(*args):return subprocess.run([sys.executable,str(ROOT/'install.py'),str(target),*args],capture_output=True)
def snapshot():return {p.relative_to(target).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in target.rglob('*') if p.is_file()}
def check(result):assert result.returncode==0,result.stderr.decode('utf8',errors='replace')
def bundle_version():
 text=(target/'campaign-trail/index.html').read_text(encoding='utf8')
 versions=[]
 for name in ['guide.css','model.js','achievement-data.js','achievements.js','guide.js']:
  found=re.findall(r'/localization/guide/'+re.escape(name)+r'\?v=([a-f0-9]{16})',text)
  assert len(found)==1,(name,found)
  versions.extend(found)
 assert len(set(versions))==1
 return versions[0]
check(install());fresh=snapshot();version=bundle_version()
check(install());assert {k:v for k,v in snapshot().items() if not k.startswith('.test-artifacts/')}=={k:v for k,v in fresh.items() if not k.startswith('.test-artifacts/')};assert bundle_version()==version
git=['git','-c','safe.directory='+ROOT.as_posix(),'-C',str(ROOT)]
for ref in ['aedd7ed3132ffc984bacf48375240c7a2b1c17fc','0db149e066d0ad3bfb0e75ebeca2a8435557b670','2c5c512aea8a9dbb031fef816537cffcd76419da','48488507f18401d86cab6066bd8c75788b5f5674','80ea5c28fdb515f51bc3424f89f8087e3614f8aa','d4b5ec9a5c20d8b0ee883a2d8218c5c6bd63d9cd','0d555911d056a2a66f65122b08f78ceeaa59ada1','b03bd49ea2ec781b9bc4d436ebc60258e356d787']:
 p=target/'campaign-trail/index.html';p.write_text(re.sub(r'\?v=[a-f0-9]{16}','',p.read_text(encoding='utf8')),encoding='utf8')
 (target/'localization/guide/planner-worker.js').unlink(missing_ok=True)
 for name in ['guide.js','achievements.js','achievement-data.js','messages.json','guide.css']:
  (target/'localization/guide'/name).write_bytes(subprocess.check_output(git+['show',ref+':guide/'+name]))
 old=json.loads(subprocess.check_output(git+['show',ref+':guide/messages.json']))
 for lang,entries in old.items():
  p=target/'localization'/(lang+'.json');data=json.loads(p.read_text(encoding='utf8'));data.update(entries);p.write_text(json.dumps(data,ensure_ascii=False),encoding='utf8')
 before=snapshot();assert install().returncode!=0;assert snapshot()==before
 check(install('--upgrade'))
 assert bundle_version()==version
 for name in ['guide.js','achievements.js','achievement-data.js','messages.json','guide.css','planner-worker.js']:assert (target/'localization/guide'/name).read_bytes()==(ROOT/'guide'/name).read_bytes()
p=target/'localization/guide/achievements.js';p.write_bytes(p.read_bytes()+b'\n// personal edit\n');before=snapshot();assert install('--upgrade').returncode!=0;assert snapshot()==before
p.write_bytes((ROOT/'guide/achievements.js').read_bytes())
p=target/'localization/zh-CN.json';data=json.loads(p.read_text(encoding='utf8'));data['guide.limits']='personal translation';p.write_text(json.dumps(data,ensure_ascii=False),encoding='utf8');before=snapshot();assert install('--upgrade').returncode!=0;assert snapshot()==before
variant=Path(tempfile.mkdtemp(prefix='bundle-variant-',dir=ROOT/'.test-artifacts'))
for name in ['install.py','previous-versions.json','previous-messages.json']:
 shutil.copy2(ROOT/name,variant/name)
(variant/'guide').mkdir()
for source in (ROOT/'guide').iterdir():
 if source.suffix in ['.js','.css'] or source.name=='messages.json':shutil.copy2(source,variant/'guide'/source.name)
worker=variant/'guide/planner-worker.js';worker.write_bytes(worker.read_bytes()+b'\n// isolated cache-version fixture\n')
other=variant/'game'
for name in ['campaign-trail/index.html','localization/i18n.js','localization/en-US.json','localization/zh-CN.json']:
 p=other/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes((GAME/name).read_bytes())
check(subprocess.run([sys.executable,str(variant/'install.py'),str(other)],capture_output=True))
target=other;assert bundle_version()!=version
report={'status':'passed','checks':['Fresh install stamps all five entry assets with one bundle hash; repeated install is byte-identical','A worker-only file change changes every entry asset version','Eight published file/message/CSS versions upgrade, including b03bd49; every upgrade refreshes entry URLs','No writes without explicit upgrade','Unknown script customization rejected before writes','Unknown translation customization rejected before writes']}
(ROOT/'tests/install-routes-results.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8',newline='\n');print('PASS route installation and published-version upgrade')
