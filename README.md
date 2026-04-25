# Readme

(work in progress)











# Calculator Data

## Calculator User Settings

These are used to find the following values:
dailyActivityDelta, challengesDelta, eventsDelta
brawlPassDelta, brawlPassTailDelta
nBrawlPass_free, nBrawlPass_regular, nBrawlPass_plus
rankedPassDelta, rankedPassTailDelta
moneyEfficiency
gemEfficiency

### Play Rate

#### Daily play

Dropdown picker
“How often do you play”:
1+ hours every day // dailyActivityDelta = 1
6+ wins almost every day // delta = 0.95
5-6 days a week // delta = 0.8
4 days a week // delta = 0.6
Only weekends and days off // delta = 0.5


Dropdown picker
“Do you complete challenges and recurring events (boss fight, new brawler box event...)”:
Almost always (challengesDelta=1, eventsDelta=1)
Primarily challenges (ch=1, ev=0.7)
Primarily events (ch=0.7, ev=1)
Sometimes (ch=0.6, ev=0.6)
Rarely (ch=0.4, ev=0.4)

bscChallengeDelta = challengesDelta * player.maxbscWins/15
challengesDelta *= dailyActivityDelta
eventsDelta *= dailyActivityDelta


Checkbox question
"Do you care to finish all your quests at the end of the season?": Yes / No
brawlPassDelta = yes -> 1 | no -> (dailyActivityDelta > 0,5)? 1 : 0,8
brawlPassTailDelta = yes -> 1 * dailyActivityDelta, no -> 0,7 * dailyActivityDelta

brawlPassTailDelta += (increase delta based on brawl pass yearly purchases)


#### Money ( rankedPassDelta, rankedPassTailDelta )

Horizontal bar selector
How many times a year do you buy:
BrawlPass <=============> BrawlPassPlus
          (5)  ^     ^ (3)
Brawl pass selector can't go farther right than BP+ selector, and BP+ selector can't be farther left than BP one.
Middle spots indicate free brawl pass. (12-5-3 = 5 free BP months)
BP bar (from its selector to the left) turns gold, BP+ bar (from its selector to the right) turns shiny silver. Free bar is bronze.

fills nBrawlPass_free, nBrawlPass_regular, nBrawlPass_plus accordingly


How many times a year do you buy the Pro Pass?
BrawlPass <=============>
              (2)^     max 4


Input number field
How much money do you spend on brawl on average each month (not including battle pass)
monthlySpending = _____ $USD [currency picker]

Dropdown picker
if input field above >0 : How do you spend your money outside battle passes? else: If you were to spend money outside passes, what would you buy?
Only highest efficiency resource offers (gems >30% off, coins/pwp 80+% off). - moneyEfficiency = 1
High efficiency offers for resources. - moneyEfficiency = 0.8
High efficiency offers for resources and skins. - moneyEfficiency = 0.6
Mostly skins - moneyEfficiency = 0.2

Money efficiency diminishes with more money spent (there just aren't that many overpowered offers)
moneyEfficiency = (diminishing value formula)



Dropdown picker
How do you spend your gems?
Only highest efficiency offers (like hypercharge for 79 gems). - gemEfficiency = 1
High efficiency offers for resources. - gemEfficiency = 0.8
High efficiency offers for resources and skins. - gemEfficiency = 0.6
Mostly skins - gemEfficiency = 0.2




#### Ranked

We can use peak rank to adjust delta.
Checkbox questions
"Do you play ranked often?": Yes / No
yes -> rankedPassDelta = 0.8 +- 0.2 (scale from bronze to mythic)
no  -> rankedPassDelta = 0.5 +- 0.5 (scale from bronze to master)

yes -> rankedPassTailDelta = 0.7 +- 0.3 (scale from bronze to legendary)
no  -> rankedPassTailDelta = 0.4 +- 0.6 (scale from bronze to master)


















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
