importAll(() => {
	$('[f]').each(function() {
		this.classList.add("fragment");
		this.removeAttribute("f");
	});
	$('[fc]').each(function() {
		for (let child of this.children) {
			child.classList.add("fragment");
		}
		this.removeAttribute("f");
	});
	Reveal.initialize({
		hash: true,
		math: {
			mathjax: 'js/MathJax/MathJax.js',
			config: 'TeX-MML-AM_CHTML-full'
		},
		dependencies: [
			{ src: 'js/highlight.js', async: true },
			{ src: 'js/math.js', async: true }
		]
	});
	Reveal.configure({ slideNumber: 'c/t' });
});

let isInFullscreen = false;
$('#fullscreen-button').click(function() {
	const active = () => {
		isInFullscreen = true;
		$('#fullscreen-button').toggleClass("fa-expand");
		$('#fullscreen-button').toggleClass("fa-compress");
	};
	const inactive = () => {
		isInFullscreen = false;
		$('#fullscreen-button').toggleClass("fa-expand");
		$('#fullscreen-button').toggleClass("fa-compress");
	};
	if (isInFullscreen) {
		document.exitFullscreen().then(inactive, active);
	} else {
		document.documentElement.requestFullscreen().then(active, inactive);
	}
});
