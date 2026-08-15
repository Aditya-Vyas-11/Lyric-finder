// ======================================
// ELEMENTS
// ======================================

const songInput =
  document.getElementById("songInput");

const artistInput =
  document.getElementById("artistInput");

const searchBtn =
  document.getElementById("searchBtn");

const status =
  document.getElementById("status");

const resultsBox =
  document.getElementById("resultsBox");

const resultsHeader =
  document.getElementById("resultsHeader");

const resultsCount =
  document.getElementById("resultsCount");

const emptyState =
  document.getElementById("emptyState");

const loadingState =
  document.getElementById("loadingState");

const errorState =
  document.getElementById("errorState");

const errorMessage =
  document.getElementById("errorMessage");

const retryBtn =
  document.getElementById("retryBtn");

const lyricsBox =
  document.getElementById("lyricsBox");

const lyrics =
  document.getElementById("lyrics");

const songTitle =
  document.getElementById("songTitle");

const songMeta =
  document.getElementById("songMeta");

const lyricsArtwork =
  document.getElementById("lyricsArtwork");

const lyricsActions =
  document.getElementById("lyricsActions");

const copyLrcBtn =
  document.getElementById("copyLrcBtn");

const downloadLrcBtn =
  document.getElementById("downloadLrcBtn");

const audioInput =
  document.getElementById("audioInput");

const audioPlayer =
  document.getElementById("audioPlayer");

const playerBox =
  document.getElementById("playerBox");

const manualSyncBox =
  document.getElementById("manualSyncBox");

const startSyncBtn =
  document.getElementById("startSyncBtn");

const undoSyncBtn =
  document.getElementById("undoSyncBtn");

const resetSyncBtn =
  document.getElementById("resetSyncBtn");

const finishSyncBtn =
  document.getElementById("finishSyncBtn");

const syncLyrics =
  document.getElementById("syncLyrics");

const backToResultsBtn =
  document.getElementById("backToResultsBtn");


// ======================================
// VARIABLES
// ======================================

let syncedLines = [];

let manualLines = [];

let manualSyncActive = false;

let manualSyncIndex = 0;

let lastSearchResults = [];

let viewingLyrics = false;

let currentLrcText = "";

let lastSearchSong = "";

let lastSearchArtist = "";


// ======================================
// INITIAL STATE
// ======================================

showEmptyState();


// ======================================
// STATE HELPERS
// ======================================

function hideAllStates() {

  emptyState.style.display =
    "none";

  loadingState.style.display =
    "none";

  errorState.style.display =
    "none";

}


function showEmptyState() {

  hideAllStates();

  emptyState.style.display =
    "block";

}


function showLoadingState() {

  hideAllStates();

  loadingState.style.display =
    "block";

}


function showErrorState(
  message
) {

  hideAllStates();

  errorMessage.textContent =
    message;

  errorState.style.display =
    "block";

}


function showResultsState() {

  hideAllStates();

}


// ======================================
// STATUS
// ======================================

function setStatus(
  message,
  type = ""
) {

  status.textContent =
    message;

  status.className =
    type;

}


// ======================================
// SEARCH
// ======================================

async function searchSongs() {

  const song =
    songInput.value.trim();

  const artist =
    artistInput.value.trim();


  if (!song) {

    setStatus(
      "Please enter a song title.",
      "error"
    );


    songInput.focus();

    return;

  }


  lastSearchSong =
    song;

  lastSearchArtist =
    artist;


  showLoadingState();


  resultsBox.innerHTML =
    "";


  resultsHeader.style.display =
    "none";


  lyricsBox.style.display =
    "none";


  hideManualSync();

  hideLyricsActions();


  setStatus(
    "Searching lyrics...",
    "loading"
  );


  searchBtn.disabled =
    true;


  searchBtn.innerHTML =
    `
      <span class="spinner"></span>
      Searching
    `;


  try {

    let url =
      `/api/search?song=${encodeURIComponent(song)}`;


    if (artist) {

      url +=
        `&artist=${encodeURIComponent(artist)}`;

    }


    const response =
      await fetch(url);


    if (!response.ok) {

      throw new Error(
        `Search failed with status ${response.status}.`
      );

    }


    const results =
      await response.json();


    if (
      !Array.isArray(results) ||
      results.length === 0
    ) {

      resultsBox.innerHTML =
        "";


      showEmptyState();


      setStatus(
        "No matching lyrics were found.",
        "error"
      );


      return;

    }


    lastSearchResults =
      results;


    viewingLyrics =
      false;


    history.replaceState(
      { page: "results" },
      "",
      location.pathname
    );


    showResultsState();


    setStatus(
      "",
      ""
    );


    resultsCount.textContent =
      `${results.length} result${
        results.length === 1
          ? ""
          : "s"
      } found`;


    resultsHeader.style.display =
      "flex";


    showResults(
      results
    );

  }

  catch (error) {

    console.error(
      "Search error:",
      error
    );


    resultsBox.innerHTML =
      "";


    showErrorState(
      "We couldn't complete the search. Please check your connection and try again."
    );


    setStatus(
      "Search failed.",
      "error"
    );

  }

  finally {

    searchBtn.disabled =
      false;


    searchBtn.innerHTML =
      `
        <span class="search-icon">
          ⌕
        </span>

        <span>
          Search
        </span>

        <span class="button-arrow">
          →
        </span>
      `;

  }

}


