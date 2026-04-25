import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import convert from "heic-convert";

const sourceDir = "C:/Users/Evann/OneDrive/Desktop/Photo Album (son)";
const targetDir = "C:/Users/Evann/OneDrive/Desktop/mot-mot/public/collage";

await mkdir(targetDir, { recursive: true });

const entries = await readdir(sourceDir, { withFileTypes: true });
const heicFiles = entries
  .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === ".heic")
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b))
  .slice(0, 24);

let converted = 0;
for (const fileName of heicFiles) {
  const inputPath = path.join(sourceDir, fileName);
  const outputPath = path.join(targetDir, `${path.parse(fileName).name}.jpg`);

  const inputBuffer = await readFile(inputPath);
  const outputBuffer = await convert({
    buffer: inputBuffer,
    format: "JPEG",
    quality: 0.86,
  });

  await writeFile(outputPath, outputBuffer);
  converted += 1;
}

console.log(`Converted ${converted} HEIC files to JPG.`);
