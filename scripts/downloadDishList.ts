import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DishDownloadTarget {
  name: string;
  query: string;
  filename: string;
}

const TARGET_DISHES: DishDownloadTarget[] = [
  {
    name: "Ceviche de Cabrillón",
    query: "ceviche de cabrillon piurano peruano",
    filename: "ceviche-de-cabrillon.jpg"
  },
  {
    name: "Ceviche de Corvina",
    query: "ceviche de corvina peruano plato",
    filename: "ceviche-de-corvina.jpg"
  },
  {
    name: "Jalea de Cabrilla",
    query: "jalea de cabrilla peruana",
    filename: "jalea-de-cabrilla.jpg"
  },
  {
    name: "Jalea Mixta",
    query: "jalea mixta de mariscos peruana",
    filename: "jalea-mixta.jpg"
  },
  {
    name: "Pasadito de Cabrilla",
    query: "pasadito de cabrilla piurano pescado pasado por agua",
    filename: "pasadito-de-cabrilla.jpg"
  },
  {
    name: "Arroz con Tortilla de Mariscos",
    query: "arroz con tortilla de mariscos peruano",
    filename: "arroz-con-tortilla-de-mariscos.jpg"
  },
  {
    name: "Majado de Yuca con Carne Aliñada",
    query: "majado de yuca con carne aliñada piura",
    filename: "majado-de-yuca-con-carne-alinada.jpg"
  },
  {
    name: "Caldo de Gallina",
    query: "caldo de gallina criollo peruano plato",
    filename: "caldo-de-gallina.jpg"
  },
  {
    name: "Caldo de Pata de Res",
    query: "caldo de pata de res peruano mote",
    filename: "caldo-de-pata.jpg"
  },
  {
    name: "Lomo Saltado",
    query: "lomo saltado peruano clasico",
    filename: "lomo-saltado.jpg"
  },
  {
    name: "Saltado de Pollo",
    query: "saltado de pollo lomo saltado de pollo peruano",
    filename: "saltado-de-pollo.jpg"
  },
  {
    name: "Pechuga de Pollo a la Plancha",
    query: "pechuga de pollo a la plancha con ensalada y papas",
    filename: "pechuga-a-la-plancha.jpg"
  },
  {
    name: "Trucha Frita",
    query: "trucha frita peruana con papas doradas y arroz",
    filename: "trucha-frita-sabado-y-domingo.jpg"
  },
  {
    name: "Pollada",
    query: "pollada peruana tradicional con papa y salsa",
    filename: "pollada.jpg"
  },
  {
    name: "Cuy Chactado Entero",
    query: "cuy chactado entero peruano arequipeño tradicional",
    filename: "cuy-chactado-entero.jpg"
  },
  {
    name: "Cuy Chactado Medio",
    query: "cuy chactado frito peruano plato",
    filename: "cuy-chactado-medio.jpg"
  },
  {
    name: "Gaseosa Descartable",
    query: "inca kola botella descartable peru",
    filename: "gaseosa-descartable.jpg"
  },
  {
    name: "Chicha Morada",
    query: "jarra de chicha morada peruana refresco",
    filename: "chicha-morada-de-maiz-1-lt.jpg"
  },
  {
    name: "Clarito Helado",
    query: "clarito piurano chicha de jora clarito",
    filename: "clarito-helado-1-lt.jpg"
  },
  {
    name: "Chicha de Jora Piurana",
    query: "jarra de chicha de jora piurana tradicional",
    filename: "chicha-de-jora-piurana-1-lt.jpg"
  },
  {
    name: "Cerveza Pilsen",
    query: "cerveza pilsen callao botella 630ml helada",
    filename: "cerveza-pilsen.jpg"
  },
  {
    name: "Cerveza Cristal",
    query: "cerveza cristal botella 650ml peru helada",
    filename: "cerveza-cristal.jpg"
  },
  {
    name: "Cerveza Cusqueña Trigo",
    query: "cerveza cusqueña trigo botella",
    filename: "cerveza-cusquena-trigo.jpg"
  },
  {
    name: "Cerveza Cusqueña Negra",
    query: "cerveza cusqueña negra botella",
    filename: "cerveza-cusquena-negra.jpg"
  },
  {
    name: "Agua Mineral",
    query: "botella de agua mineral san luis san mateo peru",
    filename: "agua-mineral.jpg"
  },
  {
    name: "Chicharrón de Calamar",
    query: "chicharron de calamar peruano aros crocantes salsa tartara",
    filename: "chicharron-de-calamar.jpg"
  },
  {
    name: "Caballa Frita",
    query: "caballa frita con chifles zarandaja piura",
    filename: "caballa-frita.jpg"
  },
  {
    name: "Ceviche de Caballa",
    query: "ceviche de caballa piurano con zarandaja",
    filename: "ceviche-de-caballa.jpg"
  }
];

