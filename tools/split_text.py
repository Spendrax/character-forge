# Takes the long texts (descriptions, monster abilities) out of the built data files, so the lists load fast and
# the texts follow in the background: feats.js keeps names, levels, traits…; feats-text.js puts each `d` back.
# Run by pf2-build.py and sf2-build.py at the end, or by hand:  python3 tools/split_text.py data/pf2 PF2DATA
import json, os, re, sys

LISTS = {'feats': ['d'], 'spells': ['d'], 'items': ['d'], 'bestiary': ['d', 'abil']}
TAIL = '; })(typeof window !== "undefined" ? window : globalThis);\n'


def read(path, var):
    s = open(path).read()
    m = re.search(r'P\.' + var + r' = ', s)
    return s[:m.end()], json.loads(s[m.end():s.rindex('; })(')])


def run(out, glob):
    note = '// The long texts of %s.js (same order), read after it. Built by tools/split_text.py; same licence as %s.js.\n'
    head = '(function (r) { var P = r.%s = r.%s || {}, T = ' % (glob, glob)
    for name, fields in LISTS.items():
        p = os.path.join(out, name + '.js')
        pre, lst = read(p, name)
        if not any(k in e for e in lst for k in fields):
            continue  # already split
        T = []
        for e in lst:
            row = [e.pop(k, None) for k in fields]
            while row and row[-1] is None:
                row.pop()
            T.append(row or 0)
        with open(p, 'w') as f:
            f.write(pre + json.dumps(lst, ensure_ascii=False, separators=(',', ':')) + TAIL)
        with open(os.path.join(out, name + '-text.js'), 'w') as f:
            f.write(note % (name, name) + head + json.dumps(T, ensure_ascii=False, separators=(',', ':')))
            f.write(', F = ' + json.dumps(fields) + '; (P.' + name + ' || []).forEach(function (e, i) { F.forEach(function (k, j) { if (T[i] && T[i][j] != null) e[k] = T[i][j]; }); }); P.' + name + 'Text = 1' + TAIL)
    # the core lists (backgrounds, class features, deities, actions…) the same way, in one file
    p = os.path.join(out, 'core.js')
    pre, core = read(p, 'core')
    T = {k: [e.pop('d', 0) for e in v] for k, v in core.items() if isinstance(v, list) and v and isinstance(v[0], dict) and any('d' in e for e in v)}
    if T:
        with open(p, 'w') as f:
            f.write(pre + json.dumps(core, ensure_ascii=False, separators=(',', ':')) + TAIL)
        with open(os.path.join(out, 'core-text.js'), 'w') as f:
            f.write(note % ('core', 'core') + head + json.dumps(T, ensure_ascii=False, separators=(',', ':')))
            f.write('; Object.keys(T).forEach(function (k) { ((P.core || {})[k] || []).forEach(function (e, i) { if (T[k][i]) e.d = T[k][i]; }); }); P.coreText = 1' + TAIL)
    for f in sorted(os.listdir(out)):
        print(f, round(os.path.getsize(os.path.join(out, f)) / 1024), 'KB')


if __name__ == '__main__':
    run(sys.argv[1], sys.argv[2])
