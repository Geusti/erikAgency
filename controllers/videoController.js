const path = require('path');
const fs = require('fs');

function streamVideo(req, res) {
  const { filename } = req.params;
  
  // Sanitize filename to prevent directory traversal
  const safeFilename = path.basename(filename);
  
  // The videos will reside inside public/img/
  const videoPath = path.join(__dirname, '../public/img', safeFilename);
  
  if (!fs.existsSync(videoPath)) {
    return res.status(404).send('Vídeo não encontrado.');
  }
  
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;
  
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    
    if (start >= fileSize || end >= fileSize) {
      res.writeHead(416, {
        'Content-Range': `bytes */${fileSize}`
      });
      return res.end();
    }
    
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
}

module.exports = {
  streamVideo
};
