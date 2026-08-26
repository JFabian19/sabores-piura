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

async function downloadImageDirect(url: string, destPath: string): Promise<boolean> {
  const urlsToTry = [
    url,
    `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=800&output=jpg&q=85`,
    `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=800&output=jpg&q=85`
  ];

  for (const u of urlsToTry) {
    try {
      const res = await fetch(u, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
      });
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        if (buffer.length > 1500) {
          fs.writeFileSync(destPath, buffer);
          return true;
        }
      }
    } catch (e) {
      // next
    }
  }
  return false;
}

// Queries de alta precisión gastronómica peruana
const DISH_SEARCH_TERMS: Record<string, string[]> = {
  // Fuentes Familiares
  "Fuente Grande: Parihuelas": [
    "parihuela de mariscos peruana comida",
    "parihuela mixta peruana",
    "sopa parihuela de mariscos peru"
  ],
  "Fuente Grande: Chaufa de Mariscos": [
    "arroz chaufa de mariscos peruano",
    "arroz chaufa de mariscos gastronomia peruana",
    "chaufa de mariscos peru"
  ],
  "Fuente Grande: Arroz con Mariscos": [
    "arroz con mariscos peruano gastronomia",
    "plato arroz con mariscos peru",
    "arroz con mariscos norteño peru"
  ],

  // Pasaditos
  "Pasadito de Caballa por Agua": [
    "pasadito de caballa piurano",
    "pasadito de caballa piura comida",
    "pasadito de pescado piurano tradicional"
  ],
  "Pasadito de Cabrilla": [
    "pasadito de cabrilla piura",
    "pescado pasado por agua piura",
    "pasadito de pescado piurano"
  ],

  // Caldos
  "Caldo de Gallina": [
    "caldo de gallina peruano tradicional",
    "plato caldo de gallina peru",
    "caldo de gallina criollo con huevo"
  ],
  "Caldo de Pata": [
    "caldo de pata peruano",
    "sopa de pata de res peruana",
    "caldo de pata con mote peru"
  ],

  // Platos Criollos
  "Lomo Saltado": [
    "lomo saltado peruano tradicional",
    "plato lomo saltado de carne peru",
    "lomo saltado clasico peruano"
  ],
  "Saltado de Pollo": [
    "saltado de pollo peruano",
    "pollo saltado criollo peruano",
    "saltado de pollo con papas fritas y arroz"
  ],
  "Pechuga a la Plancha": [
    "pechuga de pollo a la plancha con papas y ensalada",
    "pechuga a la plancha restaurante peruano",
    "pechuga de pollo a la plancha peru"
  ],
  "Chicharrón de Pollo": [
    "chicharron de pollo peruano crocante",
    "chicharron de pollo con papas fritas peru",
    "chicharron de pollo trozos dorados peruano"
  ],
  "Trucha Frita (Sábado y Domingo)": [
    "trucha frita peruana con papas doradas",
    "trucha frita plato tipico peru",
    "trucha frita dorada peruana"
  ],
  "Cuy Chactado (Medio)": [
    "cuy chactado frito peruano",
    "cuy chactado arequipa cusco comida",
    "cuy frito a la piedra peru"
  ],
  "Cuy Chactado (Entero)": [
    "cuy chactado cusco comida tipica",
    "cuy chactado entero tradicional peru",
    "plato cuy chactado frito"
  ],
  "Pollada": [
    "pollada peruana tradicional con papa y choclo",
    "plato de pollada criolla peruana",
    "pollada peruana frita con aji"
  ],
  "Parrilla": [
    "parrillada mixta de carnes peruana",
    "plato de parrillada con papas y ensalada peru",
    "parrilla de carne y pollo peru"
  ],

  // Bebidas
  "Gaseosa Descartable": [
    "gaseosa inca kola descartable botella",
    "botella inca kola 1 litro 1.5",
    "inca kola botella descartable"
  ],
  "Chicha Morada de Maíz 1 Lt.": [
    "jarra chicha morada peruana tradicional",
    "chicha morada peruana jarra vaso",
    "bebida chicha morada de maiz peru"
  ],
  "Chicha de Jora Piurana 1 Lt.": [
    "chicha de jora piura poto jarra",
    "chicha de jora tradicional piurana",
    "chicha de jora piura chulucanas"
  ],
  "Clarito Helado 1 Lt.": [
    "clarito piura chicha jora poto",
    "clarito bebida tradicional piurana",
    "clarito de jora piurano"
  ],
  "Cerveza Pilsen": [
    "cerveza pilsen callao botella helada",
    "botella pilsen callao peru",
    "pilsen callao 630ml"
  ],
  "Cerveza Cristal": [
    "cerveza cristal peru botella helada",
    "botella cerveza cristal 650ml",
    "cerveza cristal la rubia del peru"
  ],
  "Agua Mineral": [
    "botella agua mineral san mateo 500ml",
    "agua mineral san mateo peru",
    "botella agua mineral san luis peru"
  ]
};

