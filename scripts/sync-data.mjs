import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const HISTORY_DIR = path.join(DATA_DIR, 'history');

const INCOME_CSV = path.join(DATA_DIR, 'income_model.csv');
const CONVERSION_CSV = path.join(DATA_DIR, 'value_conversions.csv');

const METADATA_CSV = path.join(DATA_DIR, 'game_metadata.csv');
const OUTPUT_INCOME = path.join(DATA_DIR, 'incomeSources.json');
const OUTPUT_CONVERSION = path.join(DATA_DIR, 'valueConversions.json');
const METADATA_FILE = path.join(DATA_DIR, 'gameMetadata.json');
const BRAWLERS_FILE = path.join(DATA_DIR, 'brawlers.json');

const RESOURCE_KEYS = [
  'coins', 'powerPoints', 'credits', 'bling', 'gems',
  'brawlerKey', 'resourceKey', 'buffieKey',
  'starrDrop', 'epicDrop', 'mythicDrop', 'legendaryDrop',
  'chaosDrop', 'hyperchargeDrop', 'rankedDrop',
  'xp', 'megaBox'
];

/**
 * Brawler data overrides for fixing API inconsistencies.
 * Add names in UPPERCASE.
 */
const BRAWLER_OVERRIDES = {
  renames: {
    'GLOWBERT': 'GLOWY',
  },
  exclusions: [
    'BUZZLIGHT_YEAR',
  ]
};

function normalizeKey(key) {
  return key.toLowerCase()
    .trim()
    .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
    .replace(/[()]/g, '');
}

function parseValue(val) {
  const trimmed = val.trim();
  if (trimmed === '') return 0;
  const lower = trimmed.toLowerCase();
  if (lower === 'true') return true;
  if (lower === 'false') return false;
  const num = parseFloat(trimmed);
  return isNaN(num) ? trimmed : num;
}

function parseCSV(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/)
    .filter(line => line.trim())
    .map(line => line.replace(/^.*:.*:.*: /, ''));
  if (lines.length === 0) return null;
  const separator = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(separator).map(h => h.trim().replace(/^"|"$/g, ''));
  return { lines, headers, separator };
}

function saveHistory(filePath, originalName) {
  if (!fs.existsSync(HISTORY_DIR)) fs.mkdirSync(HISTORY_DIR, { recursive: true });

  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const currentContent = fs.readFileSync(filePath, 'utf8').trim();

  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext);
  const prefix = `${date}_${base}`;

  // Find all matches for today in history
  // Format: YYYYMMDD_filename[_suffix].json
  const existing = fs.readdirSync(HISTORY_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith(ext));

  if (existing.length > 0) {
    // Sort to find latest
    existing.sort((a, b) => {
      const getNum = (name) => {
        const nameWithoutExt = path.basename(name, ext);
        const suffix = nameWithoutExt.slice(prefix.length);
        if (!suffix) return 1;
        return parseInt(suffix.replace('_', '')) || 1;
      };
      return getNum(a) - getNum(b);
    });

    const latestFile = path.join(HISTORY_DIR, existing[existing.length - 1]);
    const latestContent = fs.readFileSync(latestFile, 'utf8').trim();

    if (currentContent === latestContent) {
      console.log(`Skipping archive: ${originalName} (no changes)`);
      return;
    }
  }

  // Next suffix
  const suffix = existing.length === 0 ? '' : `_${existing.length + 1}`;
  const historyPath = path.join(HISTORY_DIR, `${prefix}${suffix}${ext}`);
  fs.writeFileSync(historyPath, currentContent);
  console.log(`Archived: ${historyPath}`);
}

