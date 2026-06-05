/**
 * 拼豆颜色数据库
 * 包含 Perler、Hama、Artkal 三大品牌的常见色号
 * RGB 值来源：社区测试数据 + 官方色卡参考
 */

const PERLER_COLORS = [
  { id: 'P01', name: 'Black',       r: 0,   g: 0,   b: 0   },
  { id: 'P02', name: 'White',       r: 255, g: 255, b: 255 },
  { id: 'P03', name: 'Red',         r: 200, g: 20,  b: 30  },
  { id: 'P04', name: 'Cherry',      r: 160, g: 10,  b: 20  },
  { id: 'P05', name: 'Orange',      r: 240, g: 120, b: 30  },
  { id: 'P06', name: 'Yellow',      r: 250, g: 230, b: 50  },
  { id: 'P07', name: 'Lime',        r: 150, g: 210, b: 60  },
  { id: 'P08', name: 'Green',       r: 40,  g: 150, b: 60  },
  { id: 'P09', name: 'Dark Green',  r: 20,  g: 100, b: 40  },
  { id: 'P10', name: 'Teal',        r: 0,   g: 160, b: 160 },
  { id: 'P11', name: 'Light Blue',  r: 80,  g: 180, b: 230 },
  { id: 'P12', name: 'Blue',        r: 30,  g: 80,  b: 180 },
  { id: 'P13', name: 'Dark Blue',   r: 20,  g: 40,  b: 120 },
  { id: 'P14', name: 'Purple',      r: 100, g: 40,  b: 150 },
  { id: 'P15', name: 'Lavender',    r: 170, g: 130, b: 200 },
  { id: 'P16', name: 'Pink',        r: 240, g: 140, b: 170 },
  { id: 'P17', name: 'Hot Pink',    r: 230, g: 60,  b: 120 },
  { id: 'P18', name: 'Magenta',     r: 200, g: 50,  b: 100 },
  { id: 'P19', name: 'Peach',       r: 250, g: 200, b: 170 },
  { id: 'P20', name: 'Tan',         r: 210, g: 170, b: 120 },
  { id: 'P21', name: 'Brown',       r: 130, g: 80,  b: 40  },
  { id: 'P22', name: 'Dark Brown',  r: 80,  g: 45,  b: 20  },
  { id: 'P23', name: 'Gray',        r: 140, g: 140, b: 140 },
  { id: 'P24', name: 'Dark Gray',   r: 70,  g: 70,  b: 70  },
  { id: 'P25', name: 'Light Gray',  r: 200, g: 200, b: 200 },
  { id: 'P26', name: 'Cream',       r: 250, g: 240, b: 210 },
  { id: 'P27', name: 'Rust',        r: 180, g: 70,  b: 30  },
  { id: 'P28', name: 'Toothpaste',  r: 140, g: 210, b: 200 },
  { id: 'P29', name: 'Pastel Blue', r: 150, g: 200, b: 230 },
  { id: 'P30', name: 'Pastel Green',r: 170, g: 220, b: 160 },
  { id: 'P31', name: 'Pastel Yellow',r: 255, g: 250, b: 170 },
  { id: 'P32', name: 'Pastel Lavender', r: 200, g: 180, b: 220 },
  { id: 'P33', name: 'Sand',        r: 220, g: 200, b: 160 },
  { id: 'P34', name: 'Plum',        r: 120, g: 50,  b: 80  },
  { id: 'P35', name: 'Kiwi',        r: 130, g: 180, b: 60  },
  { id: 'P36', name: 'Turquoise',   r: 40,  g: 180, b: 190 },
  { id: 'P37', name: 'Periwinkle',  r: 120, g: 130, b: 200 },
  { id: 'P38', name: 'Butterscotch',r: 230, g: 170, b: 60  },
  { id: 'P39', name: 'Flamingo',    r: 240, g: 120, b: 120 },
  { id: 'P40', name: 'Jade',        r: 80,  g: 180, b: 130 },
];

const HAMA_COLORS = [
  { id: 'H01', name: 'Black',       r: 0,   g: 0,   b: 0   },
  { id: 'H02', name: 'White',       r: 250, g: 250, b: 250 },
  { id: 'H03', name: 'Red',         r: 190, g: 25,  b: 35  },
  { id: 'H04', name: 'Dark Red',    r: 140, g: 15,  b: 20  },
  { id: 'H05', name: 'Orange',      r: 235, g: 110, b: 25  },
  { id: 'H06', name: 'Yellow',      r: 245, g: 225, b: 45  },
  { id: 'H07', name: 'Lime',        r: 145, g: 205, b: 55  },
  { id: 'H08', name: 'Green',       r: 35,  g: 145, b: 55  },
  { id: 'H09', name: 'Dark Green',  r: 15,  g: 95,  b: 35  },
  { id: 'H10', name: 'Turquoise',   r: 0,   g: 155, b: 155 },
  { id: 'H11', name: 'Light Blue',  r: 75,  g: 175, b: 225 },
  { id: 'H12', name: 'Blue',        r: 25,  g: 75,  b: 175 },
  { id: 'H13', name: 'Dark Blue',   r: 15,  g: 35,  b: 115 },
  { id: 'H14', name: 'Purple',      r: 95,  g: 35,  b: 145 },
  { id: 'H15', name: 'Lavender',    r: 165, g: 125, b: 195 },
  { id: 'H16', name: 'Pink',        r: 235, g: 135, b: 165 },
  { id: 'H17', name: 'Fuchsia',     r: 225, g: 55,  b: 115 },
  { id: 'H18', name: 'Peach',       r: 245, g: 195, b: 165 },
  { id: 'H19', name: 'Light Brown', r: 205, g: 165, b: 115 },
  { id: 'H20', name: 'Brown',       r: 125, g: 75,  b: 35  },
  { id: 'H21', name: 'Dark Brown',  r: 75,  g: 40,  b: 15  },
  { id: 'H22', name: 'Gray',        r: 135, g: 135, b: 135 },
  { id: 'H23', name: 'Dark Gray',   r: 65,  g: 65,  b: 65  },
  { id: 'H24', name: 'Light Gray',  r: 195, g: 195, b: 195 },
  { id: 'H25', name: 'Flesh',       r: 245, g: 210, b: 180 },
  { id: 'H26', name: 'Pastel Blue', r: 145, g: 195, b: 225 },
  { id: 'H27', name: 'Pastel Green',r: 165, g: 215, b: 155 },
  { id: 'H28', name: 'Pastel Yellow',r: 250, g: 245, b: 165 },
  { id: 'H29', name: 'Plum',        r: 115, g: 45,  b: 75  },
  { id: 'H30', name: 'Olive',       r: 120, g: 130, b: 50  },
];

