import { Category, Dish } from '../data/menuData';

// Mapeo curado de términos gastronómicos peruanos y norteños para máxima precisión visual
const GASTRONOMY_IMAGE_FALLBACKS: Record<string, string> = {
  // Ceviches
  "ceviche de cabrillon": "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&auto=format&fit=crop&q=80",
  "cebiche de cabrillon": "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&auto=format&fit=crop&q=80",
  "ceviche de corvina": "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&auto=format&fit=crop&q=80",
  "cebiche de corvina": "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&auto=format&fit=crop&q=80",
  "ceviche de pescado": "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&auto=format&fit=crop&q=80",
  "ceviche mixto": "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&auto=format&fit=crop&q=80",
  "ceviche de caballa": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80",
  "ceviche de conchas negras": "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=600&auto=format&fit=crop&q=80",
  "causa acevichada": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
  "leche de tigre": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80",
  
  // Chicharrones y Jaleas
  "chicharron de calamar": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
  "chicharron de pescado": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
  "chicharron mixto": "https://images.unsplash.com/photo-1594998893017-36147cbcae05?w=600&auto=format&fit=crop&q=80",
  "jalea de cabrilla": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80",
  "jalea mixta": "https://images.unsplash.com/photo-1594998893017-36147cbcae05?w=600&auto=format&fit=crop&q=80",
  
  // Arroces
  "arroz con mariscos": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
  "chaufa de pescado": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80",
  "chaufa de mariscos": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80",
  "arroz con tortilla de mariscos": "https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80",
  
  // Piura Tradición
  "arroz con pato": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80",
  "cabrito con tamalito verde": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
  "seco de chabelo": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
  "majado de yuca con carne alinada": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80",
  "mallarabia": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
  "malarrabia": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
  "carne seca con chifles": "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&auto=format&fit=crop&q=80",
  "chanchito con patacones": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
  "frito piurano": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
  "toyito": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80",
  "ronda criolla": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80",
  
  // Sudados y Parihuelas
  "sudado de cabrillon": "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80",
  "sudado de corvina": "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80",
  "sudado de cabrilla": "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80",
  "sudado de cachema": "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80",
  "sudado de filete": "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80",
  "sudado de caballa": "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80",
  "parihuela de cabrilla": "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80",
  "parihuela de filete": "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80",
  
  // Menú Niños
  "nuggets + papas fritas": "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80",
  "arroz a la cubana": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
  
  // Caldos y Criollos
  "caldo de gallina": "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80",
  "caldo de pata": "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80",
  "lomo saltado": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
  "saltado de pollo": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
  "pechuga a la plancha": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
  "chicharron de pollo": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
  "trucha frita": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80",
  "cuy chactado": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
  "pollada": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80",
  "parrilla": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80",
  
  // Bebidas
  "gaseosa descartable": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80",
  "chicha morada": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
  "chicha de jora": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
  "clarito helado": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
  "cerveza pilsen": "https://images.unsplash.com/photo-1608270174093-16a75066a506?w=600&auto=format&fit=crop&q=80",
  "cerveza cristal": "https://images.unsplash.com/photo-1608270174093-16a75066a506?w=600&auto=format&fit=crop&q=80",
  "agua mineral": "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80"
};

/**
 * Normaliza una cadena quitando tildes, signos y convirtiendo a minúsculas
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Busca una imagen automáticamente para un plato en APIs web y bases gastronómicas
 */
