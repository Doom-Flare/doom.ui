// src/tools/make_dist.mjs —— 把数据包本体打成发行 zip（确定性：同样的输入 ⇒ 逐字节同样的输出）。
//
//   node src/tools/make_dist.mjs            # 重新生成 dist/ 的 zip 与 SHA256SUMS.txt
//   node src/tools/make_dist.mjs --check    # 只校验：现成的 zip 与"现在重新打一次"是否逐字节相同（不同 ⇒ 退出码 1）
//
// 为什么自己写 zip：发行物必须可复现 —— 同样的包体重新打一次，字节要完全一样，
// 否则「dist 里的 zip 是不是这一版源码打的」就永远说不清。系统 zip / Compress-Archive
// 会写进本机时间戳与平台相关的属性 ⇒ 每次打出来的字节都不同。这里把时间戳钉死、条目排序钉死。
//
// 入口（三份变体，命令层逐字节相同，差异只在 pack.mcmeta 与 gamerule 名）：
//   <仓库根>/doom.ui/                             ★ 主用：1.21.9 – 1.21.10（旧 gamerule 名）
//   <仓库根>/variants/doom.ui-1.21.11-26.3/         1.21.11 – 26.3（新 gamerule 名）
//   <仓库根>/variants/doom.ui-1.21.6-1.21.8/        1.21.6 – 1.21.8（源包 mcmeta 原样）
// zip 内顶层目录 = 各自包体目录名（doom.ui/ · doom.ui-1.21.11-26.3/ · doom.ui-1.21.6-1.21.8/）。
// 出口：<仓库根>/dist/<name>.zip 与 <仓库根>/dist/SHA256SUMS.txt（三行，按 zip 名排序）。
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const TOOL = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOL, '..', '..');
const DIST = path.join(ROOT, 'dist');
const CHECK = process.argv.includes('--check');

// 变体表：{包体目录, zip 附件名}。zip 内顶层目录名 = 包体目录的 basename。
const VARIANTS = [
  { pack: path.join(ROOT, 'doom.ui'),                            name: 'doom.ui-v2.1.1.zip' },
  { pack: path.join(ROOT, 'variants', 'doom.ui-1.21.11-26.3'),   name: 'doom.ui-v2.1.1-mc1.21.11+.zip' },
  { pack: path.join(ROOT, 'variants', 'doom.ui-1.21.6-1.21.8'),  name: 'doom.ui-v2.1.1-mc1.21.6-1.21.8.zip' },
];

// ---- CRC32（自实现：不依赖 Node 版本里的 zlib.crc32）----
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c; }
  return t;
})();
function crc32(buf) { let c = -1; for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8); return (c ^ -1) >>> 0; }

// ---- 收集条目（文件 + 其所属目录），排序钉死 ----
function collect(PACK) {
  const files = [];
  const dirs = new Set();
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { walk(p); }
      else files.push(p);
    }
  };
  walk(PACK);
  // zip 内顶层目录 = 包体目录名（不是 variants/），与包体本身解压后一致
  const base = path.basename(PACK);
  for (const f of files) {
    const rel = path.relative(PACK, f).split(path.sep).join('/');   // 形如 data/doom.ui/...
    const parts = rel.split('/');
    for (let i = 1; i < parts.length; i++) dirs.add(base + '/' + parts.slice(0, i).join('/') + '/');
  }
  const entries = [];
  for (const f of files) entries.push({ name: base + '/' + path.relative(PACK, f).split(path.sep).join('/'), file: f });
  for (const d of dirs) entries.push({ name: d, file: null });
  return entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}
