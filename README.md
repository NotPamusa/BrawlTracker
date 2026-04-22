# Readme

(work in progress)














# Brawl Progression Data Sync System

This system automates the conversion of game data from an Apple Numbers spreadsheet (`BrawlToMAXIncomeData.numbers`) into structured JSON files for the calculator.

## Setup
1.  **Virtual Environment**:
    ```bash
    python3 -m venv venv
    ```
2.  **Dependencies**:
    ```bash
    venv/bin/pip install numbers-parser
    ```
3.  **File Location**: Keep the `.numbers` file in the `/data/` directory.

## How to Sync
Run:
```bash
npm run sync-data
```

---

## Spreadsheet Structure

### 1. Sheet: `income_model`
Defines the amount of resources gained from various sources.
- **Rows**: The first column must be `key`. Valid keys:
    - `daysPerCycle`: Denominator for daily rates.
    - **Resources**: `coins`, `powerPoints`, `credits`, `bling`, `gems`, `brawlerKey`, `resourceKey`, `buffieKey`, `starrDrop`, `epicDrop`, `mythicDrop`, `legendaryDrop`, `chaosDrop`, `hyperchargeDrop`, `rankedDrop`, `xp`, `megaBox`.
- **Columns**: Source headers.
    - `SimpleSource` (e.g., `megaPig`)
    - `Source_Tier` (e.g., `brawlPass_plus`)
    - `Source_tail` (e.g., `brawlPass_tail`)

### 2. Sheet: `value_conversions`
A matrix defining how items like Starr Drops convert into core resources on average.
- **Rows**: Source item (e.g., `starrDrop`).
- **Columns**: Target currency (e.g., `coins`).

---

## Output Files
- `/data/incomeSources.json`
- `/data/valueConversions.json`

## Development Rules
- **CamelCase**: Use camelCase for keys (e.g., `powerPoints`). The script normalizes spaces and casing automatically.
- **Exclusive Tiers**: Pass tiers should contain the **total** rewards for that state, not the incremental bonus.
