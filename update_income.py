import json

with open('data/incomeSources.json', 'r') as f:
    data = json.load(f)

sources = data['incomeSources']

if 'brawlPass_free' in sources:
    sources['brawlPass_free']['modifiers'] = {
        "brawlPassDelta": 1,
        "nBrawlPass_free": 1
    }
if 'brawlPass_regular' in sources:
    sources['brawlPass_regular']['modifiers'] = {
        "brawlPassDelta": 1,
        "nBrawlPass_regular": 1
    }
if 'brawlPass_plus' in sources:
    sources['brawlPass_plus']['modifiers'] = {
        "brawlPassDelta": 1,
        "nBrawlPass_plus": 1
    }
if 'brawlPass_tail' in sources:
    sources['brawlPass_tail']['modifiers'] = {
        "brawlPassTailDelta": 1
    }

if 'rankedPass_free' in sources:
    sources['rankedPass_free']['modifiers'] = {
        "rankedPassDelta": 1,
        "nRankedPass_free": 1
    }
if 'rankedPass_regular' in sources:
    sources['rankedPass_regular']['modifiers'] = {
        "rankedPassDelta": 1,
        "nRankedPass_regular": 1
    }
if 'rankedPass_tail' in sources:
    sources['rankedPass_tail']['modifiers'] = {
        "rankedPassTailDelta": 1
    }

if 'megaPig' in sources:
    sources['megaPig']['modifiers'] = { "eventsDelta": 1 }
if 'newBrawlerEvent' in sources:
    sources['newBrawlerEvent']['modifiers'] = { "eventsDelta": 1 }
if 'rushModifier' in sources:
    sources['rushModifier']['modifiers'] = { "eventsDelta": 1 }

if 'championshipChallenge' in sources:
    sources['championshipChallenge']['modifiers'] = { "bscChallengeDelta": 1 }
if 'specialChallenges' in sources:
    sources['specialChallenges']['modifiers'] = { "challengesDelta": 1 }

with open('data/incomeSources.json', 'w') as f:
    json.dump(data, f, indent=2)

print("Updated incomeSources.json")
