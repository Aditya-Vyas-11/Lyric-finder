# Lyrics Finder

A web-based lyrics workspace for searching, viewing, synchronizing, and exporting song lyrics.

## Features

- Search songs by title and artist
- View synchronized lyrics
- View plain lyrics
- Upload local audio files
- Manually synchronize lyrics with audio
- Edit individual timestamps
- Undo and reset synchronization
- Generate `.lrc` files
- Copy synchronized lyrics
- Download LRC files
- Responsive and modern interface
- Loading, empty, and error states

## How It Works

1. Search for a song.
2. Select the desired result.
3. If synchronized lyrics are available, view and export them directly.
4. If only plain lyrics are available, upload the corresponding audio file.
5. Start manual synchronization.
6. Press `SPACE` whenever a lyric line begins.
7. Edit timestamps if necessary.
8. Finish synchronization.
9. Copy or download the generated `.lrc` file.

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Node.js
- REST API

## Project Structure

```text
lyrics-finder/
│
├── index.html
├── style.css
├── script.js
├── server.js
└── package.json
