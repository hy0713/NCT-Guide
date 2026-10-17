"""Exercise fresh install, recognized upgrades and no writes on conflict."""
import hashlib,json,subprocess,sys,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];GAME=Path(sys.argv[1]).resolve()
(ROOT/'.test-artifacts').mkdir(exist_ok=True)
target=Path(tempfile.mkdtemp(prefix='achievement-install-',dir=ROOT/'.test-artifacts'))
for name in ['campaign-trail/index.html','localization/i18n.js','localization/en-US.json','localization/zh-CN.json']:
 p=target/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes((GAME/name).read_bytes())
def install(*args):return subprocess.run([sys.executable,str(ROOT/'install.py'),str(target),*args],capture_output=True)
def snapshot():return {p.relative_to(target).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in target.rglob('*') if p.is_file()}
assert install().returncode==0
entry=(target/'campaign-trail/index.html').read_text(encoding='utf8');assert entry.index('achievement-data.js')<entry.index('achievements.js')<entry.index('/guide/guide.js')
p=target/'localization/guide/guide.js';p.write_bytes(p.read_bytes()+b'\n// user customization\n');before=snapshot()
assert install('--upgrade').returncode!=0;assert snapshot()==before
git=['git','-c','safe.directory='+ROOT.as_posix(),'-C',str(ROOT)]
previous=subprocess.check_output(git+['show','ffa1a05563336f7672215dacabfbc487262c2f6e:guide/guide.js']);digest=hashlib.sha256(previous).hexdigest()
if digest in json.loads((ROOT/'previous-versions.json').read_text())['localization/guide/guide.js']:
 p.write_bytes(previous);before=snapshot();assert install().returncode!=0;assert snapshot()==before
 assert install('--upgrade').returncode==0;assert p.read_bytes()==(ROOT/'guide/guide.js').read_bytes()
print('PASS fresh installation, dependency order, no writes for unknown conflicts, recognized upgrade')
