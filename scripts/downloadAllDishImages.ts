import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_MENU_DATA, Category, Dish } from '../src/data/menuData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function downloadWithFallback(primaryUrl: string, proxyUrl: string | null, destPath: string): Promise<boolean> {
  const urlsToTry = [
    proxyUrl,
    primaryUrl,
    `https://images.weserv.nl/?url=${encodeURIComponent(primaryUrl)}&w=600&output=jpg&q=80`
  ].filter(Boolean) as string[];

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
      });
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        if (buffer.length > 800) { // Valid image
          fs.writeFileSync(destPath, buffer);
          return true;
        }
      }
    } catch (e) {
      // try next
    }
  }
  return false;
}

async function searchAndDownloadDishImage(dishName: string, destFileName: string): Promise<string | null> {
  const dir = path.resolve(__dirname, '../public/platos');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const destPath = path.join(dir, destFileName);

  // If already downloaded and size > 1000, keep it
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
    return `/platos/${destFileName}`;
  }

  // Queries to try
  const queries = [
    `${dishName} comida piura peru`,
    `${dishName} plato peruano`,
    `${dishName}`
  ];

  for (const query of queries) {
    try {
      const tokenUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&t=h_&iar=images&iax=images&ia=images`;
      const tokenRes = await fetch(tokenUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const html = await tokenRes.text();
      const vqdMatch = html.match(/vqd=([a-zA-Z0-9_-]+)/) || html.match(/vqd="([^"]+)"/);
      if (!vqdMatch) continue;

      const vqd = vqdMatch[1];
      const imgApiUrl = `https://duckduckgo.com/i.js?l=es-es&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,`;
      const imgRes = await fetch(imgApiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://duckduckgo.com/'
        }
      });
      const data = await imgRes.json();
      if (data?.results?.length > 0) {
        for (let i = 0; i < Math.min(4, data.results.length); i++) {
          const item = data.results[i];
          const primary = item.image;
          const proxy = item.thumbnail;
          const ok = await downloadWithFallback(primary, proxy, destPath);
          if (ok) {
            return `/platos/${destFileName}`;
          }
        }
      }
    } catch (err: any) {
      // try next
    }
  }

  return null;
}

async function main() {
  console.log('🚀 Iniciando descarga automática de imágenes reales para todos los platos...');
  const updatedCategories: Category[] = [];
  let downloadedCount = 0;
  let totalDishes = DEFAULT_MENU_DATA.reduce((sum, cat) => sum + cat.items.length, 0);
  let currentIdx = 0;

  for (const category of DEFAULT_MENU_DATA) {
    const updatedItems: Dish[] = [];
    console.log(`\n📂 Procesando categoría: ${category.nombre}...`);

    for (const dish of category.items) {
      currentIdx++;
      const slug = slugify(dish.nombre);
      const filename = `${slug}.jpg`;
      process.stdout.write(`[${currentIdx}/${totalDishes}] Buscando imagen para: "${dish.nombre}"... `);

      const localPath = await searchAndDownloadDishImage(dish.nombre, filename);

      if (localPath) {
        console.log(`✅ Guardado: ${localPath}`);
        downloadedCount++;
        updatedItems.push({
          ...dish,
          imagen: localPath
        });
      } else {
        console.log(`⚠️ No se pudo descargar imagen nueva, conservando anterior.`);
        updatedItems.push(dish);
      }

      // Small delay to prevent rate limits
      await new Promise(r => setTimeout(r, 400));
    }

    updatedCategories.push({
      ...category,
      items: updatedItems
    });
  }

  console.log('\n=============================================');
  console.log(`✨ Proceso finalizado! ${downloadedCount}/${totalDishes} platos procesados con imagen local.`);
  console.log('=============================================\n');

  // Write updated menuData.ts
  const menuDataPath = path.resolve(__dirname, '../src/data/menuData.ts');
  const fileContent = `export interface DishOption {
  nombre: string;
  precio: string;
  descripcion?: string;
}

export interface Dish {
  id?: string;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  precio: string;
  destacado?: boolean;
  etiqueta?: string;
  opciones?: DishOption[];
}

export interface Category {
  id: string;
  nombre: string;
  icono?: string;
  subtitulo?: string;
  items: Dish[];
}

export const DEFAULT_MENU_DATA: Category[] = ${JSON.stringify(updatedCategories, null, 2)};
`;

  fs.writeFileSync(menuDataPath, fileContent, 'utf-8');
  console.log(`💾 menuData.ts actualizado con rutas locales en /platos/!`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
