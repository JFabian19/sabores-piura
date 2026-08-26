import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.resolve(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Yape SVG
const yapeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" rx="22" fill="#742284"/>
  <circle cx="50" cy="38" r="14" fill="#00D4B8"/>
  <path d="M32 54 C32 46, 68 46, 68 54 L68 70 C68 76, 32 76, 32 70 Z" fill="#00D4B8"/>
  <text x="50" y="85" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="16" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">YAPE</text>
</svg>`;

// 2. Visa SVG
const visaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" rx="22" fill="#0F2D6B"/>
  <path d="M22 62 L30 38 L36 38 L28 62 Z" fill="#FFFFFF"/>
  <path d="M43 38 L38 56 L35 41 C34.5 39.5 33 38.5 31.5 38 L25 38 L25 39 C27.5 39.5 30.5 41 32 42 L38 62 L45 62 L53 38 Z" fill="#FFFFFF"/>
  <path d="M52 46 C52 43 54.5 41 58 41 C60.5 41 62.5 41.8 64 42.6 L65.5 38.8 C64 38.2 61.5 37.6 59 37.6 C52.5 37.6 48 41 48 46 C48 54 60 54 60 57.5 C60 59 58 60 55 60 C52 60 49 59 47.5 58 L46 62.2 C48 63 51.5 63.6 54.5 63.6 C61.5 63.6 66 60 66 55.5 C66 47.5 52 47.5 52 46 Z" fill="#FFFFFF"/>
  <path d="M74 38 L68 62 L74 62 L80 38 Z" fill="#F7B600"/>
</svg>`;

// 3. Mastercard SVG
const mastercardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" rx="22" fill="#141414"/>
  <circle cx="40" cy="50" r="22" fill="#EB001B"/>
  <circle cx="60" cy="50" r="22" fill="#F79E1B"/>
  <path d="M50 33.6 A22 22 0 0 1 50 66.4 A22 22 0 0 1 50 33.6 Z" fill="#FF5F00"/>
</svg>`;

// 4. Efectivo SVG
const efectivoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" rx="22" fill="#10B981"/>
  <rect x="20" y="32" width="60" height="36" rx="6" fill="#047857" stroke="#A7F3D0" stroke-width="2.5"/>
  <circle cx="50" cy="50" r="11" fill="#A7F3D0"/>
  <text x="50" y="55" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="#047857" text-anchor="middle">S/.</text>
  <circle cx="28" cy="50" r="3" fill="#A7F3D0"/>
  <circle cx="72" cy="50" r="3" fill="#A7F3D0"/>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'yape.svg'), yapeSvg);
fs.writeFileSync(path.join(iconsDir, 'visa.svg'), visaSvg);
fs.writeFileSync(path.join(iconsDir, 'mastercard.svg'), mastercardSvg);
fs.writeFileSync(path.join(iconsDir, 'efectivo.svg'), efectivoSvg);

console.log('✅ Iconos de pago creados en public/icons/');
