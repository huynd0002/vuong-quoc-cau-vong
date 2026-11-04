import fs from 'fs';

let content = fs.readFileSync('src/content/maps/mapsConfig.js', 'utf8');

const target = `"badgeText": "🌀 CỔNG HÀNH TRÌNH 🚀"
    }
  },`;

const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTarget = target.replace(/\r\n/g, '\n');

if (!normalizedContent.includes(normalizedTarget)) {
  console.error('Target not found in normalized content!');
  process.exit(1);
}

const replacement = `"badgeText": "🌀 CỔNG HÀNH TRÌNH 🚀"
    },
    "extraPortals": [
      {
        "id": "portal_farm_to_fashion",
        "name": "Phố Thời Trang Cầu Vồng",
        "x": 1110,
        "y": 625,
        "targetMapId": "map_fashion_street",
        "targetMapName": "Phố Thời Trang Cầu Vồng",
        "isReturn": false,
        "badgeText": "👗 PHỐ THỜI TRANG ✨"
      },
      {
        "id": "portal_farm_to_fishing",
        "name": "Hồ Câu Lá Sen",
        "x": 1120,
        "y": 480,
        "targetMapId": "map_fishing_pond",
        "targetMapName": "Hồ Câu Lá Sen",
        "isReturn": false,
        "badgeText": "🎣 HỒ CÂU LÁ SEN 🪷"
      },
      {
        "id": "portal_farm_to_market",
        "name": "Chợ Cầu Vồng",
        "x": 935,
        "y": 625,
        "targetMapId": "map_rainbow_market",
        "targetMapName": "Chợ Cầu Vồng",
        "isReturn": false,
        "badgeText": "🏮 CHỢ CẦU VỒNG ⭐"
      }
    ]
  },`;

const updated = normalizedContent.replace(normalizedTarget, replacement);
fs.writeFileSync('src/content/maps/mapsConfig.js', updated, 'utf8');
console.log('Successfully updated mapsConfig.js with extraPortals!');