// ======================================
// RETRY
// ======================================

retryBtn.addEventListener(
  "click",
  () => {

    if (
      lastSearchSong
    ) {

      songInput.value =
        lastSearchSong;

      artistInput.value =
        lastSearchArtist;


      searchSongs();

    }

  }
);


// ======================================
// SHOW RESULTS
// ======================================

function showResults(
  results
) {

  resultsBox.innerHTML =
    "";


  results.forEach(
    song => {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "result-card";


      // ARTWORK

      const artwork =
        document.createElement(
          "div"
        );


      artwork.className =
        "result-artwork";


      const artworkUrl =
        getArtworkUrl(
          song
        );


      if (artworkUrl) {

        artwork.style.backgroundImage =
          `url("${artworkUrl}")`;

        artwork.classList.add(
          "has-image"
        );

      }

      else {

        artwork.textContent =
          "♪";

      }


      // CONTENT

      const content =
        document.createElement(
          "div"
        );


      content.className =
        "result-content";


      const title =
        document.createElement(
          "h3"
        );


      title.textContent =
        song.trackName ||
        "Unknown Song";


      const artist =
        document.createElement(
          "p"
        );


      artist.className =
        "result-artist";


      artist.textContent =
        song.artistName ||
        "Unknown Artist";


      const album =
        document.createElement(
          "p"
        );


      album.className =
        "result-album";


      album.textContent =
        song.albumName ||
        "Unknown Album";


      content.append(
        title,
        artist,
        album
      );


      // SIDE

      const side =
        document.createElement(
          "div"
        );


      side.className =
        "result-side";


      const duration =
        document.createElement(
          "span"
        );


      duration.className =
        "duration";


      duration.textContent =
        formatDuration(
          song.duration
        );


      const badge =
        document.createElement(
          "span"
        );


      badge.className =
        "lyrics-badge";


      if (
        song.syncedLyrics
      ) {

        badge.classList.add(
          "synced"
        );


        badge.innerHTML =
          `
            <span class="badge-dot"></span>
            Synced
          `;

      }

      else if (
        song.plainLyrics
      ) {

        badge.classList.add(
          "plain"
        );


        badge.innerHTML =
          `
            <span class="badge-dot"></span>
            Plain
          `;

      }

      else {

        badge.classList.add(
          "unknown"
        );


        badge.textContent =
          "Lyrics unavailable";

      }


      const arrow =
        document.createElement(
          "span"
        );


      arrow.className =
        "result-arrow";


      arrow.textContent =
        "→";


      side.append(
        duration,
        badge,
        arrow
      );


      card.append(
        artwork,
        content,
        side
      );


      card.addEventListener(
        "click",
        () => {

          loadLyrics(
            song
          );

        }
      );


      resultsBox.appendChild(
        card
      );

    }
  );

}


// ======================================
// ARTWORK
// ======================================

function getArtworkUrl(
  song
) {

  if (!song) {
    return "";
  }


  return (
    song.albumArt ||
    song.albumArtUrl ||
    song.cover ||
    song.coverArt ||
    song.image ||
    song.imageUrl ||
    song.thumbnail ||
    ""
  );

}


// ======================================
// LOAD LYRICS
// ======================================

