export function scrollToHref(e) {
  e.preventDefault()
  document.querySelector(e.target.getAttribute('href')).scrollIntoView({
    behavior: this.$store.getters.mobile ? 'smooth' : 'auto'
  })
}
