/**
 * High-Quality Indian Profile Vector Portrait Generator
 * Generates distinct, personalized, professional vector portraits for Skillzy demo users.
 */

const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', '..', 'client', 'public', 'images', 'demo-users');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// User styling specifications
const AVATAR_PROFILES = [
  // Remaining 12 New Users:
  {
    slug: 'pragya-tiwari',
    gender: 'female',
    skin: '#DDB68C',
    hair: '#1E1B18',
    hairStyle: 'long-parted',
    clothes: '#3B7A57',
    clothesType: 'organic-top',
    bg1: '#D1FAE5',
    bg2: '#A7F3D0',
    accessory: 'delicate-bindi'
  },
  {
    slug: 'harsh-vardhan',
    gender: 'male',
    skin: '#C69363',
    hair: '#111827',
    hairStyle: 'short-clean',
    clothes: '#1E3A8A',
    clothesType: 'formal-shirt',
    bg1: '#DBEAFE',
    bg2: '#93C5FD',
    accessory: 'none'
  },
  {
    slug: 'meera-deshpande',
    gender: 'female',
    skin: '#DEB887',
    hair: '#171717',
    hairStyle: 'wavy-shoulder',
    clothes: '#4338CA',
    clothesType: 'kurta',
    bg1: '#E0E7FF',
    bg2: '#C7D2FE',
    accessory: 'bindi-earrings'
  },
  {
    slug: 'nikhil-yadav',
    gender: 'male',
    skin: '#BA804E',
    hair: '#1C1917',
    hairStyle: 'sporty-fade',
    clothes: '#18181B',
    clothesType: 'athletic-tee',
    bg1: '#FEF3C7',
    bg2: '#FDE68A',
    accessory: 'none'
  },
  {
    slug: 'pooja-agarwal',
    gender: 'female',
    skin: '#E5C29F',
    hair: '#27272A',
    hairStyle: 'neat-bun',
    clothes: '#5D3C64',
    clothesType: 'knit-top',
    bg1: '#F3E8FF',
    bg2: '#E9D5FF',
    accessory: 'spectacles'
  },
  {
    slug: 'arjun-reddy',
    gender: 'male',
    skin: '#B07548',
    hair: '#18181B',
    hairStyle: 'short-stubble',
    clothes: '#27272A',
    clothesType: 'tech-jacket',
    bg1: '#E2E8F0',
    bg2: '#CBD5E1',
    accessory: 'dark-spectacles'
  },
  {
    slug: 'sanika-deshmukh',
    gender: 'female',
    skin: '#D6A674',
    hair: '#1C1917',
    hairStyle: 'chic-bob',
    clothes: '#BE185D',
    clothesType: 'designer-neck',
    bg1: '#FCE7F3',
    bg2: '#FBCFE8',
    accessory: 'earrings'
  },
  {
    slug: 'karan-malhotra',
    gender: 'male',
    skin: '#D2A172',
    hair: '#1C1917',
    hairStyle: 'creative-textured',
    clothes: '#047857',
    clothesType: 'hoodie',
    bg1: '#CCFBF1',
    bg2: '#99F6E4',
    accessory: 'headset'
  },
  {
    slug: 'neha-saxena',
    gender: 'female',
    skin: '#E0BA92',
    hair: '#262626',
    hairStyle: 'smart-layers',
    clothes: '#B45309',
    clothesType: 'blazer',
    bg1: '#FFEDD5',
    bg2: '#FED7AA',
    accessory: 'earrings'
  },
  {
    slug: 'vishal-sinha',
    gender: 'male',
    skin: '#B57C48',
    hair: '#18181B',
    hairStyle: 'neat-side',
    clothes: '#0284C7',
    clothesType: 'polo',
    bg1: '#E0F2FE',
    bg2: '#BAE6FD',
    accessory: 'none'
  },
  {
    slug: 'ishita-mukherjee',
    gender: 'female',
    skin: '#D9B288',
    hair: '#1C1917',
    hairStyle: 'long-traditional',
    clothes: '#9D174D',
    clothesType: 'saree-collar',
    bg1: '#FFE4E6',
    bg2: '#FECDD3',
    accessory: 'red-bindi'
  },
  {
    slug: 'farhan-qureshi',
    gender: 'male',
    skin: '#C28B57',
    hair: '#171717',
    hairStyle: 'short-curly',
    clothes: '#0F766E',
    clothesType: 'linen-shirt',
    bg1: '#D1FAE5',
    bg2: '#A7F3D0',
    accessory: 'neat-beard'
  },

  // 20 Existing Demo Users:
  {
    slug: 'aarav-sharma',
    gender: 'male',
    skin: '#CCA074',
    hair: '#1C1917',
    hairStyle: 'short-clean',
    clothes: '#5D3C64',
    clothesType: 'crew-tee',
    bg1: '#F3E8FF',
    bg2: '#E9D5FF',
    accessory: 'none'
  },
  {
    slug: 'priya-nair',
    gender: 'female',
    skin: '#D9AB7E',
    hair: '#18181B',
    hairStyle: 'wavy-shoulder',
    clothes: '#7B466A',
    clothesType: 'designer-top',
    bg1: '#FAE8FF',
    bg2: '#F5D0FE',
    accessory: 'earrings'
  },
  {
    slug: 'rohan-verma',
    gender: 'male',
    skin: '#BA8252',
    hair: '#171717',
    hairStyle: 'short-side',
    clothes: '#2563EB',
    clothesType: 'casual-tee',
    bg1: '#DBEAFE',
    bg2: '#BFDBFE',
    accessory: 'spectacles'
  },
  {
    slug: 'ananya-iyer',
    gender: 'female',
    skin: '#DEB58A',
    hair: '#1C1917',
    hairStyle: 'neat-bun',
    clothes: '#9F6496',
    clothesType: 'kurta',
    bg1: '#F5F3FF',
    bg2: '#DDD6FE',
    accessory: 'bindi'
  },
  {
    slug: 'vikram-singh',
    gender: 'male',
    skin: '#C49161',
    hair: '#111827',
    hairStyle: 'styled-beard',
    clothes: '#D97706',
    clothesType: 'collared-shirt',
    bg1: '#FEF3C7',
    bg2: '#FDE68A',
    accessory: 'neat-beard'
  },
  {
    slug: 'meera-krishnan',
    gender: 'female',
    skin: '#CCA176',
    hair: '#1E1B18',
    hairStyle: 'long-parted',
    clothes: '#EC4899',
    clothesType: 'cotton-top',
    bg1: '#FCE7F3',
    bg2: '#FBCFE8',
    accessory: 'bindi-earrings'
  },
  {
    slug: 'aditya-patel',
    gender: 'male',
    skin: '#C08D5E',
    hair: '#1C1917',
    hairStyle: 'short-fade',
    clothes: '#059669',
    clothesType: 'polo',
    bg1: '#D1FAE5',
    bg2: '#A7F3D0',
    accessory: 'none'
  },
  {
    slug: 'sneha-reddy',
    gender: 'female',
    skin: '#D2A275',
    hair: '#18181B',
    hairStyle: 'smart-layers',
    clothes: '#7C3AED',
    clothesType: 'casual-blazer',
    bg1: '#EDE9FE',
    bg2: '#DDD6FE',
    accessory: 'delicate-bindi'
  },
  {
    slug: 'arjun-das',
    gender: 'male',
    skin: '#B47846',
    hair: '#1C1917',
    hairStyle: 'textured-crop',
    clothes: '#4F46E5',
    clothesType: 'hoodie',
    bg1: '#E0E7FF',
    bg2: '#C7D2FE',
    accessory: 'none'
  },
  {
    slug: 'kavya-menon',
    gender: 'female',
    skin: '#DBB086',
    hair: '#1A1A1A',
    hairStyle: 'shoulder-curl',
    clothes: '#4A2F4F',
    clothesType: 'kurti',
    bg1: '#F3E8FF',
    bg2: '#E9D5FF',
    accessory: 'earrings'
  },
  {
    slug: 'rahul-choudhary',
    gender: 'male',
    skin: '#C9986A',
    hair: '#171717',
    hairStyle: 'short-clean',
    clothes: '#0D9488',
    clothesType: 'crew-tee',
    bg1: '#CCFBF1',
    bg2: '#99F6E4',
    accessory: 'none'
  },
  {
    slug: 'ishita-banerjee',
    gender: 'female',
    skin: '#E2BA92',
    hair: '#1C1917',
    hairStyle: 'chic-bob',
    clothes: '#E11D48',
    clothesType: 'linen-top',
    bg1: '#FFE4E6',
    bg2: '#FECDD3',
    accessory: 'red-bindi'
  },
  {
    slug: 'karthik-subramanian',
    gender: 'male',
    skin: '#AA7242',
    hair: '#111827',
    hairStyle: 'short-side',
    clothes: '#1E40AF',
    clothesType: 'formal-shirt',
    bg1: '#DBEAFE',
    bg2: '#BFDBFE',
    accessory: 'spectacles'
  },
  {
    slug: 'neha-gupta',
    gender: 'female',
    skin: '#DAB38B',
    hair: '#262626',
    hairStyle: 'wavy-shoulder',
    clothes: '#BE185D',
    clothesType: 'casual-kurta',
    bg1: '#FCE7F3',
    bg2: '#FBCFE8',
    accessory: 'delicate-bindi'
  },
  {
    slug: 'sandeep-kumar',
    gender: 'male',
    skin: '#B8804E',
    hair: '#1C1917',
    hairStyle: 'short-fade',
    clothes: '#D97706',
    clothesType: 'athletic-tee',
    bg1: '#FEF3C7',
    bg2: '#FDE68A',
    accessory: 'none'
  },
  {
    slug: 'divya-joshi',
    gender: 'female',
    skin: '#E5C099',
    hair: '#1E1B18',
    hairStyle: 'long-parted',
    clothes: '#059669',
    clothesType: 'knit-top',
    bg1: '#ECFDF5',
    bg2: '#D1FAE5',
    accessory: 'earrings'
  },
  {
    slug: 'nikhil-rao',
    gender: 'male',
    skin: '#C28F60',
    hair: '#18181B',
    hairStyle: 'short-stubble',
    clothes: '#0284C7',
    clothesType: 'polo',
    bg1: '#E0F2FE',
    bg2: '#BAE6FD',
    accessory: 'neat-stubble'
  },
  {
    slug: 'pooja-shah',
    gender: 'female',
    skin: '#DCB58D',
    hair: '#1C1917',
    hairStyle: 'smart-layers',
    clothes: '#A855F7',
    clothesType: 'designer-top',
    bg1: '#FAF5FF',
    bg2: '#F3E8FF',
    accessory: 'spectacles'
  },
  {
    slug: 'farhan-ahmed',
    gender: 'male',
    skin: '#C89667',
    hair: '#171717',
    hairStyle: 'creative-textured',
    clothes: '#4338CA',
    clothesType: 'casual-jacket',
    bg1: '#EEF2FF',
    bg2: '#E0E7FF',
    accessory: 'neat-beard'
  },
  {
    slug: 'lakshmi-prasad',
    gender: 'female',
    skin: '#B97D4D',
    hair: '#111827',
    hairStyle: 'neat-bun',
    clothes: '#047857',
    clothesType: 'cotton-kurta',
    bg1: '#D1FAE5',
    bg2: '#A7F3D0',
    accessory: 'bindi'
  }
];

