// Footer year — runs once, no event needed
document.getElementById('year').textContent = new Date().getFullYear()

// Active nav state — IntersectionObserver watches each section and
// sets aria-current="page" on the matching nav link as you scroll.
// No scroll listener = no jank.
const sections = document.querySelectorAll('section[data-section]')
const navLinks = document.querySelectorAll('nav a[href^="#"]')

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      const id = entry.target.dataset.section
      navLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${id}`
        if (isActive) {
          link.setAttribute('aria-current', 'page')
        } else {
          link.removeAttribute('aria-current')
        }
      })
    })
  },
  {
    // Trigger when the section occupies the middle 40% of the viewport.
    // rootMargin shrinks the detection zone so shallow sections don't
    // fight each other at the edges.
    rootMargin: '-30% 0px -30% 0px',
    threshold: 0,
  }
)

sections.forEach((section) => observer.observe(section))
