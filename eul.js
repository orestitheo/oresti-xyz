const radioStream = document.getElementById('radio-stream')
const radioBtn = document.getElementById('radio-btn')

radioBtn.addEventListener('click', () => {
  if (radioStream.paused) {
    radioStream.play()
    radioBtn.textContent = 'stop'
    radioBtn.classList.add('playing')
  } else {
    radioStream.pause()
    radioStream.load()
    radioBtn.textContent = 'tune in'
    radioBtn.classList.remove('playing')
  }
})
