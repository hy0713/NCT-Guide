"""Fresh install and exact published-version upgrade, including message changes."""
import hashlib,json,subprocess,sys,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];GAME=Path(sys.argv[1]).resolve()
(ROOT/'.test-artifacts').mkdir(exist_ok=True)
target=Path(tempfile.mkdtemp(prefix='route-install-',dir=ROOT/'.test-artifacts'))
for name in ['campaign-trail/index.html','localization/i18n.js','localization/en-US.json','localization/zh-CN.json']:
 p=target/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes((GAME/name).read_bytes())
def install(*args):return subprocess.run([sys.executable,str(ROOT/'install.py'),str(target),*args],capture_output=True)
def snapshot():return {p.relative_to(target).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in target.rglob('*') if p.is_file()}
def check(result):assert result.returncode==0,result.stderr.decode('utf8',errors='replace')
check(install());fresh=snapshot()
git=['git','-c','safe.directory='+ROOT.as_posix(),'-C',str(ROOT)]
ref='aedd7ed3132ffc984bacf48375240c7a2b1c17fc'
for name in ['guide.js','achievements.js','achievement-data.js','messages.json']:
 (target/'localization/guide'/name).write_bytes(subprocess.check_output(git+['show',ref+':guide/'+name]))
old=json.loads(subprocess.check_output(git+['show',ref+':guide/messages.json']))
for lang,entries in old.items():
 p=target/'localization'/(lang+'.json');data=json.loads(p.read_text(encoding='utf8'));data.update(entries);p.write_text(json.dumps(data,ensure_ascii=False),encoding='utf8')
before=snapshot();assert install().returncode!=0;assert snapshot()==before
check(install('--upgrade'))
for name in ['guide.js','achievements.js','achievement-data.js','messages.json']:assert (target/'localization/guide'/name).read_bytes()==(ROOT/'guide'/name).read_bytes()
p=target/'localization/guide/achievements.js';p.write_bytes(p.read_bytes()+b'\n// personal edit\n');before=snapshot();assert install('--upgrade').returncode!=0;assert snapshot()==before
p.write_bytes((ROOT/'guide/achievements.js').read_bytes())
p=target/'localization/zh-CN.json';data=json.loads(p.read_text(encoding='utf8'));data['guide.limits']='personal translation';p.write_text(json.dumps(data,ensure_ascii=False),encoding='utf8');before=snapshot();assert install('--upgrade').returncode!=0;assert snapshot()==before
report={'status':'passed','checks':['Fresh installation','Published aedd7ed file and message upgrade','No writes without explicit upgrade','Unknown script customization rejected before writes','Unknown translation customization rejected before writes']}
(ROOT/'tests/install-routes-results.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8');print('PASS route installation and published-version upgrade')
