import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const platosDir = path.resolve(__dirname, '../public/platos');
  const userUploadsDir = "C:\\Users\\jfabi\\.gemini\\antigravity-ide\\brain\\cad7b56a-a907-42e4-a28f-913da3f6c803\\.user_uploaded";

  const toyitoSrc = path.join(userUploadsDir, "media_1787873151876.png");

  if (!fs.existsSync(toyitoSrc)) {
    console.error("Toyito source file not found:", toyitoSrc);
    return;
  }

  const targets = ["toyito", "toyito-alinado", "tollito-alinado"];

  for (const target of targets) {
    const webpPath = path.join(platosDir, `${target}.webp`);
    const jpgPath = path.join(platosDir, `${target}.jpg`);

    await sharp(toyitoSrc)
      .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 88 })
      .toFile(webpPath);

    await sharp(toyitoSrc)
      .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 88 })
      .toFile(jpgPath);

    console.log(`✅ Saved ${target}.webp (${(fs.statSync(webpPath).size / 1024).toFixed(1)} KB)`);
  }

  console.log("Toyito images updated successfully!");
}

main().catch(console.error);