function syncIncome() {
  const parsed = parseCSV(INCOME_CSV);
  if (!parsed) return;
  const { lines, headers, separator } = parsed;
  const data = { incomeSources: {} };

  // Initialize all income source objects directly from headers
  for (let i = 1; i < headers.length; i++) {
    const key = headers[i];
    if (!data.incomeSources[key]) data.incomeSources[key] = {};
  }

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(separator).map(c => c.trim());
    const rawKey = cells[0];
    const isResource = rawKey.startsWith('r_');
    const isModifier = rawKey.startsWith('m_');
    const key = (isResource || isModifier) ? rawKey.slice(2) : normalizeKey(rawKey);

    for (let j = 1; j < cells.length; j++) {
      const val = parseValue(cells[j]);
      if (val === 0) continue;

      const sourceName = headers[j];
      const source = data.incomeSources[sourceName];

      if (key === 'dayspercycle' || key === 'daysPerCycle') {
        source.daysPerCycle = val;
      } else if (isResource || RESOURCE_KEYS.includes(key)) {
        if (!source.resources) source.resources = {};
        source.resources[key] = val;
      } else if (isModifier) {
        if (!source.modifiers) source.modifiers = {};
        source.modifiers[key] = val;
      }
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

  // Headers are: [empty], coins, powerPoints, etc.
  const targetHeaders = headers.map(h => normalizeKey(h));

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(separator).map(c => c.trim());
    if (cells.length < 2) continue;

    const sourceKey = normalizeKey(cells[0]);
    if (!sourceKey) continue;

    conversions[sourceKey] = {};
    for (let j = 1; j < cells.length; j++) {
      const val = parseFloat(cells[j]);
      const targetKey = targetHeaders[j];
      if (!isNaN(val) && val > 0 && targetKey) {
        conversions[sourceKey][targetKey] = val;
      }
    }
  }

  if (Object.keys(conversions).length > 0) {
    fs.writeFileSync(OUTPUT_CONVERSION, JSON.stringify(conversions, null, 2));
    saveHistory(OUTPUT_CONVERSION, 'valueConversions.json');
    console.log(`Synced: ${OUTPUT_CONVERSION}`);
  } else {
    console.warn("No conversion data found in CSV.");
  }
}

function syncMetadata() {
  const parsed = parseCSV(METADATA_CSV);
  if (!parsed) return;
  const { lines, headers, separator } = parsed;
  const metadata = {};

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(separator).map(c => c.trim().replace(/^"|"$/g, ''));
    if (cells.length < 2) continue;

    const key = cells[0];
    const rawVal = cells.slice(1).join(',');

    const parts = rawVal.split(',').map(v => {
      const n = parseFloat(v.trim());
      return isNaN(n) ? v.trim() : n;
    }).filter(v => v !== "");

    if (parts.length > 1) {
      metadata[key] = parts;
    } else if (parts.length === 1) {
      metadata[key] = parts[0];
    }
  }

  if (Object.keys(metadata).length > 0) {
    fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
    saveHistory(METADATA_FILE, 'gameMetadata.json');
    console.log(`Synced: ${METADATA_FILE}`);
  }
}

async function syncBrawlers() {
  let mapping = {};
  try {
    const res = await fetch("https://api.brawlapi.com/v1/brawlers");
    if (res.ok) {
      const data = await res.json();
      if (data.list) {
        data.list.forEach(b => {
          let name = b.name.toUpperCase();

          // Apply overrides
          if (BRAWLER_OVERRIDES.exclusions.includes(name)) return;
          if (BRAWLER_OVERRIDES.renames[name]) name = BRAWLER_OVERRIDES.renames[name];

          mapping[name] = b.rarity.name;
        });
      }
    } else {
      console.warn("BrawlAPI error, proceeding to check backup.");
    }
  } catch (error) {
    console.warn("Failed to fetch from BrawlAPI, proceeding to check backup:", error.message);
  }

  const backupFile = path.join(DATA_DIR, 'brawlersBackup.json');
  if (fs.existsSync(backupFile)) {
    try {
      const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
      
      // Clean backup data as well in case it contains old names or excluded brawlers
      const cleanedBackup = {};
      Object.entries(backupData).forEach(([name, rarity]) => {
        let n = name.toUpperCase();
        if (BRAWLER_OVERRIDES.exclusions.includes(n)) return;
        if (BRAWLER_OVERRIDES.renames[n]) n = BRAWLER_OVERRIDES.renames[n];
        cleanedBackup[n] = rarity;
      });

      if (Object.keys(cleanedBackup).length > Object.keys(mapping).length) {
        console.log(`Backup has more brawlers (${Object.keys(cleanedBackup).length}) than API (${Object.keys(mapping).length}). Using backup.`);
        mapping = cleanedBackup;
      }
    } catch (e) {
      console.warn("Could not read backup file:", e.message);
    }
  }

  if (Object.keys(mapping).length > 0) {
    try {
      fs.writeFileSync(BRAWLERS_FILE, JSON.stringify(mapping, null, 2));
      saveHistory(BRAWLERS_FILE, 'brawlers.json');
      console.log(`Synced: ${BRAWLERS_FILE}`);
    } catch (error) {
      console.error("Failed to save brawlers:", error.message);
    }
  }
}

syncIncome();
syncConversions();
syncMetadata();
await syncBrawlers();

[INCOME_CSV, CONVERSION_CSV, METADATA_CSV].forEach(f => {
  if (fs.existsSync(f)) fs.unlinkSync(f);
});
