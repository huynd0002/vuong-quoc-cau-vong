const fs = require('fs');
let code = fs.readFileSync('src/services/save/saveAdapter.js', 'utf8');

// 1. Import
code = code.replace(
  "import { defaultFishingState, normalizeFishingState } from '../../game/systems/fishingSystem.js';",
  "import { defaultFishingState, normalizeFishingState } from '../../game/systems/fishingSystem.js';\r\nimport { defaultFashionState, normalizeFashionState } from '../../game/systems/fashionSystem.js';"
);

// 2. getDefaultGameState
code = code.replace(
  "fishing: defaultFishingState(),",
  "fishing: defaultFishingState(),\r\n    fashion: defaultFashionState(),"
);

// 3. _parseAndNormalizeState
code = code.replace(
  "fishing: normalizeFishingState(state.fishing),",
  "fishing: normalizeFishingState(state.fishing),\r\n        fashion: normalizeFashionState(state.fashion),"
);

// 4. saveProfile
code = code.replace(
  "fishing: normalizeFishingState(latestFishing ?? state.fishing),",
  "fishing: normalizeFishingState(latestFishing ?? state.fishing),\r\n        fashion: normalizeFashionState(payload?.fashion ?? state.fashion),"
);

fs.writeFileSync('src/services/save/saveAdapter.js', code);
console.log('Successfully updated saveAdapter.js with fashion state');
