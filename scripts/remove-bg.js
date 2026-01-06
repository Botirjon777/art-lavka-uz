const fs = require('fs');
const path = require('path');
const https = require('https');
const FormData = require('form-data');

const REMOVE_BG_API_KEY = 'LLQahkJRr3t79HsAtHjpvSiD';

async function removeBackground(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('size', 'auto');
    formData.append('image_file', fs.createReadStream(inputPath), path.basename(inputPath));

    formData.submit({
      host: 'api.remove.bg',
      path: '/v1.0/removebg',
      protocol: 'https:',
      headers: {
        'X-Api-Key': REMOVE_BG_API_KEY,
      },
    }, (err, res) => {
      if (err) return reject(err);

      if (res.statusCode === 200) {
        const writeStream = fs.createWriteStream(outputPath);
        res.pipe(writeStream);
        writeStream.on('finish', () => {
          console.log(`✅ Background removed: ${outputPath}`);
          resolve();
        });
      } else {
        res.setEncoding('utf8');
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          reject(new Error(`API Error ${res.statusCode}: ${data}`));
        });
      }
    });
  });
}

async function main() {
  const images = [
    // Cat designs
    { input: 'public/prints/cat-front.png', output: 'public/prints/cat-front-transparent.png' },
    { input: 'public/prints/cat-back.png', output: 'public/prints/cat-back-transparent.png' },
    // Uzbek National
    { input: 'public/prints/uzbek-national-front.png', output: 'public/prints/uzbek-national-front-transparent.png' },
    { input: 'public/prints/uzbek-national-back.png', output: 'public/prints/uzbek-national-back-transparent.png' },
    // Funny Meme
    { input: 'public/prints/funny-meme-front.png', output: 'public/prints/funny-meme-front-transparent.png' },
    { input: 'public/prints/funny-meme-back.png', output: 'public/prints/funny-meme-back-transparent.png' },
    // Stylish Modern
    { input: 'public/prints/stylish-modern-front.png', output: 'public/prints/stylish-modern-front-transparent.png' },
    { input: 'public/prints/stylish-modern-back.png', output: 'public/prints/stylish-modern-back-transparent.png' },
  ];

  console.log('🎨 Starting background removal...\n');

  for (const { input, output } of images) {
    try {
      await removeBackground(input, output);
    } catch (error) {
      console.error(`❌ Failed to process ${input}:`, error.message);
    }
  }

  console.log('\n✨ Done!');
}

main();
