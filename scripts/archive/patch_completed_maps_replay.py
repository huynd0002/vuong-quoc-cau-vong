with open('src/game/scenes/WorldScene.js', 'r', encoding='utf-8') as f:
    ws_content = f.read().replace('\r\n', '\n')

# 1. Add CAMPAIGN_ZONES import to WorldScene.js
import_target = "import { getMapConfig } from '../../content/maps/mapsConfig.js';"
import_replacement = import_target + "\nimport { CAMPAIGN_ZONES } from '../../content/campaign/campaignGraph.js';"
assert import_target in ws_content, "import_target not found in WorldScene.js"
ws_content = ws_content.replace(import_target, import_replacement, 1)

# 2. Add completed map reset logic in WorldScene.js create()
create_target = """    const mapConfig = getMapConfig(this.currentMapId);
    this.mapConfig = mapConfig;
    const saveState = saveAdapter.load();"""

create_replacement = """    const mapConfig = getMapConfig(this.currentMapId);
    this.mapConfig = mapConfig;
    const saveState = saveAdapter.load();

    // Kiểm tra xem map hiện tại đã hoàn thành chưa
    const isCompletedMap = Array.isArray(saveState?.campaign?.completedMaps) &&
      saveState.campaign.completedMaps.includes(this.currentMapId);

    // Yêu cầu: "các maps đã hoàn thành nếu đi đến và quay lại thì sẽ hiện lại từ đầu để có thể làm lại ."
    // Khi đến hoặc quay lại một map đã hoàn thành, làm mới trạng thái cứu quái và boss của map đó
    // để toàn bộ thử thách được hiện lại từ đầu: quái nhỏ hồi sinh, boss ẩn đợi quái con bị hạ, cổng dịch chuyển đóng.
    if (isCompletedMap && Array.isArray(mapConfig?.encounters)) {
      let stateModified = false;
      if (!saveState.campaign) saveState.campaign = {};
      if (saveState.campaign.rescuedFriends) {
        mapConfig.encounters.forEach(enc => {
          if (saveState.campaign.rescuedFriends[enc.id]) {
            delete saveState.campaign.rescuedFriends[enc.id];
            stateModified = true;
          }
        });
        if (mapConfig.boss?.id && saveState.campaign.rescuedFriends[mapConfig.boss.id]) {
          delete saveState.campaign.rescuedFriends[mapConfig.boss.id];
          stateModified = true;
        }
      }
      if (mapConfig.boss?.id && saveState.campaign.bossDeathPositions?.[mapConfig.boss.id]) {
        delete saveState.campaign.bossDeathPositions[mapConfig.boss.id];
        stateModified = true;
      }
      if (stateModified) {
        saveAdapter.save(saveState);
      }
    }"""

assert create_target in ws_content, "create_target not found in WorldScene.js"
ws_content = ws_content.replace(create_target, create_replacement, 1)

# 3. Dynamic recap details in WorldScene.js
recap_target = """      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('game:show-recap', {
          detail: {
            title: `CHIẾN THẮNG LÀNG QUÊ YÊN BÌNH! 🎉`,
            rescuedFriends: ['Bạn Mầm Lá', 'Nấm Con Vui Vẻ', bossName || 'Nấm Mũ Đỏ Khổng Lồ'],
            learningSummary: 'Bé đã rất giỏi nhận biết Màu Sắc rực rỡ và Hình Khối cơ bản!',
            reward,
            unlockedNewMap,
            unlockedMapName: 'Vịnh Biển Pha Lê'
          }
        }));
      }, 2200);"""

recap_replacement = """      const currentZoneConfig = CAMPAIGN_ZONES[this.currentMapId] || {};
      const zoneDisplayName = currentZoneConfig.name || mapCfg.name || 'Vùng Đất';
      const friendNames = (mapCfg.encounters || []).map(e => e.name).concat([bossName || mapCfg.boss?.name || 'Trùm']);
      const nextMapId = unlockedNewMap || currentZoneConfig.nextZoneId || 'map2';
      const nextMapName = CAMPAIGN_ZONES[nextMapId]?.name || 'Vùng Đất Mới';

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('game:show-recap', {
          detail: {
            title: `CHIẾN THẮNG ${zoneDisplayName.toUpperCase()}! 🎉`,
            rescuedFriends: friendNames,
            learningSummary: currentZoneConfig.learningFocus ? `Bé đã rất giỏi về: ${currentZoneConfig.learningFocus}!` : 'Bé đã xuất sắc hoàn thành tất cả thử thách!',
            reward,
            unlockedNewMap: nextMapId,
            unlockedMapName: nextMapName
          }
        }));
      }, 2200);"""

assert recap_target in ws_content, "recap_target not found in WorldScene.js"
ws_content = ws_content.replace(recap_target, recap_replacement, 1)

with open('src/game/scenes/WorldScene.js', 'w', encoding='utf-8') as f:
    f.write(ws_content)

print("Updated WorldScene.js successfully!")

# 4. Remove duplicate show-recap from BattleArenaModal.js
with open('src/game/ui/BattleArenaModal.js', 'r', encoding='utf-8') as f:
    bam_content = f.read().replace('\r\n', '\n')

arena_target = """      if (isBossEncounter) {
        window.dispatchEvent(new CustomEvent('game:boss-resolved', {
          detail: {
            encounterId: enc?.id,
            bossName: enc?.name,
            reward: enc?.reward || { stars: 3, exp: 30 },
            unlockedNewMap: enc?.reward?.unlockMap || 'map2'
          }
        }));

        window.dispatchEvent(new CustomEvent('game:show-recap', {
          detail: {
            title: `CHIẾN THẮNG LÀNG QUÊ YÊN BÌNH! 🎉`,
            rescuedFriends: ['Bạn Mầm Lá', 'Nấm Con Vui Vẻ', enc?.name || 'Nấm Mũ Đỏ Khổng Lồ'],
            learningSummary: 'Bé đã rất giỏi nhận biết Màu Sắc rực rỡ và Hình Khối cơ bản!',
            reward: enc?.reward || { stars: 3, exp: 30 },
            unlockedNewMap: enc?.reward?.unlockMap || 'map2',
            unlockedMapName: 'Vịnh Biển Pha Lê'
          }
        }));
      } else {"""

arena_replacement = """      if (isBossEncounter) {
        window.dispatchEvent(new CustomEvent('game:boss-resolved', {
          detail: {
            encounterId: enc?.id,
            bossName: enc?.name,
            reward: enc?.reward || { stars: 3, exp: 30 },
            unlockedNewMap: enc?.reward?.unlockMap || 'map2'
          }
        }));
      } else {"""

assert arena_target in bam_content, "arena_target not found in BattleArenaModal.js"
bam_content = bam_content.replace(arena_target, arena_replacement, 1)

with open('src/game/ui/BattleArenaModal.js', 'w', encoding='utf-8') as f:
    f.write(bam_content)

print("Updated BattleArenaModal.js successfully!")
