"""Install the independent guide into NCT-Chinese-Version (Python 3)."""
import argparse, hashlib, json, shutil
from pathlib import Path

SOURCE=Path(__file__).resolve().parent
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('game',type=Path,help='Path to the NCT-Chinese-Version directory')
parser.add_argument('--upgrade',action='store_true',help='Upgrade only recognized previously published guide files')
parser.add_argument('--dev-tools',action='store_true',help='Also install optional test and model-generation scripts')
args=parser.parse_args();game=args.game.resolve()
entry=game/'campaign-trail/index.html'
if not entry.is_file() or not (game/'localization/i18n.js').is_file():
 parser.error('Target must be NCT-Chinese-Version, with campaign-trail/index.html and localization/i18n.js')
baseline=json.loads((SOURCE/'tests/original-algorithm-sha256.json').read_text(encoding='utf8')) if (SOURCE/'tests/original-algorithm-sha256.json').exists() else None
previous=json.loads((SOURCE/'previous-versions.json').read_text(encoding='utf8'))
messages=json.loads((SOURCE/'guide/messages.json').read_text(encoding='utf8'))
previous_messages=json.loads((SOURCE/'previous-messages.json').read_text(encoding='utf8')) if (SOURCE/'previous-messages.json').exists() else {}
copies=[(p,game/'localization/guide'/p.name) for p in (SOURCE/'guide').iterdir() if p.is_file() and (p.suffix in ['.js','.css'] or p.name=='messages.json')]
if args.dev_tools:
 copies += [(p,game/'tests'/p.name) for p in (SOURCE/'tests').glob('guide*.cjs')]
 copies += [(SOURCE/'tools/build-guide.cjs',game/'tools/build-guide.cjs')]
# Reject conflicting existing files before writing anything.
for source,target in copies:
 if target.exists() and target.read_bytes()!=source.read_bytes():
  digest=hashlib.sha256(target.read_bytes()).hexdigest()
  if not args.upgrade or digest not in previous.get(target.relative_to(game).as_posix(),[]):
   parser.error('Existing modified or unrecognized guide file would be overwritten: '+str(target)+' (use --upgrade only for recognized releases)')
updates=[]
for language,additions in messages.items():
 target=game/'localization'/(language+'.json');data=json.loads(target.read_text(encoding='utf8'))
 for key,value in additions.items():
  if key in data and data[key]!=value and not (args.upgrade and data[key] in previous_messages.get(language,{}).get(key,[])):parser.error('Existing translation conflicts: '+key)
 data.update(additions);updates.append((target,json.dumps(data,ensure_ascii=False,indent=2)+'\n'))
text=entry.read_text(encoding='utf8')
anchor='<script src="/localization/stories.js"></script>'
links='\n    <link rel="stylesheet" href="/localization/guide/guide.css">\n    <script src="/localization/guide/model.js"></script>\n    <script src="/localization/guide/achievement-data.js"></script>\n    <script src="/localization/guide/achievements.js"></script>\n    <script src="/localization/guide/guide.js"></script>'
if '/localization/guide/model.js' not in text:
 if anchor not in text:parser.error('Expected story localization script anchor is absent')
 text=text.replace(anchor,anchor+links)
elif '/localization/guide/achievements.js' not in text:
 text=text.replace('<script src="/localization/guide/guide.js"></script>','<script src="/localization/guide/achievement-data.js"></script>\n    <script src="/localization/guide/achievements.js"></script>\n    <script src="/localization/guide/guide.js"></script>')
updates.append((entry,text))
# Backups are local only, ignored by Git; original game calculators are untouched.
backup=game/'.test-artifacts/guide-install-backup'
for target in [p for p,_ in updates]+[p for _,p in copies if p.exists()]:
 relative=target.relative_to(game);copy=backup/hashlib.sha256(target.read_bytes()).hexdigest()/relative
 if not copy.exists():copy.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(target,copy)
for source,target in copies:
 target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target)
for target,text in updates:target.write_text(text,encoding='utf8')
print('Installed guide into',game)
print('Start the game server, choose English at the top, then enable Guide (spoilers).')
print('Optional validation from the game directory: node tools/build-guide.cjs --check')
