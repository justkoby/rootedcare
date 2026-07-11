// Run this from: c:\Users\kobby\Downloads\RootedCare
// node scripts/convert_herbs.js
const path = require('path');
const fs = require('fs');

// Resolve sharp from the project's own node_modules
const sharp = require(path.join(process.cwd(), 'node_modules', 'sharp'));

const HERBS_DIR = path.join(process.cwd(), 'src', 'assets', 'herbs');

async function convertToTruePng(inputPath, outputPath) {
  const inputBuf = fs.readFileSync(inputPath);

  // Get metadata first to log what we're fixing
  const meta = await sharp(inputBuf).metadata();
  console.log('\n[' + path.basename(inputPath) + ']');
  console.log('  Original Format  : ' + meta.format);
  console.log('  Original Size    : ' + meta.width + 'x' + meta.height);
  console.log('  Color Space      : ' + meta.space);
  console.log('  Has ICC profile  : ' + !!meta.icc);
  console.log('  Has EXIF data    : ' + !!meta.exif);

  // Target: max 1024px on longest side, genuine sRGB PNG, zero metadata
  let pipeline = sharp(inputBuf).withMetadata(false);

  // Resize if needed
  if (meta.width > 1024 || meta.height > 1024) {
    pipeline = pipeline.resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true });
  }

  // Convert to flat sRGB PNG: no alpha, no embedded profiles, 8-bit
  const outBuf = await pipeline
    .flatten({ background: { r: 255, g: 255, b: 255 } }) // flatten alpha to white
    .toColorspace('srgb')
    .png({
      compressionLevel: 7,
      adaptiveFiltering: false,
      force: true
    })
    .toBuffer({ resolveWithObject: true });

  // Verify output PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  const magic = outBuf.data.slice(0, 8).toString('hex');
  if (magic !== '89504e470d0a1a0a') {
    throw new Error('Output is NOT a valid PNG! Magic bytes: ' + magic);
  }

  fs.writeFileSync(outputPath, outBuf.data);

  const inKB = Math.round(inputBuf.length / 1024);
  const outKB = Math.round(outBuf.data.length / 1024);
  console.log('  Genuine PNG: ' + outBuf.info.width + 'x' + outBuf.info.height + ' (' + inKB + 'KB -> ' + outKB + 'KB)');
  console.log('  PNG magic bytes: ' + magic + ' (VALID)');

  return {
    originalFile: path.basename(inputPath),
    originalFormat: meta.format,
    originalDims: meta.width + 'x' + meta.height,
    originalKB: inKB,
    outputFile: path.basename(outputPath),
    outputDims: outBuf.info.width + 'x' + outBuf.info.height,
    outputKB: outKB,
  };
}

async function main() {
  if (!fs.existsSync(HERBS_DIR)) {
    console.error('ERROR: herbs directory not found at ' + HERBS_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(HERBS_DIR);
  const results = [];
  const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.tif'];

  console.log('Found ' + files.length + ' files in ' + HERBS_DIR);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!IMAGE_EXTS.includes(ext)) {
      console.log('Skipping non-image: ' + file);
      continue;
    }

    const inputPath = path.join(HERBS_DIR, file);
    const baseName = path.basename(file, ext);
    const outputPath = path.join(HERBS_DIR, baseName + '.png');

    const result = await convertToTruePng(inputPath, outputPath);
    results.push(result);

    // Remove original if it had a different extension
    if (inputPath !== outputPath) {
      fs.unlinkSync(inputPath);
      console.log('  Removed original ' + ext + ' file: ' + file);
    }
  }

  console.log('\n========== CONVERSION SUMMARY ==========');
  results.forEach(r => {
    const changed = r.originalFormat !== 'png';
    const marker = changed ? '[FIXED]' : '[OK]   ';
    console.log(marker + ' ' + r.originalFile + ' was ' + r.originalFormat.toUpperCase() + ' ' + r.originalDims + ' ' + r.originalKB + 'KB => ' + r.outputFile + ' PNG ' + r.outputDims + ' ' + r.outputKB + 'KB');
  });

  const fixed = results.filter(r => r.originalFormat !== 'png');
  console.log('\n' + fixed.length + ' file(s) had wrong format and were re-encoded as genuine PNGs.');
  console.log('All herb images are now genuine standard RGB PNGs with no metadata.');
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
