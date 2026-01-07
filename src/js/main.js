window.addEventListener('DOMContentLoaded', () => {
	// Initialize Lenis
	const lenis = new Lenis()

	// Use requestAnimationFrame to continuously update the scroll
	function raf(time) {
		lenis.raf(time)
		requestAnimationFrame(raf)
	}

	requestAnimationFrame(raf)

	// nav
	const navMobile = document.querySelector('.mobile-nav')
	const navLogo = document.querySelector('.logo')
	const navBtn = document.querySelector('.hamburger')

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
	navLogo.addEventListener('click', handleNav)
	navLogo.addEventListener('click', removeStickyBody)

	// hero animation
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
		gsap.to('.hero', {
			background: 'radial-gradient(circle at center, #092b27 0%, #000000 65%)',
			duration: 0.5,
		})
		gsap.to('.placeholder, nav, .logo, .nav-link, #subheader, .hero-cta a', { color: '#fff', duration: 0.5 })
		// gsap.to('.nav-links', { backgroundColor: '#b8babeff', duration: 0.5 })
	}
	function revertColors() {
		gsap.to('.hero', { background: '#b8babe', duration: 0.5 })
		gsap.to('.placeholder, nav, .logo, .nav-link, #subheader, .hero-cta a', { color: '#000', duration: 0.5 })
		// gsap.to('.nav-links', { backgroundColor: '#b8babe', duration: 0.5 })
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

	function updatePlaceholderText(event) {
		const itemIndex = Array.from(items).indexOf(event.target)
		const newSubHeaderText = subHeaders[itemIndex]

		subheader.textContent = newSubHeaderText
		animateScale(placeholder, 1.25)
	}

	function resetPlaceholderText() {
		const defaultSubHeaderText = 'Tworzę nowoczesne strony internetowe, które wyróżniają marki i działają biznesowo.'
		subheader.textContent = defaultSubHeaderText
		animateScale(placeholder, 1.25)
		// animateScale(subheader, 2)
	}

	items.forEach(item => {
		item.addEventListener('mouseover', updatePlaceholderText)
		item.addEventListener('mouseout', resetPlaceholderText)
	})

	function wrapLetters(text) {
		placeholder.innerHTML = ''
		;[...text].forEach(letter => {
			const span = document.createElement('span')
			span.textContent = letter
			span.style.filter = 'blur(8px)'
			placeholder.appendChild(span)
		})
	}

	let tl = null

	const RANDOM_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	function playShuffle(text) {
		// twardy reset poprzedniej animacji
		if (tl) {
			tl.kill()
			tl = null
		}

		wrapLetters(text)

		const letters = [...placeholder.children]

		tl = gsap.timeline()

		// FAZA 1 — losowanie znaków (GSAP jako clock)
		tl.to(
			{},
			{
				duration: 0.01,
				repeat: 60,
				onRepeat: () => {
					letters.forEach(span => {
						span.textContent = RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)]
					})
				},
			}
		)

		// FAZA 2 — ustaw właściwy tekst
		tl.add(() => {
			letters.forEach((span, i) => {
				span.textContent = text[i]
			})
		})

		// FAZA 3 — blur schodzi sekwencyjnie (wcześnie)
		tl.to(
			letters,
			{
				filter: 'blur(0px)',
				duration: 0.5,
				stagger: 0.1,
				ease: 'power1.out',
			},
			'>' // ⬅️ start praktycznie od początku
		)
	}

	const DEFAULT_TEXT = '\\/\\/ /\\/'

	function resetShuffle() {
		if (tl) {
			tl.kill()
			tl = null
		}

		wrapLetters(DEFAULT_TEXT)

		const letters = [...placeholder.children]

		tl = gsap.timeline()

		// FAZA 1 — losowanie znaków (GSAP jako clock)
		tl.to(
			{},
			{
				duration: 0.01,
				repeat: 60,
				onRepeat: () => {
					letters.forEach(span => {
						span.textContent = RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)]
					})
				},
			}
		)

		// FAZA 2 — ustaw właściwy tekst
		tl.add(() => {
			letters.forEach((span, i) => {
				span.textContent = DEFAULT_TEXT[i]
			})
		})

		// FAZA 3 — blur schodzi sekwencyjnie (wcześnie)
		tl.to(
			letters,
			{
				filter: 'blur(0px)',
				duration: 0.3,
				stagger: 0.06,
				ease: 'power1.out',
			},
			'>' // ⬅️ start praktycznie od początku
		)

		// gsap.set(placeholder.children, { filter: 'blur(0px)' })
	}

	items.forEach(item => {
		item.addEventListener('mouseenter', e => {
			playShuffle(e.target.textContent)
		})

		item.addEventListener('mouseleave', e => {
			resetShuffle(e.target.textContent)
		})
	})

	// timeline items animation
	const itemz = document.querySelectorAll('.timeline-item')

	const observer = new IntersectionObserver(
		entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('show')
				}
			})
		},
		{ threshold: 0.2 }
	)

	itemz.forEach(item => observer.observe(item))

	// form
	const msgStatus = document.querySelector('.msg-status')

	console.log(document.location.search)

	if (document.location.search === '?mail_status=sent') {
		msgStatus.classList.add('success')
		msgStatus.textContent = 'Dziękuję za wiadomość, odezwę się wkrótce!'

		setTimeout(() => {
			msgStatus.classList.remove('success')
		}, 4000)
	}
	if (document.location.search === '?mail_status=error') {
		msgStatus.classList.add('error')
		msgStatus.textContent = 'Nie udało się wysłać wiadomości, spróbuj ponownie!'

		setTimeout(() => {
			msgStatus.classList.remove('error')
		}, 4000)
	}

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

	// const cards = document.querySelectorAll('.offer-card')

	// const offerObserver = new IntersectionObserver(
	// 	entries => {
	// 		entries.forEach(entry => {
	// 			if (entry.isIntersecting) {
	// 				entry.target.classList.add('visible')
	// 			}
	// 		})
	// 	},
	// 	{ threshold: 0.2 }
	// )

	// cards.forEach(card => offerObserver.observe(card))

	// footer
	// Aktualny rok
	document.getElementById('year').textContent = new Date().getFullYear()

	// Scroll do góry
	document.querySelector('.to-top').addEventListener('click', () => {
		window.scrollTo({ top: 0, behavior: 'smooth' })
	})
})
