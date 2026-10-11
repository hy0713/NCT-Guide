"""Install the independent guide into NCT-Chinese-Version (Python 3)."""
import argparse, hashlib, json, shutil
from pathlib import Path

SOURCE=Path(__file__).resolve().parent
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('game',type=Path,help='Path to the NCT-Chinese-Version directory')
args=parser.parse_args();game=args.game.resolve()
entry=game/'campaign-trail/index.html'
if not entry.is_file() or not (game/'localization/i18n.js').is_file():
 parser.error('Target must be NCT-Chinese-Version, with campaign-trail/index.html and localization/i18n.js')
baseline=json.loads((SOURCE/'tests/original-algorithm-sha256.json').read_text(encoding='utf8')) if (SOURCE/'tests/original-algorithm-sha256.json').exists() else None
messages=json.loads((SOURCE/'guide/messages.json').read_text(encoding='utf8'))
copies=[(p,game/'localization/guide'/p.name) for p in (SOURCE/'guide').iterdir() if p.is_file()]
copies += [(p,game/'tests'/p.name) for p in (SOURCE/'tests').glob('guide*.cjs')]
copies += [(SOURCE/'tools/build-guide.cjs',game/'tools/build-guide.cjs')]
# Reject conflicting existing files before writing anything.
for source,target in copies:
 if target.exists() and target.read_bytes()!=source.read_bytes():
  parser.error('Existing modified guide file would be overwritten: '+str(target))
updates=[]
for language,additions in messages.items():
 target=game/'localization'/(language+'.json');data=json.loads(target.read_text(encoding='utf8'))
 for key,value in additions.items():
  if key in data and data[key]!=value:parser.error('Existing translation conflicts: '+key)
 data.update(additions);updates.append((target,json.dumps(data,ensure_ascii=False,indent=2)+'\n'))
text=entry.read_text(encoding='utf8')
anchor='<script src="/localization/stories.js"></script>'
links='\n    <link rel="stylesheet" href="/localization/guide/guide.css">\n    <script src="/localization/guide/model.js"></script>\n    <script src="/localization/guide/guide.js"></script>'
if '/localization/guide/model.js' not in text:
 if anchor not in text:parser.error('Expected story localization script anchor is absent')
 text=text.replace(anchor,anchor+links)
updates.append((entry,text))
# Backups are local only, ignored by Git; original game calculators are untouched.
backup=game/'.test-artifacts/guide-install-backup'
for target,_ in updates:
 relative=target.relative_to(game);copy=backup/relative
 if not copy.exists():copy.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(target,copy)
for source,target in copies:
 target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target)
for target,text in updates:target.write_text(text,encoding='utf8')
print('Installed guide into',game)
print('Start the game server and reload; enable 攻略（含剧透） at the top.')
print('Optional validation from the game directory: node tools/build-guide.cjs --check')
