// S-PHANTOM — a generative glitch engine.
// Each frame: draw a simple generative source, then run it through every effect in EFFECTS.
// Each effect has a "gene" (0..1 intensity) that drifts over time, so the look keeps mutating.
//
// To add your own effect: write a function ({ px, w, h, amt, prev }) that edits `px` in place,
// and add it to EFFECTS. `px` is a Uint32Array, one number per pixel (0xAABBGGRR, little-endian),
// `amt` is its current gene, `prev` is last frame's output.
// `react` decides how the EUL stream pushes the effect: it gets { bass, mid, high, level }, all 0..1,
// and returns an amount added on top of the gene. bass/mid/high are hits (jumps above their recent average).

const SCALE = 3                 // render at 1/3 resolution, CSS scales it up with hard pixels
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
const FRAME_MS = reducedMotion ? 500 : 1000 / 30

const canvas = document.getElementById('sp')
const ctx = canvas.getContext('2d', { willReadFrequently: true })   // hint: we read pixels back every frame
const genesEl = document.getElementById('sp-genes')
const stream = document.getElementById('sp-stream')
const btn = document.getElementById('sp-btn')

// Read colours from the site's CSS variables so the canvas follows the theme
const css = getComputedStyle(document.documentElement)
const bg = css.getPropertyValue('--bg').trim()
const fg = css.getPropertyValue('--accent').trim()

const lum = (p) => (p & 255) + ((p >> 8) & 255) + ((p >> 16) & 255)


/* ---- Effects ---------------------------------------------------------- */

// Pixel sort: in each row, find runs brighter than a threshold and sort them by brightness
function pixelSort({ px, w, h, amt }) {
  const threshold = 765 * (1 - amt)
  for (let y = 0; y < h; y++) {
    const row = px.subarray(y * w, (y + 1) * w)
    let start = -1
    for (let x = 0; x <= w; x++) {
      const bright = x < w && lum(row[x]) > threshold
      if (bright && start < 0) start = x
      if (!bright && start >= 0) {
        row.subarray(start, x).sort((a, b) => lum(a) - lum(b))
        start = -1
      }
    }
  }
}

// Datamosh: copy square blocks from last frame (stuck pixels) or from a random spot (misplaced data)
function mosh({ px, w, h, amt, prev }) {
  const blocks = Math.floor(amt * 60)
  for (let i = 0; i < blocks; i++) {
    const size = 4 + Math.floor(Math.random() * 20)
    const dx = Math.floor(Math.random() * (w - size)), dy = Math.floor(Math.random() * (h - size))
    const stuck = Math.random() < 0.6
    const src = stuck ? prev : px
    const sx = stuck ? dx : Math.floor(Math.random() * (w - size))
    const sy = stuck ? dy : Math.floor(Math.random() * (h - size))
    for (let r = 0; r < size; r++) {
      const from = (sy + r) * w + sx
      px.set(src.subarray(from, from + size), (dy + r) * w + dx)
    }
  }
}

// RGB split: pull the red channel one way and blue the other
function rgbSplit({ px, amt }) {
  const d = Math.round(amt * 16)
  if (!d) return
  const src = px.slice()
  const n = px.length
  for (let i = 0; i < n; i++) {
    const r = src[Math.max(i - d, 0)] & 0x0000ff
    const b = src[Math.min(i + d, n - 1)] & 0xff0000
    px[i] = 0xff000000 | b | (src[i] & 0x00ff00) | r
  }
}

// Slice shift: tear horizontal bands sideways, wrapping around
function sliceShift({ px, w, h, amt }) {
  const bands = Math.floor(amt * 10)
  for (let i = 0; i < bands; i++) {
    const y0 = Math.floor(Math.random() * h)
    const bandH = 1 + Math.floor(Math.random() * 20)
    const shift = Math.floor((Math.random() - 0.5) * amt * w * 0.5)
    for (let y = y0; y < Math.min(y0 + bandH, h); y++) {
      const row = px.subarray(y * w, (y + 1) * w)
      const copy = row.slice()
      for (let x = 0; x < w; x++) row[x] = copy[(((x - shift) % w) + w) % w]
    }
  }
}

// Order matters: each effect sees the output of the one before it
const EFFECTS = [
  { name: 'sort', fn: pixelSort, react: (a) => a.level * 0.5 },
  { name: 'mosh', fn: mosh, react: (a) => a.bass * 1.5 },
  { name: 'rgb', fn: rgbSplit, react: (a) => a.high * 2 },
  { name: 'slice', fn: sliceShift, react: (a) => a.bass + a.mid },
]


/* ---- Source ----------------------------------------------------------- */