function generateSVG(profile) {
  const { slug, gender, skin, hair, hairStyle, clothes, bg1, bg2, accessory } = profile;

  // Build hair paths
  let hairBack = '';
  let hairFront = '';
  
  if (hairStyle === 'long-parted' || hairStyle === 'long-traditional') {
    hairBack = `<path d="M70 120 C60 70, 85 35, 128 35 C171 35, 196 70, 186 120 C180 180, 190 230, 195 256 L61 256 C66 230, 76 180, 70 120 Z" fill="${hair}"/>`;
    hairFront = `<path d="M78 100 C80 65, 105 50, 128 50 C151 50, 176 65, 178 100 C165 72, 145 60, 128 60 C111 60, 91 72, 78 100 Z" fill="${hair}"/>`;
  } else if (hairStyle === 'wavy-shoulder' || hairStyle === 'shoulder-curl') {
    hairBack = `<path d="M72 120 C65 75, 88 40, 128 40 C168 40, 191 75, 184 120 C180 160, 195 195, 190 220 L66 220 C61 195, 76 160, 72 120 Z" fill="${hair}"/>`;
    hairFront = `<path d="M76 102 C82 68, 104 54, 128 54 C152 54, 174 68, 180 102 C168 76, 148 64, 128 64 C108 64, 88 76, 76 102 Z" fill="${hair}"/>`;
  } else if (hairStyle === 'neat-bun') {
    hairBack = `<circle cx="128" cy="50" r="30" fill="${hair}"/>`;
    hairFront = `<path d="M78 110 C75 75, 95 55, 128 55 C161 55, 181 75, 178 110 C165 80, 148 68, 128 68 C108 68, 91 80, 78 110 Z" fill="${hair}"/>`;
  } else if (hairStyle === 'chic-bob' || hairStyle === 'smart-layers') {
    hairBack = `<path d="M72 110 C68 70, 90 42, 128 42 C166 42, 188 70, 184 110 C182 150, 175 170, 170 185 L86 185 C81 170, 74 150, 72 110 Z" fill="${hair}"/>`;
    hairFront = `<path d="M74 105 C80 70, 102 56, 128 56 C154 56, 176 70, 182 105 C170 78, 150 65, 128 65 C106 65, 86 78, 74 105 Z" fill="${hair}"/>`;
  } else if (hairStyle === 'short-clean' || hairStyle === 'short-side') {
    hairFront = `<path d="M76 110 C74 70, 95 44, 128 44 C161 44, 182 70, 180 110 C175 76, 155 58, 128 58 C101 58, 81 76, 76 110 Z" fill="${hair}"/>`;
  } else if (hairStyle === 'sporty-fade' || hairStyle === 'short-fade') {
    hairFront = `<path d="M80 108 C78 72, 98 48, 128 48 C158 48, 178 72, 176 108 C172 78, 152 60, 128 60 C104 60, 84 78, 80 108 Z" fill="${hair}"/>`;
  } else {
    // default male crop / textured
    hairFront = `<path d="M75 106 C72 68, 95 42, 128 42 C161 42, 184 68, 181 106 C176 74, 155 56, 128 56 C101 56, 80 74, 75 106 Z" fill="${hair}"/>`;
  }

  // Accessories
  let accSvg = '';
  if (accessory === 'delicate-bindi' || accessory === 'bindi') {
    accSvg += `<circle cx="128" cy="98" r="2.8" fill="#991B1B"/>`;
  } else if (accessory === 'red-bindi') {
    accSvg += `<circle cx="128" cy="98" r="3.5" fill="#DC2626"/>`;
  } else if (accessory === 'bindi-earrings') {
    accSvg += `<circle cx="128" cy="98" r="3" fill="#991B1B"/>`;
    accSvg += `<circle cx="79" cy="125" r="4" fill="#F59E0B"/><circle cx="177" cy="125" r="4" fill="#F59E0B"/>`;
  } else if (accessory === 'earrings') {
    accSvg += `<circle cx="80" cy="125" r="3.5" fill="#F59E0B"/><circle cx="176" cy="125" r="3.5" fill="#F59E0B"/>`;
  } else if (accessory === 'spectacles') {
    accSvg += `
      <rect x="94" y="104" width="28" height="20" rx="6" fill="none" stroke="#262626" stroke-width="2.5"/>
      <rect x="134" y="104" width="28" height="20" rx="6" fill="none" stroke="#262626" stroke-width="2.5"/>
      <line x1="122" y1="113" x2="134" y2="113" stroke="#262626" stroke-width="2.5"/>
      <line x1="82" y1="112" x2="94" y2="112" stroke="#262626" stroke-width="2"/>
      <line x1="162" y1="112" x2="174" y2="112" stroke="#262626" stroke-width="2"/>
    `;
  } else if (accessory === 'dark-spectacles') {
    accSvg += `
      <rect x="94" y="104" width="28" height="20" rx="4" fill="none" stroke="#111827" stroke-width="3"/>
      <rect x="134" y="104" width="28" height="20" rx="4" fill="none" stroke="#111827" stroke-width="3"/>
      <line x1="122" y1="113" x2="134" y2="113" stroke="#111827" stroke-width="3"/>
      <line x1="82" y1="111" x2="94" y2="111" stroke="#111827" stroke-width="2.5"/>
      <line x1="162" y1="111" x2="174" y2="111" stroke="#111827" stroke-width="2.5"/>
    `;
  } else if (accessory === 'neat-beard' || hairStyle === 'styled-beard') {
    accSvg += `
      <path d="M96 138 C105 162, 151 162, 160 138 C158 168, 98 168, 96 138 Z" fill="${hair}" opacity="0.9"/>
      <path d="M112 135 Q128 140 144 135" stroke="${hair}" stroke-width="3" stroke-linecap="round" fill="none"/>
    `;
  } else if (accessory === 'neat-stubble' || hairStyle === 'short-stubble') {
    accSvg += `
      <path d="M98 140 C106 160, 150 160, 158 140 C156 166, 100 166, 98 140 Z" fill="${hair}" opacity="0.35"/>
    `;
  } else if (accessory === 'headset') {
    accSvg += `
      <path d="M72 120 C68 65, 188 65, 184 120" stroke="#374151" stroke-width="4.5" fill="none"/>
      <rect x="68" y="112" width="10" height="24" rx="4" fill="#111827"/>
      <rect x="178" y="112" width="10" height="24" rx="4" fill="#111827"/>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="bg_${slug}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    <linearGradient id="skin_${slug}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${skin}"/>
      <stop offset="100%" stop-color="${darken(skin, 15)}"/>
    </linearGradient>
    <linearGradient id="clothes_${slug}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${clothes}"/>
      <stop offset="100%" stop-color="${darken(clothes, 20)}"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="256" height="256" rx="36" fill="url(#bg_${slug})"/>

  ${hairBack}

  <!-- Body & Clothing -->
  <path d="M42 256 C42 195, 78 178, 128 178 C178 178, 214 195, 214 256 Z" fill="url(#clothes_${slug})"/>

  <!-- Neck -->
  <rect x="111" y="142" width="34" height="42" rx="10" fill="url(#skin_${slug})"/>
  
  <!-- Subtle collar / neckline -->
  <path d="M104 182 Q128 200 152 182" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="3" fill="none"/>

  <!-- Head/Face -->
  <ellipse cx="128" cy="114" rx="48" ry="54" fill="url(#skin_${slug})"/>

  <!-- Ears -->
  <ellipse cx="78" cy="116" rx="7" ry="12" fill="url(#skin_${slug})"/>
  <ellipse cx="178" cy="116" rx="7" ry="12" fill="url(#skin_${slug})"/>

  <!-- Eyes -->
  <ellipse cx="108" cy="112" rx="5" ry="4" fill="#1C1917"/>
  <ellipse cx="148" cy="112" rx="5" ry="4" fill="#1C1917"/>
  <circle cx="110" cy="110" r="1.5" fill="#FFFFFF"/>
  <circle cx="150" cy="110" r="1.5" fill="#FFFFFF"/>

  <!-- Eyebrows -->
  <path d="M98 102 Q108 97 118 102" stroke="#18181B" stroke-width="3.2" stroke-linecap="round" fill="none"/>
  <path d="M138 102 Q148 97 158 102" stroke="#18181B" stroke-width="3.2" stroke-linecap="round" fill="none"/>

  <!-- Nose -->
  <path d="M128 113 L123 126 L133 126" stroke="#9A3412" stroke-opacity="0.6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

  <!-- Warm Smile -->
  <path d="M115 137 Q128 149 141 137" stroke="#881337" stroke-width="3" stroke-linecap="round" fill="none"/>

  ${accSvg}

  ${hairFront}
</svg>`;
}

function darken(hex, percent) {
  let num = parseInt(hex.replace('#', ''), 16);
  let r = Math.max(0, (num >> 16) - Math.round(2.55 * percent));
  let g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(2.55 * percent));
  let b = Math.max(0, (num & 0x0000FF) - Math.round(2.55 * percent));
  return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Generate all SVGs
let createdCount = 0;
for (const profile of AVATAR_PROFILES) {
  const filePath = path.join(targetDir, `${profile.slug}.svg`);
  const svgContent = generateSVG(profile);
  fs.writeFileSync(filePath, svgContent, 'utf-8');
  createdCount++;
}

console.log(`Successfully generated ${createdCount} high-resolution Indian vector portrait avatars in ${targetDir}`);
