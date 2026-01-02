window.addEventListener('DOMContentLoaded', () => {
	// Initialize Lucide icons
	lucide.createIcons()

	// const footerYear = document.querySelector('.footer__year')
	const navMobile = document.querySelector('.mobile-nav')
	const navBtn = document.querySelector('.hamburger')

	// const handleCurrentYear = () => {
	// 	const year = new Date().getFullYear()
	// 	footerYear.innerText = year
	// }
	// handleCurrentYear()

	const handleNav = () => {
		navBtn.classList.toggle('is-active')
		navMobile.classList.toggle('mobile-nav--active')
		navMobile.classList.toggle('active')
		document.body.classList.toggle('sticky-body')
	}
	const removeStickyBody = () => {
		document.body.classList.remove('sticky-body')
		navMobile.classList.remove('active')
		navMobile.classList.remove('mobile-nav--active')
		navBtn.classList.remove('is-active')
	}
	navBtn.addEventListener('click', handleNav)
	navMobile.addEventListener('click', removeStickyBody)

	const subHeaders = [
		'Logo mojej strony. Slash (/) i backslash (\\). Mały przypadek twórczy ; )',
		'Podstawowe informacje o moich usługach.',
		'Proces twórczy, który stoi za każdym unikalnym projektem.',
		'Moje usługi i ceny.',
		'Napisz, zadzwoń. Chętnie porozmawiam.',
		'Mój e-mail. Odpisuję w ciągu 24 godzin.',
		'Zadzwoń. Chętnie porozmawiam.',
	]
	const items = document.querySelectorAll('#item-0, #item-1, #item-2, #item-3, #item-4, #item-5, #item-6')
	const placeholder = document.querySelector('.placeholder')
	const subheader = document.querySelector('#subheader')

	function changeColors() {
		gsap.to('.hero', { backgroundColor: '#000', duration: 0.5 })
		gsap.to('.placeholder, nav, .logo, .nav-link, #subheader, .hero-cta a', { color: '#fff', duration: 0.5 })
	}
	function revertColors() {
		gsap.to('.hero', { backgroundColor: '#e3e3e3', duration: 0.5 })
		gsap.to('.placeholder, nav, .logo, .nav-link, #subheader, .hero-cta a', { color: '#000', duration: 0.5 })
	}
	items.forEach(item => {
		item.addEventListener('mouseover', changeColors)
		item.addEventListener('mouseout', revertColors)
	})
	function animateScale(element, scaleValue) {
		gsap.fromTo(element, { scale: 1 }, { scale: scaleValue, duration: 2, ease: 'power1.out' })
	}
	items.forEach(item => {
		item.addEventListener('mouseover', changeColors)
		item.addEventListener('mouseout', revertColors)
	})
	function animateScale(element, scaleValue) {
		gsap.fromTo(element, { scale: 1 }, { scale: scaleValue, duration: 2, ease: 'power1.out' })
	}
	function wrapLetters(text) {
		placeholder.innerHTML = ''
		;[...text].forEach(letter => {
			const span = document.createElement('span')
			span.style.filter = 'blur(8px)'
			span.textContent = letter
			placeholder.appendChild(span)
		})
	}
	function animateBlurEffect() {
		const letters = placeholder.children
		let index = 0

		function clearNextLetter() {
			if (index < letters.length) {
				gsap.to(letters[index], { filter: 'blur(0px)', duration: 0.5 })
				index++
				if (index < letters.length) {
					setTimeout(clearNextLetter, 100)
				}
			}
		}
		setTimeout(clearNextLetter, 0)
	}
	function shuffleLetters(finalText) {
		wrapLetters('')
		wrapLetters(finalText.replace(/./g, ' '))

		let textArray = finalText.split('')
		let shufflingCounter = 0
		let intervalHandles = []

		function shuffle(index) {
			if (shufflingCounter < 30) {
				textArray[index] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
				placeholder.children[index].textContent = textArray[index]
			} else {
				placeholder.children[index].textContent = finalText.charAt(index)
				clearInterval(intervalHandles[index])
			}
		}
		for (let i = 0; i < finalText.length; i++) {
			intervalHandles[i] = setInterval(shuffle, 20, i)
		}
		setTimeout(() => {
			shufflingCounter = 30
			for (let i = 0; i < finalText.length; i++) {
				placeholder.children[i].textContent = finalText.charAt(i)
				clearInterval(intervalHandles[i])
			}
			animateBlurEffect()
		}, 1000)
	}
	function updatePlaceholderText(event) {
		const newText = event.target.textContent
		const itemIndex = Array.from(items).indexOf(event.target)
		const newSubHeaderText = subHeaders[itemIndex]

		subheader.textContent = newSubHeaderText
		animateScale(placeholder, 1.25)
		// animateScale(subheader, 2)
		shuffleLetters(newText)
	}
	function resetPlaceholderText() {
		const defaultText = '\\/\\/ /\\/'
		const defaultSubHeaderText = 'Front-end web developer. Twórca stron internetowych.'

		subheader.textContent = defaultSubHeaderText
		animateScale(placeholder, 1.25)
		// animateScale(subheader, 2)
		shuffleLetters(defaultText)
	}
	items.forEach(item => {
		item.addEventListener('mouseover', updatePlaceholderText)
		item.addEventListener('mouseout', resetPlaceholderText)
	})

	// cookie alert
	const cookieBox = document.querySelector('.cookie-box')
	const cookieBtn = document.querySelector('.cookie-btn')

	const showCookie = () => {
		const cookieEaten = localStorage.getItem('cookie')
		if (cookieEaten) {
			cookieBox.classList.add('hide')
		}
	}

	const handleCookieBox = () => {
		localStorage.setItem('cookie', 'true')
		cookieBox.classList.add('hide')
	}

	cookieBtn.addEventListener('click', handleCookieBox)
	showCookie()
})
