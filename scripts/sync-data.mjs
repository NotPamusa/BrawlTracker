import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const HISTORY_DIR = path.join(DATA_DIR, 'history');

const INCOME_CSV = path.join(DATA_DIR, 'income_model.csv');
const CONVERSION_CSV = path.join(DATA_DIR, 'value_conversions.csv');

const OUTPUT_INCOME = path.join(DATA_DIR, 'incomeSources.json');
const OUTPUT_CONVERSION = path.join(DATA_DIR, 'valueConversions.json');

const RESOURCE_KEYS = [
  'coins', 'powerPoints', 'credits', 'bling', 'gems',
  'brawlerKey', 'resourceKey', 'buffieKey',
  'starrDrop', 'epicDrop', 'mythicDrop', 'legendaryDrop',
  'chaosDrop', 'hyperchargeDrop', 'rankedDrop',
  'xp', 'megaBox'
];

function normalizeKey(key) {
  return key.toLowerCase()
    .trim()
    .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
    .replace(/[()]/g, '');
}

function parseCSV(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/)
    .filter(line => line.trim())
    .map(line => line.replace(/^.*:.*:.*: /, ''));
  if (lines.length === 0) return null;
  const separator = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(separator).map(h => h.trim());
  return { lines, headers, separator };
}

function saveHistory(filePath, originalName) {
  if (!fs.existsSync(HISTORY_DIR)) fs.mkdirSync(HISTORY_DIR, { recursive: true });
  
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const currentContent = fs.readFileSync(filePath, 'utf8');
  
  // Find all matches for today
  const existing = fs.readdirSync(HISTORY_DIR)
    .filter(f => f.startsWith(date) && f.endsWith(originalName))
    .sort();

  // Check latest match
  if (existing.length > 0) {
    const latestFile = path.join(HISTORY_DIR, existing[existing.length - 1]);
    const latestContent = fs.readFileSync(latestFile, 'utf8');
    if (currentContent === latestContent) {
      console.log(`Skipping archive: ${originalName} (no changes)`);
      return;
    }
  }

  // Determine suffix
  const suffix = existing.length === 0 ? '' : `_${existing.length + 1}`;
  const historyPath = path.join(HISTORY_DIR, `${date}${suffix}_${originalName}`);
  fs.writeFileSync(historyPath, currentContent);
  console.log(`Archived: ${historyPath}`);
}

function syncIncome() {
  const parsed = parseCSV(INCOME_CSV);
  if (!parsed) return;
  const { lines, headers, separator } = parsed;
  const data = { incomeSources: {} };
  for (let i = 1; i < headers.length; i++) {
    const [main, sub] = headers[i].split('_');
    if (!data.incomeSources[main]) data.incomeSources[main] = {};
    const source = data.incomeSources[main];
    if (sub === 'tail') source.tail = { resources: {} };
    else if (sub) {
      if (!source.tiers) source.tiers = {};
      source.tiers[sub] = { resources: {} };
    } else source.resources = {};
  }
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(separator).map(c => c.trim());
    const key = normalizeKey(cells[0]);
    for (let j = 1; j < cells.length; j++) {
      const val = parseFloat(cells[j]) || 0;
      const [main, sub] = headers[j].split('_');
      const source = data.incomeSources[main];
      let target = (sub === 'tail') ? source.tail : (sub ? source.tiers[sub] : source);
      if (key === 'dayspercycle') source.daysPerCycle = val;
      else if (RESOURCE_KEYS.includes(key)) target.resources[key] = val;
    }
  }
  fs.writeFileSync(OUTPUT_INCOME, JSON.stringify(data, null, 2));
  saveHistory(OUTPUT_INCOME, 'incomeSources.json');
  console.log(`Synced: ${OUTPUT_INCOME}`);
}

function syncConversions() {
  const parsed = parseCSV(CONVERSION_CSV);
  if (!parsed) return;
  const { lines, headers, separator } = parsed;
  const conversions = {};
  const targetHeaders = headers.map(h => normalizeKey(h));
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(separator).map(c => c.trim());
    const sourceKey = normalizeKey(cells[0]);
    conversions[sourceKey] = {};
    for (let j = 1; j < cells.length; j++) {
      const val = parseFloat(cells[j]) || 0;
      const targetKey = targetHeaders[j];
      if (val > 0) conversions[sourceKey][targetKey] = val;
    }
  }
  fs.writeFileSync(OUTPUT_CONVERSION, JSON.stringify(conversions, null, 2));
  saveHistory(OUTPUT_CONVERSION, 'valueConversions.json');
  console.log(`Synced: ${OUTPUT_CONVERSION}`);
}

syncIncome();
syncConversions();

[INCOME_CSV, CONVERSION_CSV].forEach(f => {
  if (fs.existsSync(f)) fs.unlinkSync(f);
});
