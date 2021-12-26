const express = require("express");
const app = express();
const fs = require("fs");
const mime = require('mime');

var moviefolder = './Movies'

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/ext", function (req, res) {
  res.sendFile(__dirname + "/indext.html");
});


app.listen(8000, function () {
  console.log("Listening on port 8000!");
});

app.get("/list", function(req,res){
  var list = []
  fs.readdir(moviefolder, (err, files)=>{
    files.forEach(file=>{
      list.push(file);
    })
      console.log(list);
      res.json(list);
  })
})


app.get("/videoext", function (req, res) {
  // Ensure there is a range given for the video
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }


  // get video stats (about 61MB)
  const videoPath = `./Movies/${req.query.path}`;
  const videoSize = fs.statSync(videoPath).size;

  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": mime.getType(videoPath)
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});