// ---- 写 zip（DOS 时间戳钉死在 1980-01-01 00:00:00）----
function buildZip(entries) {
  // entries: [{ name（zip 内条目名）, file（磁盘绝对路径）| null（目录条目）}]
  const locals = [];
  const central = [];
  let offset = 0;
  for (const { name, file } of entries) {
    const raw = file ? fs.readFileSync(file) : Buffer.alloc(0);
    const deflated = zlib.deflateRawSync(raw, { level: 9 });
    const use = deflated.length < raw.length ? deflated : raw;
    const method = deflated.length < raw.length ? 8 : 0;
    const nameBuf = Buffer.from(name, 'utf8');
    const flag = /[^\x20-\x7e]/.test(name) ? 0x0800 : 0;   // 非 ASCII 名字标 UTF-8（EPFL 约定）
    const crc = crc32(raw);

    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(flag, 6);
    lh.writeUInt16LE(method, 8); lh.writeUInt16LE(0, 10); lh.writeUInt16LE(0x0021, 12);
    lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(use.length, 18); lh.writeUInt32LE(raw.length, 22);
    lh.writeUInt16LE(nameBuf.length, 26); lh.writeUInt16LE(0, 28);
    locals.push(lh, nameBuf, use);

    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(flag, 8); ch.writeUInt16LE(method, 10); ch.writeUInt16LE(0, 12); ch.writeUInt16LE(0x0021, 14);
    ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(use.length, 20); ch.writeUInt32LE(raw.length, 24);
    ch.writeUInt16LE(nameBuf.length, 28); ch.writeUInt16LE(0, 30); ch.writeUInt16LE(0, 32);
    ch.writeUInt16LE(0, 34); ch.writeUInt16LE(0, 36); ch.writeUInt32LE(0, 38); ch.writeUInt32LE(offset, 42);
    central.push(ch, nameBuf);

    offset += lh.length + nameBuf.length + use.length;
  }
  const cd = Buffer.concat(central);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(0, 4); eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8); eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cd.length, 12); eocd.writeUInt32LE(offset, 16); eocd.writeUInt16LE(0, 20);
  return Buffer.concat([...locals, cd, eocd]);
}

// ---- 主流程 ----
for (const v of VARIANTS) {
  if (!fs.existsSync(path.join(v.pack, 'pack.mcmeta'))) { console.error('❌ 找不到 ' + v.pack + '/pack.mcmeta —— 包体目录不对？'); process.exit(1); }
}
const results = VARIANTS.map((v) => {
  const entries = collect(v.pack);
  const zip = buildZip(entries);
  return { v, entries, zip, sha: crypto.createHash('sha256').update(zip).digest('hex') };
});

if (CHECK) {
  let allSame = true;
  for (const r of results) {
    const target = path.join(DIST, r.v.name);
    if (!fs.existsSync(target)) { console.error('❌ dist/ 里没有 ' + r.v.name + ' —— 先跑一次不带 --check 的。'); process.exit(1); }
    const cur = fs.readFileSync(target);
    const curSha = crypto.createHash('sha256').update(cur).digest('hex');
    const same = cur.equals(r.zip);
    if (!same) allSame = false;
    const nFiles = r.entries.filter((e) => e.file).length;
    console.log(r.v.name + '：条目 ' + r.entries.length + ' 个（' + nFiles + ' 文件）· 重新打包 ' + r.zip.length + ' B · 现存 ' + cur.length + ' B');
    console.log('  重新打包 sha256 ' + r.sha);
    console.log('  dist 现存  sha256 ' + curSha);
    console.log('  ' + (same ? '✅ 逐字节一致（0 差异）' : '❌ 不一致 —— dist 里的 zip 不是这份包体打的'));
  }
  process.exit(allSame ? 0 : 1);
}

fs.mkdirSync(DIST, { recursive: true });
const sums = [];
for (const r of results) {
  fs.writeFileSync(path.join(DIST, r.v.name), r.zip);
  sums.push({ name: r.v.name, sha: r.sha });
  const nFiles = r.entries.filter((e) => e.file).length;
  console.log('✅ 写出 dist/' + r.v.name + '（' + r.zip.length + ' B · ' + nFiles + ' 文件）');
  console.log('   sha256 ' + r.sha);
}
sums.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
fs.writeFileSync(path.join(DIST, 'SHA256SUMS.txt'), sums.map((s) => s.sha + '  ' + s.name).join('\n') + '\n');
console.log('✅ 写出 dist/SHA256SUMS.txt（' + sums.length + ' 行）');