async function loadLyrics(
  song
) {

  setStatus(
    "Loading lyrics...",
    "loading"
  );


  lyricsBox.style.display =
    "none";


  hideManualSync();

  hideLyricsActions();


  try {

    if (!song.id) {

      throw new Error(
        "Song ID is missing."
      );

    }


    const response =
      await fetch(
        `/api/lyrics?id=${encodeURIComponent(song.id)}`
      );


    if (!response.ok) {

      throw new Error(
        `Lyrics request failed with status ${response.status}.`
      );

    }


    const data =
      await response.json();


    if (
      !data.plainLyrics &&
      !data.syncedLyrics
    ) {

      throw new Error(
        "Lyrics are not available for this song."
      );

    }


    songTitle.textContent =
      data.trackName ||
      song.trackName ||
      "Unknown Song";


    songMeta.textContent =
      `${
        data.artistName ||
        song.artistName ||
        "Unknown Artist"
      }${
        data.albumName ||
        song.albumName
          ? " • " +
            (
              data.albumName ||
              song.albumName
            )
          : ""
      }`;


    // ARTWORK

    const artworkUrl =
      getArtworkUrl(
        data
      ) ||
      getArtworkUrl(
        song
      );


    if (artworkUrl) {

      lyricsArtwork.style.backgroundImage =
        `url("${artworkUrl}")`;

      lyricsArtwork.textContent =
        "";

      lyricsArtwork.classList.add(
        "has-image"
      );

    }

    else {

      lyricsArtwork.style.backgroundImage =
        "";

      lyricsArtwork.textContent =
        "♪";

      lyricsArtwork.classList.remove(
        "has-image"
      );

    }


    lyricsBox.style.display =
      "block";


    backToResultsBtn.style.display =
      "inline-flex";


    viewingLyrics =
      true;


    history.pushState(
      { page: "lyrics" },
      "",
      "#lyrics"
    );


    // ==================================
    // SYNCED
    // ==================================

    if (
      data.syncedLyrics
    ) {

      syncedLines =
        parseSyncedLyrics(
          data.syncedLyrics
        );


      renderSyncedLyrics();


      currentLrcText =
        data.syncedLyrics;


      showLyricsActions(
        "Copy Synced Lyrics"
      );


      playerBox.style.display =
        "none";


      hideManualSync();


      setStatus(
        "Synced lyrics loaded.",
        "success-message"
      );

    }


    // ==================================
    // PLAIN
    // ==================================

    else {

      syncedLines =
        [];


      lyrics.textContent =
        data.plainLyrics;


      currentLrcText =
        "";


      hideLyricsActions();


      playerBox.style.display =
        "block";


      prepareManualSync(
        data.plainLyrics
      );


      setStatus(
        "Plain lyrics loaded. Manual synchronization is available.",
        "success-message"
      );

    }


    lyricsBox.scrollIntoView({
      behavior:
        "smooth",

      block:
        "start"
    });

  }

  catch (error) {

    console.error(
      "Lyrics error:",
      error
    );


    setStatus(
      "Unable to load lyrics.",
      "error"
    );


    showErrorState(
      error.message ||
      "Lyrics could not be loaded."
    );

  }

}


// ======================================
// LRC ACTIONS
// ======================================

function showLyricsActions(
  copyText
) {

  lyricsActions.style.display =
    "grid";


  copyLrcBtn.textContent =
    copyText;


  downloadLrcBtn.textContent =
    "Download LRC";


  copyLrcBtn.onclick =
    async () => {

      try {

        await navigator.clipboard.writeText(
          currentLrcText
        );


        copyLrcBtn.textContent =
          "✓ Copied to clipboard";


        setTimeout(
          () => {

            copyLrcBtn.textContent =
              copyText;

          },
          1800
        );

      }

      catch (error) {

        console.error(
          error
        );


        copyLrcBtn.textContent =
          "Unable to copy";


        setTimeout(
          () => {

            copyLrcBtn.textContent =
              copyText;

          },
          1800
        );

      }

    };


  downloadLrcBtn.onclick =
    () => {

      downloadLRC(
        currentLrcText
      );

    };

}


function hideLyricsActions() {

  lyricsActions.style.display =
    "none";

}


// ======================================
// DOWNLOAD LRC
// ======================================

