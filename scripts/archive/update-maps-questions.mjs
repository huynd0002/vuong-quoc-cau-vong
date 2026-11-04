import fs from 'node:fs';

let code = fs.readFileSync('src/content/maps/mapsConfig.js', 'utf8');

const replacements = [
  // Map 1
  { from: '"questionId": "q_map1_colors_1"', to: '"questionId": "q_map1_memory_animals"' },
  { from: '"questionId": "q_map1_shapes_1"', to: '"questionId": "q_map1_pair_food"' },
  { from: '"questionId": "q_map1_colors_2"', to: '"questionId": "q_map1_drag_size"' },

  // Map 2
  { from: '"questionId": "q_map2_counting_1"', to: '"questionId": "q_map2_memory_mushrooms"' },
  { from: '"questionId": "q_map2_counting_2"', to: '"questionId": "q_map2_pair_shapes"' },
  { from: '"questionId": "q_map2_counting_3"', to: '"questionId": "q_map2_drag_count_sequence"' },

  // Map 3
  { from: '"questionId": "q_map3_addition_1"', to: '"questionId": "q_map3_memory_crystals"' },
  { from: '"questionId": "q_map3_addition_3"', to: '"questionId": "q_map3_pair_quantities"' },
  { from: '"questionId": "q_map3_addition_2"', to: '"questionId": "q_map3_drag_stars_sequence"' },

  // Map 4
  { from: '"questionId": "q_map4_sub_fox"', to: '"questionId": "q_map4_memory_desert"' },
  { from: '"questionId": "q_map4_sub_scarab"', to: '"questionId": "q_map4_pair_math"' },
  { from: '"questionId": "q_map4_sub_falcon"', to: '"questionId": "q_map4_drag_even_sequence"' },

  // Map 5
  { from: '"questionId": "q_map5_comparison_1"', to: '"questionId": "q_map5_memory_canyon"' },
  { from: '"questionId": "q_map5_comparison_2"', to: '"questionId": "q_map5_pair_opposites"' },

  // Map 6
  { from: '"questionId": "q_map6_pattern_1"', to: '"questionId": "q_map6_memory_rainbow"' },
  { from: '"questionId": "q_map6_pattern_2"', to: '"questionId": "q_map6_pair_logic"' }
];

for (const r of replacements) {
  if (code.includes(r.from)) {
    code = code.replace(r.from, r.to);
    console.log(`Replaced ${r.from} -> ${r.to}`);
  } else {
    console.warn(`Target not found: ${r.from}`);
  }
}

fs.writeFileSync('src/content/maps/mapsConfig.js', code, 'utf8');
console.log('mapsConfig.js updated successfully!');