export async function searchImageForDish(dishName: string): Promise<string | null> {
  const normalized = normalizeText(dishName);

  // 1. Verificar coincidencia directa en el mapa gastronómico curado
  for (const [key, url] of Object.entries(GASTRONOMY_IMAGE_FALLBACKS)) {
    const keyNorm = normalizeText(key);
    if (normalized.includes(keyNorm) || keyNorm.includes(normalized)) {
      return url;
    }
  }

  // 2. Búsqueda en Wikimedia Commons REST API (Imágenes libres de gastronomía)
  try {
    const searchQuery = encodeURIComponent(`${dishName} comida peru`);
    const wikiUrl = `https://es.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&pithumbsize=600&generator=search&gsrsearch=${searchQuery}&gsrlimit=3`;
    
    const res = await fetch(wikiUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.query && data.query.pages) {
        const pages = Object.values(data.query.pages) as any[];
        const pageWithImage = pages.find(p => p.thumbnail && p.thumbnail.source);
        if (pageWithImage && pageWithImage.thumbnail && pageWithImage.thumbnail.source) {
          return pageWithImage.thumbnail.source;
        }
      }
    }
  } catch (error) {
    console.warn(`Error buscando en Wikimedia para ${dishName}:`, error);
  }

  // 3. Fallback inteligente basado en palabras clave principales
  if (normalized.includes('ceviche') || normalized.includes('cebiche')) {
    return "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&auto=format&fit=crop&q=80";
  }
  if (normalized.includes('chicharron') || normalized.includes('jalea')) {
    return "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80";
  }
  if (normalized.includes('arroz') || normalized.includes('chaufa')) {
    return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80";
  }
  if (normalized.includes('sudado') || normalized.includes('parihuela') || normalized.includes('caldo')) {
    return "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80";
  }
  if (normalized.includes('chicha') || normalized.includes('bebida') || normalized.includes('clarito')) {
    return "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80";
  }
  if (normalized.includes('cerveza') || normalized.includes('gaseosa') || normalized.includes('agua')) {
    return "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80";
  }

  return null;
}

export interface ImageProcessingLog {
  dishName: string;
  categoryName: string;
  status: 'updated' | 'skipped' | 'error';
  imageUrl?: string;
  error?: string;
}

export interface AutoAssignResult {
  updatedCategories: Category[];
  totalUpdated: number;
  totalSkipped: number;
  totalErrors: number;
  logs: ImageProcessingLog[];
}

/**
 * Procesa automáticamente todas las categorías y platos de la carta
 */
export async function autoAssignDishImages(
  categories: Category[],
  onProgress?: (processed: number, total: number, currentDish: string) => void
): Promise<AutoAssignResult> {
  const logs: ImageProcessingLog[] = [];
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  // Calcular total de platos
  const allDishesCount = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  let processedCount = 0;

  const updatedCategories: Category[] = [];

  for (const category of categories) {
    const updatedItems: Dish[] = [];

    for (const dish of category.items) {
      processedCount++;
      if (onProgress) {
        onProgress(processedCount, allDishesCount, dish.nombre);
      }

      // Regla 9: Si el plato ya tiene una imagen existente, no reemplazarla
      if (dish.imagen && dish.imagen.trim().length > 0) {
        updatedItems.push(dish);
        totalSkipped++;
        logs.push({
          dishName: dish.nombre,
          categoryName: category.nombre,
          status: 'skipped',
          imageUrl: dish.imagen
        });
        continue;
      }

      // Buscar imagen automáticamente
      try {
        const foundUrl = await searchImageForDish(dish.nombre);

        if (foundUrl) {
          updatedItems.push({
            ...dish,
            imagen: foundUrl
          });
          totalUpdated++;
          logs.push({
            dishName: dish.nombre,
            categoryName: category.nombre,
            status: 'updated',
            imageUrl: foundUrl
          });
        } else {
          // Regla 10: Si no encuentra imagen, dejar el campo vacío y registrar el error
          updatedItems.push(dish);
          totalErrors++;
          logs.push({
            dishName: dish.nombre,
            categoryName: category.nombre,
            status: 'error',
            error: 'No se encontró imagen adecuada'
          });
        }
      } catch (err: any) {
        updatedItems.push(dish);
        totalErrors++;
        logs.push({
          dishName: dish.nombre,
          categoryName: category.nombre,
          status: 'error',
          error: err?.message || 'Error durante la búsqueda'
        });
      }

      // Pausa ligera para no saturar requests
      await new Promise(r => setTimeout(r, 60));
    }

    updatedCategories.push({
      ...category,
      items: updatedItems
    });
  }

  return {
    updatedCategories,
    totalUpdated,
    totalSkipped,
    totalErrors,
    logs
  };
}