function downloadLRC(
  lrcText
) {

  if (!lrcText) {

    setStatus(
      "There is no LRC data to download.",
      "error"
    );

    return;

  }


  const songName =
    cleanFileName(
      songTitle.textContent ||
      songInput.value ||
      "Song"
    );


  const artistName =
    cleanFileName(
      artistInput.value ||
      "Lyrics"
    );


  const filename =
    `${songName} - ${artistName}.lrc`;


  const blob =
    new Blob(
      [lrcText],
      {
        type:
          "text/plain;charset=utf-8"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;


  link.download =
    filename;


  document.body.appendChild(
    link
  );


  link.click();


  link.remove();


  URL.revokeObjectURL(
    url
  );


  setStatus(
    "LRC file downloaded successfully.",
    "success-message"
  );

}


// ======================================
// BACK TO RESULTS
// ======================================

function backToResults() {

  viewingLyrics =
    false;


  manualSyncActive =
    false;


  hideManualSync();

  hideLyricsActions();


  lyricsBox.style.display =
    "none";


  playerBox.style.display =
    "none";


  currentLrcText =
    "";


  if (
    lastSearchResults.length > 0
  ) {

    showResultsState();


    resultsHeader.style.display =
      "flex";


    resultsCount.textContent =
      `${lastSearchResults.length} result${
        lastSearchResults.length === 1
          ? ""
          : "s"
      } found`;


    showResults(
      lastSearchResults
    );


    setStatus(
      "",
      ""
    );

  }

  else {

    showEmptyState();

  }

}


// ======================================
// BACK BUTTON
// ======================================

backToResultsBtn.addEventListener(
  "click",
  () => {

    if (
      viewingLyrics
    ) {

      history.back();

    }

    else {

      backToResults();

    }

  }
);


// ======================================
// BROWSER BACK
// ======================================

window.addEventListener(
  "popstate",
  () => {

    if (
      viewingLyrics
    ) {

      backToResults();

    }

  }
);


// ======================================
// PARSE SYNCED LYRICS
// ======================================

function parseSyncedLyrics(
  text
) {

  const lines = [];


  text.split("\n").forEach(
    line => {

      const match =
        line.match(
          /^\[(\d{1,2}):(\d{2}(?:\.\d+)?)\]\s*(.*)$/
        );


      if (!match) {
        return;
      }


      const minutes =
        Number(
          match[1]
        );


      const seconds =
        Number(
          match[2]
        );


      const time =
        minutes * 60 +
        seconds;


      const lineText =
        match[3].trim();


      if (!lineText) {
        return;
      }


      lines.push({

        time,

        text:
          lineText,

        timestamp:
          formatTimestamp(
            time
          )

      });

    }
  );


  return lines;

}


// ======================================
// FORMAT TIMESTAMP
// ======================================

function formatTimestamp(
  seconds
) {

  const minutes =
    Math.floor(
      seconds / 60
    );


  const remaining =
    seconds % 60;


  return `[${String(
    minutes
  ).padStart(
    2,
    "0"
  )}:${remaining
    .toFixed(2)
    .padStart(
      5,
      "0"
    )}]`;

}


// ======================================
// FORMAT DURATION
// ======================================

function formatDuration(
  seconds
) {

  if (
    seconds === undefined ||
    seconds === null
  ) {

    return "";

  }


  const numeric =
    Number(
      seconds
    );


  if (
    !Number.isFinite(
      numeric
    ) ||
    numeric <= 0
  ) {

    return "";

  }


  const minutes =
    Math.floor(
      numeric / 60
    );


  const remaining =
    Math.floor(
      numeric % 60
    )
      .toString()
      .padStart(
        2,
        "0"
      );


  return `${minutes}:${remaining}`;

}


// ======================================
// RENDER SYNCED LYRICS
// ======================================

function renderSyncedLyrics() {

  lyrics.innerHTML =
    "";


  syncedLines.forEach(
    (line, index) => {

      const element =
        document.createElement(
          "div"
        );


      element.className =
        "lyric-line";


      element.textContent =
        `${line.timestamp} ${line.text}`;


      element.dataset.index =
        index;


      lyrics.appendChild(
        element
      );

    }
  );

}


// ======================================
// AUDIO
// ======================================

audioInput.addEventListener(
  "change",
  () => {

    const file =
      audioInput.files?.[0];


    if (!file) {
      return;
    }


    audioPlayer.src =
      URL.createObjectURL(
        file
      );


    setStatus(
      "Audio ready.",
      "success-message"
    );

  }
);


// ======================================
// SYNCED PLAYBACK
// ======================================

audioPlayer.addEventListener(
  "timeupdate",
  () => {

    if (
      !syncedLines.length
    ) {

      return;

    }


    const currentTime =
      audioPlayer.currentTime;


    let activeIndex =
      -1;


    for (
      let i = 0;
      i < syncedLines.length;
      i++
    ) {

      if (
        syncedLines[i].time <=
        currentTime
      ) {

        activeIndex =
          i;

      }

      else {

        break;

      }

    }


    if (
      activeIndex === -1
    ) {

      return;

    }


    document
      .querySelectorAll(
        ".lyric-line"
      )
      .forEach(
        line => {

          line.classList.remove(
            "active"
          );

        }
      );


    const activeLine =
      document.querySelector(
        `.lyric-line[data-index="${activeIndex}"]`
      );


    if (activeLine) {

      activeLine.classList.add(
        "active"
      );


      activeLine.scrollIntoView({
        behavior:
          "smooth",

        block:
          "center"
      });

    }

  }
);


// ======================================
// PREPARE MANUAL SYNC
// ======================================

function prepareManualSync(
  text
) {

  const lines =
    text
      .split("\n")
      .map(
        line =>
          line.trim()
      )
      .filter(
        line =>
          line.length > 0
      );


  manualLines =
    lines.map(
      line => ({

        text:
          line,

        time:
          null

      })
    );


  manualSyncIndex =
    0;


  manualSyncActive =
    false;


  renderManualSync();


  manualSyncBox.style.display =
    "block";

}


// ======================================
// RENDER MANUAL SYNC
// ======================================

function renderManualSync() {

  syncLyrics.innerHTML =
    "";


  manualLines.forEach(
    (line, index) => {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "sync-line";


      if (
        index === manualSyncIndex &&
        manualSyncActive
      ) {

        row.classList.add(
          "current"
        );

      }


      const time =
        line.time === null
          ? "--:--.--"
          : formatTimestamp(
              line.time
            );


      const timeElement =
        document.createElement(
          "span"
        );


      timeElement.className =
        "sync-time";


      timeElement.textContent =
        time;


      const textElement =
        document.createElement(
          "span"
        );


      textElement.className =
        "sync-text";


      textElement.textContent =
        line.text;


      const editBtn =
        document.createElement(
          "button"
        );


      editBtn.className =
        "edit-button";


      editBtn.type =
        "button";


      editBtn.textContent =
        "Edit";


      editBtn.addEventListener(
        "click",
        () => {

          editTimestamp(
            index
          );

        }
      );


      row.append(
        timeElement,
        textElement,
        editBtn
      );


      syncLyrics.appendChild(
        row
      );

    }
  );

}


// ======================================
// EDIT TIMESTAMP
// ======================================

function editTimestamp(
  index
) {

  const line =
    manualLines[index];


  if (!line) {
    return;
  }


  const current =
    line.time === null
      ? ""
      : line.time.toFixed(2);


  const input =
    prompt(
      "Enter timestamp in seconds.\nExample: 18.42",
      current
    );


  if (
    input === null
  ) {

    return;

  }


  const value =
    Number(
      input
    );


  if (
    !Number.isFinite(
      value
    ) ||
    value < 0
  ) {

    alert(
      "Please enter a valid timestamp. Example: 18.42"
    );

    return;

  }


  line.time =
    value;


  renderManualSync();


  setStatus(
    `Timestamp for line ${
      index + 1
    } updated successfully.`,
    "success-message"
  );

}


// ======================================
// START SYNC
// ======================================

startSyncBtn.addEventListener(
  "click",
  () => {

    if (
      !audioPlayer.src
    ) {

      setStatus(
        "Please select an audio file first.",
        "error"
      );

      return;

    }


    if (
      !manualLines.length
    ) {

      setStatus(
        "No lyrics are available for synchronization.",
        "error"
      );

      return;

    }


    manualSyncActive =
      true;


    manualSyncIndex =
      0;


    setStatus(
      "Synchronization started. Press SPACE when each line begins.",
      "loading"
    );


    renderManualSync();


    audioPlayer
      .play()
      .catch(
        () => {

          setStatus(
            "Press Play on the audio player to begin.",
            "loading"
          );

        }
      );

  }
);


// ======================================
// SPACEBAR SYNC
// ======================================

document.addEventListener(
  "keydown",
  event => {

    if (
      !manualSyncActive
    ) {

      return;

    }


    if (
      event.target.tagName === "INPUT" ||
      event.target.tagName === "TEXTAREA"
    ) {

      return;

    }


    if (
      event.code !== "Space"
    ) {

      return;

    }


    event.preventDefault();


    if (
      manualSyncIndex >=
      manualLines.length
    ) {

      return;

    }


    manualLines[
      manualSyncIndex
    ].time =
      audioPlayer.currentTime;


    manualSyncIndex++;


    renderManualSync();


    if (
      manualSyncIndex >=
      manualLines.length
    ) {

      setStatus(
        'All lines synchronized. Click "Finish Sync" to complete.',
        "success-message"
      );

    }

    else {

      setStatus(
        `Line ${
          manualSyncIndex + 1
        } of ${
          manualLines.length
        }.`,
        "loading"
      );

    }

  }
);


// ======================================
// UNDO
// ======================================

undoSyncBtn.addEventListener(
  "click",
  () => {

    if (
      !manualLines.length ||
      manualSyncIndex <= 0
    ) {

      setStatus(
        "Nothing to undo.",
        "error"
      );

      return;

    }


    manualSyncIndex--;


    manualLines[
      manualSyncIndex
    ].time =
      null;


    manualSyncActive =
      true;


    renderManualSync();


    setStatus(
      `Line ${
        manualSyncIndex + 1
      } is ready again.`,
      "loading"
    );

  }
);


// ======================================
// RESET
// ======================================

resetSyncBtn.addEventListener(
  "click",
  () => {

    if (
      !manualLines.length
    ) {

      setStatus(
        "There is no synchronization data to reset.",
        "error"
      );

      return;

    }


    const shouldReset =
      confirm(
        "Are you sure you want to reset all timestamps?"
      );


    if (
      !shouldReset
    ) {

      return;

    }


    manualLines.forEach(
      line => {

        line.time =
          null;

      }
    );


    manualSyncIndex =
      0;


    manualSyncActive =
      false;


    currentLrcText =
      "";


    hideLyricsActions();


    renderManualSync();


    setStatus(
      "Synchronization has been reset.",
      "success-message"
    );

  }
);


// ======================================
// FINISH SYNC
// ======================================

finishSyncBtn.addEventListener(
  "click",
  () => {

    if (
      !manualLines.length
    ) {

      setStatus(
        "No lyrics are available.",
        "error"
      );

      return;

    }


    const missing =
      manualLines.find(
        line =>
          line.time === null
      );


    if (
      missing
    ) {

      setStatus(
        "Please timestamp all lines before finishing.",
        "error"
      );

      return;

    }


    manualSyncActive =
      false;


    currentLrcText =
      generateLRC();


    syncLyrics.innerHTML =
      "";


    const pre =
      document.createElement(
        "pre"
      );


    pre.textContent =
      currentLrcText;


    syncLyrics.appendChild(
      pre
    );


    showLyricsActions(
      "Copy LRC"
    );


    setStatus(
      "Manual synchronization complete.",
      "success-message"
    );

  }
);


// ======================================
// GENERATE LRC
// ======================================

function generateLRC() {

  return manualLines
    .map(
      line =>
        `${formatTimestamp(
          line.time
        )} ${line.text}`
    )
    .join("\n");

}


// ======================================
// CLEAN FILE NAME
// ======================================

function cleanFileName(
  name
) {

  return name
    .replace(
      /[<>:"/\\|?*]/g,
      ""
    )
    .trim() ||
    "Song";

}


// ======================================
// HIDE MANUAL SYNC
// ======================================

function hideManualSync() {

  manualSyncBox.style.display =
    "none";


  manualSyncActive =
    false;

}


// ======================================
// SEARCH BUTTON
// ======================================

searchBtn.addEventListener(
  "click",
  searchSongs
);


// ======================================
// ENTER KEY
// ======================================

songInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter"
    ) {

      searchSongs();

    }

  }
);


artistInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter"
    ) {

      searchSongs();

    }

  }
);