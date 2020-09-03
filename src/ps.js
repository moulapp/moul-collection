import PhotoSwipe from './photoswipe/index'
import PhotoSwipeUI_Default from './photoswipe/ui-default.js'

export default (cid) => {
	let parseThumbnailElements = function (el) {
		let thumbElements = el.childNodes,
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

		// find index of clicked item by looping through all child nodes
		// alternatively, you may define index via data- attribute
		let clickedGallery = clickedListItem.parentNode,
			childNodes = clickedListItem.parentNode.childNodes,
			numChildNodes = childNodes.length,
			nodeIndex = 0,
			index

		for (let i = 0; i < numChildNodes; i++) {
			if (childNodes[i].nodeType !== 1) {
				continue
			}

			if (childNodes[i] === clickedListItem) {
				index = nodeIndex
				break
			}
			nodeIndex++
		}

		if (index >= 0) {
			// open PhotoSwipe if valid index found
			openPhotoSwipe(index, clickedGallery)
		}
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
		galleryElement,
		disableAnimation,
		fromURL
	) {
		let pswpElement = document.querySelectorAll('.pswp')[0],
			gallery,
			options,
			items

		items = parseThumbnailElements(galleryElement, fromURL)

		// define options (if needed)
		options = {
			// define gallery index (for URL)
			galleryUID: galleryElement.parentNode.getAttribute('data-pswp-uid'),

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
			bgOpacity: 0.9,
		}

		// PhotoSwipe opened from URL
		if (fromURL) {
			if (options.galleryPIDs) {
				// parse real index when custom PIDs are used
				// http://photoswipe.com/documentation/faq.html#custom-pid-in-url
				for (let j = 0; j < items.length; j++) {
					if (items[j].photo == index) {
						options.index = j
						break
					}
				}
			} else {
				// in URL indexes start from 1
				options.index = parseInt(index, 10) - 1
			}
		} else {
			options.index = parseInt(index, 10)
		}

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
		// gallery.bg.style.backgroundColor = gallery.currItem.bgColor

		// gallery.listen('beforeChange', () => {
		//   gallery.bg.style.backgroundColor = gallery.currItem.bgColor
		// })
	}

	// loop through all gallery elements and bind events
	let galleryElement = document.querySelector(`#moul`)
	galleryElement.setAttribute('data-pswp-uid', cid)
	galleryElement.onclick = onThumbnailsClick

	// Parse URL and open gallery if it contains #&pid=3&gid=1
	let hashData = photoswipeParseHash()
	if (hashData.photo) {
		let ge = document.querySelector(`#moul`)
		setTimeout(() => {
			openPhotoSwipe(hashData.photo, ge.childNodes[1], true, true)
		}, 150)
	}
}
