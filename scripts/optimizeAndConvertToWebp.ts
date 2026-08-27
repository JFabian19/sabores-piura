import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const platosDir = path.resolve(__dirname, '../public/platos');
  const userUploadsDir = "C:\\Users\\jfabi\\.gemini\\antigravity-ide\\brain\\648e09d7-ca5d-49dd-9479-6f97b06b9480\\.user_uploaded";

  // Specific 3 uploads from user:
  const newUploads = [
    {
      src: path.join(userUploadsDir, "media_1787798696293.jpg"),
      baseName: "pollada"
    },
    {
      src: path.join(userUploadsDir, "media_1787798737150.png"),
      baseName: "chicha-morada-de-maiz-1-lt"
    },
    {
      src: path.join(userUploadsDir, "media_1787798773182.png"),
      baseName: "gaseosa-descartable"
    }
  ];

  console.log("--- 1. Processing New User Uploads ---");
  for (const upload of newUploads) {
    if (fs.existsSync(upload.src)) {
      console.log(`Converting new upload: ${upload.baseName}...`);
      const targetWebp = path.join(platosDir, `${upload.baseName}.webp`);
      const targetJpg = path.join(platosDir, `${upload.baseName}.jpg`);

      await sharp(upload.src)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(targetWebp);

      await sharp(upload.src)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(targetJpg);

      console.log(`✅ Saved ${upload.baseName}.webp (${(fs.statSync(targetWebp).size / 1024).toFixed(1)} KB)`);
    } else {
      console.warn(`File not found: ${upload.src}`);
    }
  }

  console.log("\n--- 2. Optimizing All Existing Platos Images to WebP ---");
  const files = fs.readdirSync(platosDir);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      const baseName = path.basename(file, ext);
      const inputPath = path.join(platosDir, file);
      const targetWebp = path.join(platosDir, `${baseName}.webp`);

      try {
        await sharp(inputPath)
          .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(targetWebp);

        console.log(`Optimized ${baseName}.webp (${(fs.statSync(targetWebp).size / 1024).toFixed(1)} KB)`);
      } catch (err: any) {
        console.error(`Error converting ${file}:`, err.message);
      }
    }
  }

  console.log("\n--- 3. Updating menuData.ts to use .webp extensions ---");
  const menuDataPath = path.resolve(__dirname, '../src/data/menuData.ts');
  let content = fs.readFileSync(menuDataPath, 'utf-8');
  content = content.replace(/\/platos\/([a-zA-Z0-9_-]+)\.(jpg|png|jpeg)/g, '/platos/$1.webp');
  fs.writeFileSync(menuDataPath, content, 'utf-8');
  console.log("✅ menuData.ts updated with .webp image paths!");
}

main().catch(console.error);
