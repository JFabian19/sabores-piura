import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const platosDir = path.resolve(__dirname, '../public/platos');
  const userUploadsDir = "C:\\Users\\jfabi\\.gemini\\antigravity-ide\\brain\\cad7b56a-a907-42e4-a28f-913da3f6c803\\.user_uploaded";

  if (!fs.existsSync(platosDir)) {
    fs.mkdirSync(platosDir, { recursive: true });
  }

  const tasks = [
    {
      src: path.join(userUploadsDir, "media_1787866373201.jpg"),
      targets: ["parihuela-de-cabrilla"]
    },
    {
      src: path.join(userUploadsDir, "media_1787866391534.jpg"),
      targets: ["parihuela-de-filete"]
    },
    {
      src: path.join(userUploadsDir, "media_1787866425519.jpg"),
      targets: ["ceviche-de-caballa", "cebiche-de-caballa"]
    },
    {
      src: path.join(userUploadsDir, "media_1787866540542.jpg"),
      targets: ["pasadito-de-caballa-por-agua", "pasadita-de-caballa-por-agua"]
    },
    {
      src: path.join(userUploadsDir, "media_1787866657478.png"),
      targets: ["pasadito-de-cabrilla", "pasadito-de-cabrilla-por-agua", "pasadita-de-cabrilla-por-agua"]
    },
    {
      src: path.join(userUploadsDir, "media_1787866845749.png"),
      targets: ["chicharron-de-cerdo-con-patacones", "chanchito-con-patacones"]
    }
  ];

  console.log("Starting image conversion and optimization with Sharp...");

  for (const item of tasks) {
    if (!fs.existsSync(item.src)) {
      console.warn(`File not found: ${item.src}`);
      continue;
    }

    for (const target of item.targets) {
      const webpPath = path.join(platosDir, `${target}.webp`);
      const jpgPath = path.join(platosDir, `${target}.jpg`);

      await sharp(item.src)
        .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 88 })
        .toFile(webpPath);

      await sharp(item.src)
        .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 88 })
        .toFile(jpgPath);

      const sizeKb = (fs.statSync(webpPath).size / 1024).toFixed(1);
      console.log(`✅ Converted ${target}.webp (${sizeKb} KB)`);
    }
  }

  console.log("All dish images processed successfully!");
}

main().catch(console.error);