async function downloadUrl(url: string, destPath: string): Promise<boolean> {
  const urlsToTry = [
    url,
    `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=800&output=jpg&q=85`,
    `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=800&output=jpg&q=85`
  ];

  for (const u of urlsToTry) {
    try {
      const res = await fetch(u, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
      });
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        if (buffer.length > 2000) {
          fs.writeFileSync(destPath, buffer);
          return true;
        }
      }
    } catch (e) {}
  }
  return false;
}

async function searchDuckDuckGo(query: string): Promise<string[]> {
  try {
    const tokenUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&t=h_&iar=images&iax=images&ia=images`;
    const tokenRes = await fetch(tokenUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
      }
    });
    const html = await tokenRes.text();
    const vqdMatch = html.match(/vqd=([a-zA-Z0-9_-]+)/) || html.match(/vqd="([^"]+)"/);
    if (!vqdMatch) return [];

    const vqd = vqdMatch[1];
    const imgApiUrl = `https://duckduckgo.com/i.js?l=es-es&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,`;
    const imgRes = await fetch(imgApiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Referer': 'https://duckduckgo.com/'
      }
    });
    const data = await imgRes.json();
    if (data?.results?.length > 0) {
      return data.results.map((r: any) => r.image || r.thumbnail).filter(Boolean);
    }
  } catch (err) {}
  return [];
}

async function searchGoogleImagesScrape(query: string): Promise<string[]> {
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&hl=es&gl=pe`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept-Language': 'es-PE,es;q=0.9,en;q=0.8'
      }
    });
    const html = await res.text();
    const matches = Array.from(html.matchAll(/\["(https:\/\/[^"]+)",\s*\d+,\s*\d+\]/g));
    const urls: string[] = [];
    for (const m of matches) {
      const u = m[1];
      if (u && !u.includes('gstatic.com') && !u.includes('google.com') && (u.endsWith('.jpg') || u.endsWith('.jpeg') || u.endsWith('.png') || u.includes('.jpg') || u.includes('.png'))) {
        urls.push(u);
      }
    }
    return urls;
  } catch (e) {}
  return [];
}

async function run() {
  const targetDir = path.resolve(__dirname, '../public/platos');
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  console.log(`Starting download for ${TARGET_DISHES.length} dish images...`);

  for (const item of TARGET_DISHES) {
    const destPath = path.join(targetDir, item.filename);
    console.log(`\n🔍 Searching image for "${item.name}" (query: "${item.query}")...`);
    
    // First try DuckDuckGo top results
    let urls = await searchDuckDuckGo(item.query);
    if (urls.length === 0) {
      urls = await searchGoogleImagesScrape(item.query);
    }
    if (urls.length === 0) {
      urls = await searchDuckDuckGo(`${item.name} comida peru`);
    }

    let success = false;
    for (let i = 0; i < Math.min(6, urls.length); i++) {
      const u = urls[i];
      console.log(`   Trying [${i+1}/${Math.min(6, urls.length)}]: ${u.substring(0, 70)}...`);
      const downloaded = await downloadUrl(u, destPath);
      if (downloaded) {
        const size = fs.statSync(destPath).size;
        console.log(`   ✅ Success! Saved to ${item.filename} (${(size / 1024).toFixed(1)} KB)`);
        success = true;
        break;
      }
    }

    if (!success) {
      console.log(`   ❌ Could not download image for ${item.name}`);
    }

    await new Promise(r => setTimeout(r, 600));
  }
}

run();
