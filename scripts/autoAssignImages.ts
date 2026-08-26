import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_MENU_DATA, Category } from '../src/data/menuData.js';
import { autoAssignDishImages } from '../src/services/imageSearchService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log('🚀 Iniciando proceso automático de asignación de imágenes...');
  console.log('📋 Leyendo categorías y platos de la carta...');

  const result = await autoAssignDishImages(DEFAULT_MENU_DATA, (processed, total, currentDish) => {
    process.stdout.write(`\r⏳ Procesando [${processed}/${total}]: ${currentDish.padEnd(45)}`);
  });

  console.log('\n\n✅ Proceso completado con éxito!');
  console.log(`✨ Platos actualizados con nueva imagen: ${result.totalUpdated}`);
  console.log(`⏭️ Platos omitidos (ya tenían imagen): ${result.totalSkipped}`);
  console.log(`⚠️ Errores o sin imagen encontrada: ${result.totalErrors}`);

  // Guardar archivo menuData.ts actualizado
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

export const DEFAULT_MENU_DATA: Category[] = ${JSON.stringify(result.updatedCategories, null, 2)};
`;

  fs.writeFileSync(menuDataPath, fileContent, 'utf-8');
  console.log(`💾 Archivo guardado correctamente en: ${menuDataPath}`);
}

run().catch((err) => {
  console.error('❌ Error ejecutando script:', err);
  process.exit(1);
});