async function searchDuckDuckGo(query: string): Promise<string[]> {
  try {
    const tokenUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&t=h_&iar=images&iax=images&ia=images`;
    const tokenRes = await fetch(tokenUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });
    const html = await tokenRes.text();
    const vqdMatch = html.match(/vqd=([a-zA-Z0-9_-]+)/) || html.match(/vqd="([^"]+)"/);
    if (!vqdMatch) return [];

    const vqd = vqdMatch[1];
    const imgApiUrl = `https://duckduckgo.com/i.js?l=es-pe&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,`;
    const imgRes = await fetch(imgApiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://duckduckgo.com/'
      }
    });
    const data = await imgRes.json();
    if (data?.results && Array.isArray(data.results)) {
      return data.results.map((r: any) => r.image).filter(Boolean);
    }
  } catch (e) {
    // ignore
  }
  return [];
}

async function searchWikimedia(query: string): Promise<string[]> {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=5&prop=imageinfo&iiprop=url&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    if (data?.query?.pages) {
      const urls: string[] = [];
      for (const pageId in data.query.pages) {
        const info = data.query.pages[pageId].imageinfo;
        if (info && info[0]?.url) {
          urls.push(info[0].url);
        }
      }
      return urls;
    }
  } catch (e) {
    // ignore
  }
  return [];
}

async function run() {
  const dir = path.resolve(__dirname, '../public/platos');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const targetCategories = ['fuentes', 'pasaditos', 'caldos', 'platos-criollos', 'bebidas'];
  console.log('🔍 Iniciando descarga y asignación de imágenes exactas para:', targetCategories.join(', '));

  const updatedCategories: Category[] = JSON.parse(JSON.stringify(DEFAULT_MENU_DATA));

  for (const category of updatedCategories) {
    if (!targetCategories.includes(category.id)) {
      continue;
    }

    console.log(`\n📂 Procesando categoría: ${category.nombre} (${category.items.length} platos)`);

    for (const dish of category.items) {
      const slug = slugify(dish.nombre);
      const filename = `${slug}.jpg`;
      const destPath = path.join(dir, filename);

      const searchQueries = DISH_SEARCH_TERMS[dish.nombre] || [dish.nombre + ' comida peruana'];

      console.log(`\n🍲 Plato: "${dish.nombre}"`);
      let success = false;

      for (const query of searchQueries) {
        console.log(`   🔎 Buscando: "${query}"...`);
        const ddgResults = await searchDuckDuckGo(query);
        const wikiResults = await searchWikimedia(query);
        const allCandidates = [...ddgResults, ...wikiResults];

        for (const imgUrl of allCandidates.slice(0, 6)) {
          if (!imgUrl.match(/\.(jpg|jpeg|png|webp)/i) && !imgUrl.includes('images') && !imgUrl.includes('wikimedia')) {
            continue;
          }
          const ok = await downloadImageDirect(imgUrl, destPath);
          if (ok) {
            console.log(`   ✅ Guardado exitoso: /platos/${filename} (${(fs.statSync(destPath).size / 1024).toFixed(1)} KB)`);
            dish.imagen = `/platos/${filename}`;
            success = true;
            break;
          }
        }
        if (success) break;
        await new Promise(r => setTimeout(r, 400));
      }

      if (!success) {
        if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
          dish.imagen = `/platos/${filename}`;
          console.log(`   ℹ️ Se conserva imagen existente previa: /platos/${filename}`);
        } else {
          console.log(`   ⚠️ No se pudo descargar imagen nueva para "${dish.nombre}".`);
        }
      }

      await new Promise(r => setTimeout(r, 600));
    }
  }

  // Guardar archivo menuData.ts
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
  console.log(`\n💾 Menú actualizado con éxito en: ${menuDataPath}`);
}

run().catch(console.error);