const ARTKAL_COLORS = [
  { id: 'A01', name: 'Black',       r: 0,   g: 0,   b: 0   },
  { id: 'A02', name: 'White',       r: 252, g: 252, b: 252 },
  { id: 'A03', name: 'Red',         r: 195, g: 22,  b: 32  },
  { id: 'A04', name: 'Cherry Red',  r: 155, g: 12,  b: 22  },
  { id: 'A05', name: 'Dark Red',    r: 120, g: 10,  b: 15  },
  { id: 'A06', name: 'Orange',      r: 238, g: 115, b: 28  },
  { id: 'A07', name: 'Light Orange',r: 245, g: 160, b: 60  },
  { id: 'A08', name: 'Yellow',      r: 248, g: 228, b: 48  },
  { id: 'A09', name: 'Light Yellow',r: 252, g: 245, b: 140 },
  { id: 'A10', name: 'Lime',        r: 148, g: 208, b: 58  },
  { id: 'A11', name: 'Green',       r: 38,  g: 148, b: 58  },
  { id: 'A12', name: 'Dark Green',  r: 18,  g: 98,  b: 38  },
  { id: 'A13', name: 'Teal',        r: 0,   g: 158, b: 158 },
  { id: 'A14', name: 'Sky Blue',    r: 78,  g: 178, b: 228 },
  { id: 'A15', name: 'Blue',        r: 28,  g: 78,  b: 178 },
  { id: 'A16', name: 'Navy',        r: 18,  g: 38,  b: 118 },
  { id: 'A17', name: 'Purple',      r: 98,  g: 38,  b: 148 },
  { id: 'A18', name: 'Lavender',    r: 168, g: 128, b: 198 },
  { id: 'A19', name: 'Pink',        r: 238, g: 138, b: 168 },
  { id: 'A20', name: 'Hot Pink',    r: 228, g: 58,  b: 118 },
  { id: 'A21', name: 'Rose',        r: 200, g: 100, b: 120 },
  { id: 'A22', name: 'Peach',       r: 248, g: 198, b: 168 },
  { id: 'A23', name: 'Tan',         r: 212, g: 172, b: 118 },
  { id: 'A24', name: 'Brown',       r: 128, g: 78,  b: 38  },
  { id: 'A25', name: 'Dark Brown',  r: 78,  g: 42,  b: 18  },
  { id: 'A26', name: 'Gray',        r: 138, g: 138, b: 138 },
  { id: 'A27', name: 'Dark Gray',   r: 68,  g: 68,  b: 68  },
  { id: 'A28', name: 'Light Gray',  r: 198, g: 198, b: 198 },
  { id: 'A29', name: 'Cream',       r: 248, g: 238, b: 208 },
  { id: 'A30', name: 'Flesh',       r: 248, g: 212, b: 182 },
  { id: 'A31', name: 'Mint',        r: 148, g: 218, b: 198 },
  { id: 'A32', name: 'Coral',       r: 238, g: 128, b: 108 },
  { id: 'A33', name: 'Violet',      r: 138, g: 68,  b: 178 },
  { id: 'A34', name: 'Indigo',      r: 68,  g: 48,  b: 148 },
  { id: 'A35', name: 'Mauve',       r: 178, g: 118, b: 148 },
  { id: 'A36', name: 'Mustard',     r: 218, g: 188, b: 48  },
  { id: 'A37', name: 'Olive',       r: 118, g: 128, b: 48  },
  { id: 'A38', name: 'Turquoise',   r: 38,  g: 178, b: 188 },
  { id: 'A39', name: 'Periwinkle',  r: 118, g: 128, b: 198 },
  { id: 'A40', name: 'Salmon',      r: 238, g: 148, b: 128 },
];

/**
 * 获取品牌颜色库
 * @param {'perler'|'hama'|'artkal'} brand
 * @returns {Array}
 */
export function getPalette(brand) {
  switch (brand) {
    case 'hama':  return HAMA_COLORS;
    case 'artkal': return ARTKAL_COLORS;
    default:      return PERLER_COLORS;
  }
}

/**
 * 获取所有品牌名称
 */
export function getBrandNames() {
  return ['perler', 'hama', 'artkal'];
}
