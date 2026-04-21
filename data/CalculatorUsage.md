# Calculator Usage



# Income Data Specification

This section explains the resource earning data and the settings used to calculate progression slopes.

## Data File
This file contains the estimated average income per cycle (in days) from each resource income source.

## Core Resource Schema
All resource objects contains exactly 8 keys for consistency.
Colors are how they're represented in the excel file where this data was extracted from.
- `coins` (Yellow)
- `powerPoints` (Yellow)
- `credits` (Yellow)
- `bling` (Yellow)
- `gems` (Green)
- `brawlerKey` (Blue)
- `resourceKey` (Blue)
- `buffieKey` (Blue)

## Structure
- **`incomeSources`**: Top-level object containing various game modes/passes.
- **`daysPerCycle`**: The denominator for daily rate calculations.
- **`tiers`**: For Battle Passes. Users pick ONE tier (e.g., `free`, `regular`, or `plus`). Values are **Exclusive** (Regular does not add to Free; it replaces it).
- **`tail`**: Average value of a single repeatable reward at the end of a pass track.

## Calculation Rules

1.  **Daily Rate**:
    `DailyRate(Resource) = ResourceCount / daysPerCycle`

2.  **Passes (Brawl/Ranked)**:
    - Determine which tier the user has selected. 
    - Daily Rate = `TierResources / daysPerCycle`.
    - **Tails**: Daily Rate += `(TailResources * PredictedCount) / daysPerCycle`.

3.  **Shop Freebie Modifier**:
    - The `shopFreebie` source (found in `dailyActivity` context) represents the daily in-game shop claim.
    - **Rule**: If the user has a paid Brawl Pass (`regular` or `plus`), the resources from `shopFreebie` are **multiplied by 2**.

4.  **Delta variation**:
    - Most income sources depend highly on the player's activity. Daily activity, challenges, and events, should all be multiplied by a 0-1 factor depending on the user's stated play rate in the calculator settings before the calculation.

## Example Integration
```typescript
const isPassActive = selectedBrawlPassTier !== 'free';
const shopMultiplier = isPassActive ? 2 : 1;
const dailyCoinRate = (sources.shopFreebie.resources.coins * shopMultiplier) / 1;
```

## Calculator Settings
These settings are used to tailor the calculation to the user's playstyle and purchase habbits.
- **Play Rate Delta**: A 0-1 factor that multiplies the daily rate of activity-dependent income sources.
- **Brawl Pass**: Number of yearly brawl pass and brawl pass plus purchased (max 12 between the two)
- **Ranked Pass**: Same as brawl pass. Number of pro passes purchased yearly (max 4)
- **Monthly spending excluding passes**: Amount of money the user spends on the game per month, excluding passes.
- **Gem efficiency**: Based on the user's tendency to buy the best value resource offers, or just skins and less efficient offers.
- **Plays random events and challenges delta**: Delta 0-1 factor that multiplies the user's participation in random events and challenges (is applied in addition to play rate delta)
- **Ranked player delta**: Delta 0-1 factor that multiplies the user's participation in ranked (is applied in addition to play rate delta)
- **Esports watcher**: Used to calculate esports-related rewards (not implemented yet)
- **Stash**: User's current stash of resources, that we cannot retrieve from the API (our stash only counts held coins and power points). Stash varies frequently, it is only taken into account for the calculation if 
- **When is MAX?**: The default definition of MAX is when the user has maxed out all the brawlers currently in the game. However, a new brawler is released monthly, so the calculator settings have a "reality check" button that makes the calculation also take into account the slope of increasing requirements to be maxed out.
A brawler is considered MAX by default when it is level 11, and has at least 1 gadget, 1 star power, 2 gears, 1 hypercharge, and 3 buffies (option to ignore unreleased buffies will be added aswell until they're all released).
There will be an option to select "FullMAX" definition which will instead require 2 gadgets, 2 star powers, 2 gears, 1 hypercharge, and 3 buffies to be considered maxed out.


The default settings are applied everywhere until the user changes them. Logged in users' settings are saved to their account, while anonymous users' settings are saved to their browser's local storage. 
Every time an account is searched, we store in our database the current date and the account progression state to have a history of the user's progression. This history is used only in that user's calculation, to determine their real progression slope. History entries are ignored if they are older than 365 days.

## Calculator Logic
The calculator predicts the user's progression slope based on the active settings. It 