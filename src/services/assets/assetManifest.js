/**
 * Asset Manifest & Group Loader Config
 * Quản lý danh mục tài nguyên theo nhóm màn chơi và cơ chế fallback thông minh.
 */

export const ASSET_GROUPS = {
  // Tài nguyên lõi nạp trong PreloadScene
  core: {
    hero: {
      key: 'hero_idle',
      src: '/assets/hero/sau/hero_idle.png',
      fallback: { type: 'circle', color: 0x86d87e, radius: 40, label: '🐛' }
    },
    pet: {
      key: 'pet_bunny_idle',
      src: '/assets/pets/pet_bunny_idle.png',
      fallback: { type: 'circle', color: 0xffffff, radius: 24, label: '🐰' }
    },
    friendSprout: {
      key: 'mon_sprout',
      src: '/assets/monsters/map2/mon_caterpillar.png',
      fallback: { type: 'circle', color: 0xb5e7a0, radius: 36, label: '🌱' }
    }
  },

  // Bản đồ theo từng vùng
  maps: {
    map1: {
      key: 'map_1_bg',
      src: '/assets/maps/backgrounds/map_1_bg.png',
      name: 'Làng Quê Yên Bình',
      accentColor: 0xa9d5b0
    },
    map2: {
      key: 'map_2_bg',
      src: '/assets/maps/backgrounds/map_2_bg.png',
      name: 'Vịnh Biển Pha Lê',
      accentColor: 0x89c5db
    },
    map3: {
      key: 'map_3_bg',
      src: '/assets/maps/backgrounds/map_3_bg.png',
      name: 'Động Pha Lê Lấp Lánh',
      accentColor: 0xab9edb
    },
    map4: {
      key: 'map_4_bg',
      src: '/assets/maps/backgrounds/map_4_bg.png',
      name: 'Rừng Kẹo Ngọt',
      accentColor: 0xeda4b8
    },
    map5: {
      key: 'map_5_bg',
      src: '/assets/maps/backgrounds/map_5_bg.png',
      name: 'Hẻm Núi Gió Hát',
      accentColor: 0xded29e
    },
    map6: {
      key: 'map_6_bg',
      src: '/assets/maps/backgrounds/map_6_bg.png',
      name: 'Cung Đình Thần Long',
      accentColor: 0xd6c2ea
    }
  }
};

export function getMapAsset(mapId) {
  return ASSET_GROUPS.maps[mapId] || ASSET_GROUPS.maps.map1;
}
