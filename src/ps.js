import PhotoSwipe from './photoswipe/index'
import PhotoSwipeUI_Default from './photoswipe/ui-default.js'

export default (cid) => {
	const allFigure = document.querySelectorAll('.moul-collection figure');
	allFigure.forEach((af, i) => af.setAttribute('data-id', i+1))

	let parseThumbnailElements = function () {
		let thumbElements = allFigure,
			numNodes = thumbElements.length,
			items = [],
			figureEl,
			linkEl,
			size,
			item,
			bgColor

		for (let i = 0; i < numNodes; i++) {
			figureEl = thumbElements[i] // <figure> element

			// include only element nodes
			if (figureEl.nodeType !== 1) {
				continue
			}

			linkEl = figureEl.children[0] // <a> element
			size = linkEl.getAttribute('data-dimension').split('x')
			bgColor = linkEl.getAttribute('data-color')

			// create slide object
			item = {
				src: linkEl.getAttribute('href'),
				w: parseInt(size[0], 10),
				h: parseInt(size[1], 10),
				bgColor,
			}

			if (figureEl.children.length > 1) {
				// <figcaption> content
				item.title = figureEl.children[1].innerHTML
			}

			const msrc = linkEl.getAttribute('data-msrc');
			item.msrc =  msrc ? msrc : linkEl.getAttribute('href')

			item.el = figureEl // save link to element for getThumbBoundsFn
			items.push(item)
		}

		return items
	}

	// find nearest parent element
	let closest = function closest(el, fn) {
		return el && (fn(el) ? el : closest(el.parentNode, fn))
	}

	// triggers when user clicks on thumbnail
	let onThumbnailsClick = function (e) {
		e = e || window.event
		e.preventDefault ? e.preventDefault() : (e.returnValue = false)

		let eTarget = e.target || e.srcElement

		// find root element of slide
		let clickedListItem = closest(eTarget, function (el) {
			return el.tagName && el.tagName.toUpperCase() === 'FIGURE'
		})

		if (!clickedListItem) {
			return
		}

		let index = clickedListItem.getAttribute('data-id')
		openPhotoSwipe(index)
		
		return false
	}

	// parse picture index and gallery index from URL (#&pid=1&gid=2)
	let photoswipeParseHash = () => {
		let hash = window.location.hash.substring(1),
			params = {}

		if (hash.length < 5) {
			return params
		}

        let vars = hash.split('/')
        params[vars[0]] = vars[1]

		return params
	}

	let openPhotoSwipe = function (
		index,
		disableAnimation = false,
		fromURL
	) {
		let pswpElement = document.querySelectorAll('.pswp')[0],
			gallery,
			options

		let items = parseThumbnailElements()

		// define options (if needed)
		options = {
			getThumbBoundsFn: function (index) {
				// See Options -> getThumbBoundsFn section of documentation for more info
				let thumbnail = items[index].el.getElementsByTagName('a')[0]
						.children[0], // find thumbnail
					pageYScroll =
						window.pageYOffset || document.documentElement.scrollTop,
					rect = thumbnail.getBoundingClientRect()

				return { x: rect.left, y: rect.top + pageYScroll, w: rect.width }
			},

			shareEl: false,
			fullscreenEl: false,
			zoomEl: false,
			closeEl: false,
			arrowEl: false,
			counterEl: false,
			bgOpacity: 1,
		}
		options.index = parseInt(index, 10) - 1

		// exit if index not found
		if (isNaN(options.index)) {
			return
		}

		if (disableAnimation) {
			options.showAnimationDuration = 0
		}

		// Pass data to PhotoSwipe and initialize it
		gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options)
		gallery.init()
	}

	let galleryElement = document.querySelectorAll('.moul-collection')
	galleryElement.forEach(ge => {
		ge.onclick = onThumbnailsClick
	})

	let hashData = photoswipeParseHash()
	if (hashData.photo) {
		let ge = document.querySelector('.moul-collection')
		setTimeout(() => {
			openPhotoSwipe(hashData.photo, true, true)
		}, 150)
	}
}
