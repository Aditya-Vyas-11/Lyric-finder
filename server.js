const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

async function lrclibRequest(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "LyricsFinder/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`LRCLIB returned ${response.status}`);
  }

  return await response.json();
}

const server = http.createServer(async (req, res) => {

  // SEARCH
  if (req.url.startsWith("/api/search")) {
    try {
      const url = new URL(req.url, `http://localhost:${PORT}`);

      const song = url.searchParams.get("song");
      const artist = url.searchParams.get("artist") || "";

      if (!song) {
        res.writeHead(400, {
          "Content-Type": "application/json"
        });

        return res.end(JSON.stringify({
          error: "Song name required"
        }));
      }

      let apiUrl =
        `https://lrclib.net/api/search?track_name=${encodeURIComponent(song)}`;

      if (artist) {
        apiUrl += `&artist_name=${encodeURIComponent(artist)}`;
      }

      const results = await lrclibRequest(apiUrl);

      res.writeHead(200, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify(results));

    } catch (error) {
      console.error(error);

      res.writeHead(500, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        error: "Search failed"
      }));
    }

    return;
  }


  // EXACT TRACK LOOKUP
  if (req.url.startsWith("/api/exact")) {
    try {
      const url = new URL(req.url, `http://localhost:${PORT}`);

      const trackName = url.searchParams.get("track");
      const artistName = url.searchParams.get("artist");
      const albumName = url.searchParams.get("album");
      const duration = url.searchParams.get("duration");

      if (!trackName || !artistName || !albumName || !duration) {
        res.writeHead(400, {
          "Content-Type": "application/json"
        });

        return res.end(JSON.stringify({
          error: "Complete track information required"
        }));
      }

      const apiUrl =
        `https://lrclib.net/api/get` +
        `?track_name=${encodeURIComponent(trackName)}` +
        `&artist_name=${encodeURIComponent(artistName)}` +
        `&album_name=${encodeURIComponent(albumName)}` +
        `&duration=${encodeURIComponent(duration)}`;

      const result = await lrclibRequest(apiUrl);

      res.writeHead(200, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify(result));

    } catch (error) {
      console.error(error);

      res.writeHead(404, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        error: "Exact lyrics not found"
      }));
    }

    return;
  }


  // GET BY LRCLIB ID
  if (req.url.startsWith("/api/lyrics")) {
    try {
      const url = new URL(req.url, `http://localhost:${PORT}`);

      const id = url.searchParams.get("id");

      if (!id) {
        res.writeHead(400, {
          "Content-Type": "application/json"
        });

        return res.end(JSON.stringify({
          error: "Song ID required"
        }));
      }

      const result = await lrclibRequest(
        `https://lrclib.net/api/get/${encodeURIComponent(id)}`
      );

      res.writeHead(200, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify(result));

    } catch (error) {
      console.error(error);

      res.writeHead(404, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        error: "Lyrics not found"
      }));
    }

    return;
  }


  // WEBSITE FILES
  let filePath;

  if (req.url === "/") {
    filePath = path.join(__dirname, "index.html");
  } else if (req.url === "/style.css") {
    filePath = path.join(__dirname, "style.css");
  } else if (req.url === "/script.js") {
    filePath = path.join(__dirname, "script.js");
  } else {
    res.writeHead(404);
    return res.end("Not Found");
  }

  const extension = path.extname(filePath);

  const contentTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript"
  };

  fs.readFile(filePath, (error, content) => {

    if (error) {
      res.writeHead(500);
      return res.end("Server Error");
    }

    res.writeHead(200, {
      "Content-Type": contentTypes[extension]
    });

    res.end(content);
  });
});


server.listen(PORT, () => {
  console.log(`Lyrics Finder running at http://localhost:${PORT}`);
});