// A few slow-moving bars and circles. This is what the effects chew on.
function drawSource(t) {
  const { width: w, height: h } = canvas
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 6; i++) {
    const x = (Math.sin(t * 0.00021 * (i + 1) + i * 2) * 0.5 + 0.5) * w
    const y = (Math.cos(t * 0.00017 * (i + 2) + i) * 0.5 + 0.5) * h
    ctx.globalAlpha = 0.3 + (i % 3) * 0.3
    ctx.fillStyle = fg
    if (i % 2) ctx.fillRect(0, y, w, 2 + i * 3)
    else { ctx.beginPath(); ctx.arc(x, y, h * (0.05 + i * 0.04), 0, Math.PI * 2); ctx.fill() }
  }
  ctx.globalAlpha = 1
}


/* ---- Audio ------------------------------------------------------------ */

// The EUL stream sends Access-Control-Allow-Origin: *, which (with crossorigin on the <audio>)
// lets us read its samples. Without that header the browser would play it but give us silence.
let analyser, bins
const avg = [0, 0, 0]
const SILENT = { bass: 0, mid: 0, high: 0, level: 0 }

// Average loudness of a range of frequency bins, 0..1
const band = (from, to) => bins.subarray(from, to).reduce((a, b) => a + b, 0) / (to - from) / 255

function listen() {
  if (!analyser || stream.paused) return SILENT
  analyser.getByteFrequencyData(bins)
  // fftSize 256 at ~44.1kHz gives 128 bins of ~170Hz each
  const levels = [band(0, 3), band(3, 30), band(30, 100)]
  // Compare each band to its slow-moving average, so we react to hits, not to constant bass
  const hits = levels.map((l, i) => {
    avg[i] += (l - avg[i]) * 0.05
    return Math.min(1, Math.max(0, l - avg[i]) * 4)
  })
  return { bass: hits[0], mid: hits[1], high: hits[2], level: band(0, 100) }
}

btn.addEventListener('click', () => {
  if (stream.paused) {
    // Audio graph can only be created after a click (browser autoplay rules)
    if (!analyser) {
      const ac = new AudioContext()
      analyser = ac.createAnalyser()
      analyser.fftSize = 256
      bins = new Uint8Array(analyser.frequencyBinCount)
      ac.createMediaElementSource(stream).connect(analyser).connect(ac.destination)
    }
    analyser.context.resume()
    stream.play()
    btn.textContent = 'stop'
    btn.classList.add('playing')
  } else {
    stream.pause()
    stream.load()   // drop the buffer so the next play is live, not where we left off
    btn.textContent = 'tune in'
    btn.classList.remove('playing')
  }
})


/* ---- Engine ----------------------------------------------------------- */

let genes = EFFECTS.map(() => Math.random() * 0.5)
let prev, last = 0, frame = 0

function resize() {
  canvas.width = Math.ceil(canvas.clientWidth / SCALE)    // size of the on-page screen, set by CSS
  canvas.height = Math.ceil(canvas.clientHeight / SCALE)
  prev = new Uint32Array(canvas.width * canvas.height)
}

// Genes take small random steps; now and then one jumps to a new value
function evolve() {
  genes = genes.map((g) => Math.min(1, Math.max(0, g + (Math.random() - 0.5) * 0.03)))
  if (Math.random() < 1 / 200) genes[Math.floor(Math.random() * genes.length)] = Math.random()
}

function loop(t) {
  requestAnimationFrame(loop)
  if (t - last < FRAME_MS) return
  last = t

  evolve()
  const a = listen()
  const amts = EFFECTS.map(({ react }, i) => Math.min(1, genes[i] + react(a)))
  drawSource(t)
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const px = new Uint32Array(img.data.buffer)   // same memory, viewed as one number per pixel
  EFFECTS.forEach(({ fn }, i) => fn({ px, w: canvas.width, h: canvas.height, amt: amts[i], prev }))
  ctx.putImageData(img, 0, 0)
  prev.set(px)

  if (frame++ % 10 === 0) {
    genesEl.textContent = EFFECTS.map(({ name }, i) => `${name} ${amts[i].toFixed(2)}`).join(' · ')
  }
}

// Self-check: a bright run gets sorted dark-to-light
{
  const px = new Uint32Array([0xffffffff, 0xff808080, 0xffa0a0a0])
  pixelSort({ px, w: 3, h: 1, amt: 1 })
  console.assert(px[0] === 0xff808080 && px[2] === 0xffffffff, 'S-PHANTOM: pixelSort is broken')
}

resize()
addEventListener('resize', resize)
requestAnimationFrame(loop)
