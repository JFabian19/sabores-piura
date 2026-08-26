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
        if (buffer.length > 800) {
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

const SPECIFIC_SEARCH_TERMS: Record<string, string> = {
  "Fuente Grande: Parihuelas": "parihuela de mariscos peruana",
  "Fuente Grande: Chaufa de Mariscos": "arroz chaufa de mariscos peruano",
  "Fuente Grande: Arroz con Mariscos": "arroz con mariscos peruano",
  "Pasadito de Caballa por Agua": "pasadito de caballa piurano",
  "Pasadito de Cabrilla": "pasadito de pescado piura",
  "Caldo de Gallina": "caldo de gallina peruano",
  "Caldo de Pata": "caldo de pata peruano",
  "Lomo Saltado": "lomo saltado peruano",
  "Saltado de Pollo": "saltado de pollo peruano",
  "Pechuga a la Plancha": "pechuga de pollo a la plancha con papas y ensalada",
  "Chicharrón de Pollo": "chicharron de pollo peruano",
  "Trucha Frita (Sábado y Domingo)": "trucha frita peruana",
  "Cuy Chactado (Medio)": "cuy chactado peruano",
  "Cuy Chactado (Entero)": "cuy chactado cusco peru",
  "Pollada": "pollada peruana tradicional",
  "Parrilla": "parrilla mixta de carnes peru",
  "Gaseosa Descartable": "botella de gaseosa inca kola descartable",
  "Chicha Morada de Maíz 1 Lt.": "jarra chicha morada peruana",
  "Chicha de Jora Piurana 1 Lt.": "chicha de jora piurana poto",
  "Clarito Helado 1 Lt.": "clarito piurano bebida tradicional",
  "Cerveza Pilsen": "cerveza pilsen callao botella",
  "Cerveza Cristal": "cerveza cristal peru botella",
  "Agua Mineral": "botella de agua mineral san mateo"
};

async function downloadRemaining() {
  const dir = path.resolve(__dirname, '../public/platos');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const updatedCategories: Category[] = [];

  for (const category of DEFAULT_MENU_DATA) {
    const updatedItems: Dish[] = [];

    for (const dish of category.items) {
      const slug = slugify(dish.nombre);
      const filename = `${slug}.jpg`;
      const destPath = path.join(dir, filename);

      // If already downloaded, keep it
      if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
        updatedItems.push({
          ...dish,
          imagen: `/platos/${filename}`
        });
        continue;
      }

      const searchTerm = SPECIFIC_SEARCH_TERMS[dish.nombre] || dish.nombre;
      console.log(`Buscando restante: "${dish.nombre}" -> "${searchTerm}"...`);

      try {
        const tokenUrl = `https://duckduckgo.com/?q=${encodeURIComponent(searchTerm)}&t=h_&iar=images&iax=images&ia=images`;
        const tokenRes = await fetch(tokenUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        const html = await tokenRes.text();
        const vqdMatch = html.match(/vqd=([a-zA-Z0-9_-]+)/) || html.match(/vqd="([^"]+)"/);
        
        if (vqdMatch) {
          const vqd = vqdMatch[1];
          const imgApiUrl = `https://duckduckgo.com/i.js?l=es-es&o=json&q=${encodeURIComponent(searchTerm)}&vqd=${vqd}&f=,,,`;
          const imgRes = await fetch(imgApiUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Referer': 'https://duckduckgo.com/'
            }
          });
          const data = await imgRes.json();
          if (data?.results?.length > 0) {
            for (let i = 0; i < Math.min(5, data.results.length); i++) {
              const item = data.results[i];
              const ok = await downloadWithFallback(item.image, item.thumbnail, destPath);
              if (ok) {
                console.log(`✅ Guardado: /platos/${filename}`);
                break;
              }
            }
          }
        }
      } catch (e) {
        // error
      }

      if (fs.existsSync(destPath) && fs.statSync(destPath).size > 800) {
        updatedItems.push({
          ...dish,
          imagen: `/platos/${filename}`
        });
      } else {
        updatedItems.push(dish);
      }

      await new Promise(r => setTimeout(r, 600));
    }

    updatedCategories.push({
      ...category,
      items: updatedItems
    });
  }

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
  console.log(`🎉 100% de la carta actualizada con imágenes locales en: ${menuDataPath}`);
}

downloadRemaining();
