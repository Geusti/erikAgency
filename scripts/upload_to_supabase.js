require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types'); // We should probably install mime-types or just manually map extensions

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_KEY must be provided in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const bucketName = 'erik-media';
const imgDir = path.join(__dirname, '../public/img');

async function uploadFiles() {
  console.log(`Starting upload to Supabase bucket: ${bucketName}...`);
  
  if (!fs.existsSync(imgDir)) {
    console.error(`Directory ${imgDir} does not exist.`);
    return;
  }

  const files = fs.readdirSync(imgDir);
  
  for (const file of files) {
    const filePath = path.join(imgDir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile()) {
      const fileBuffer = fs.readFileSync(filePath);
      
      // Determine content type (fallback to octet-stream)
      let ext = path.extname(file).toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.mp4') contentType = 'video/mp4';
      else if (ext === '.svg') contentType = 'image/svg+xml';
      
      console.log(`Uploading ${file} (${Math.round(stat.size / 1024 / 1024 * 100) / 100} MB)...`);
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(file, fileBuffer, {
          contentType: contentType,
          upsert: true
        });

      if (error) {
        console.error(`Error uploading ${file}:`, error.message);
      } else {
        console.log(`Successfully uploaded ${file}.`);
      }
    }
  }
  
  console.log('Upload process completed!');
}

uploadFiles();
