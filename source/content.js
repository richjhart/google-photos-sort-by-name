// TODO:

// Update images with the correct size
// When returning from an album, you need to scroll to trigger the refresh
// Can't yet handle resizing

window.addEventListener("resize", resize);

var cwiz = document.querySelector("c-wiz.yDSiEe.uGCjIb.zcLWac.eejsDc.xa0xze.Udl2rb");

var allLinks = {};
var allAlbums = {};
var allNames = [];
var dx = 0;
var dy = 0;
var cols = 0;
var width = 0;
var height = 0;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function start() {
	// fetch all the initial values
	await resize();
	
	var scrollTop = cwiz.scrollTop;
	while (true) {
		cwiz.scrollBy(
		{
			left: 0,
			top: 100,
			behavior: 'auto'
		}
		);
		await sleep(50);
		run();
		if (cwiz.scrollTop == scrollTop) {
			// we've reached the bottom
			break;
		}
		scrollTop = cwiz.scrollTop;
	}
	
	cwiz.scrollTo(0, 0);
	
	await sleep(50);
	run();

	cwiz.addEventListener("scroll", scroll);

}

function scroll() {
	run();
}

async function resize() {
	// console.log("resetting size");
	width = 0;
	height = 0;
	dx = 0;
	dy = 0;
	cols = 0;
	await sleep(50);
	run();
	// console.log("size: (" + width + "," + height + "), offset: (" + dx + "," + dy + "). cols: " + cols);
}

function run() {
	var links = document.querySelectorAll("a.MTmRkb");
	var newFound = false;
	
	var currentLinks = [];
	var div;
	var dys = [];

	for (var i = 0; i < links.length; i++) {
		if (!div) {
			div = links[i].parentElement;
		}
		currentLinks[currentLinks.length] = links[i].href;
		if (!allLinks[links[i].href]) {
			newFound = true;
			allLinks[links[i].href] = links[i];
			// console.log("link: " + links[i].href);
			var name = links[i].querySelector("div.mfQCMe").innerHTML;
			// console.log("name: " + name);
			allAlbums[name] = links[i];
			allNames[allNames.length] = name;
		}
		var translate = getMatrix(links[i].style.webkitTransform);
		if (dx == 0 && translate.x > 0) {
			dx = translate.x;
		}
		if (translate.x > 0 && translate.x < dx) {
			dx = translate.x;
		}

		if (!width) {
			width = links[i].style.width;
		}
		if (!height) {
			height = links[i].style.height;
		}

		if (!dys.includes(translate.y)) {
			dys[dys.length] = translate.y;	
		}		
		
		if (dx > 0) {
			var col = translate.x / dx;
			if (col > cols) {
				cols = col;
			}
		}
	}
	
	if (dy == 0) {
		dys.sort(function(a, b){return a-b});
		dy = dys[1] - dys[0];
	}
	
	if (newFound) {
		allNames.sort();
		//for (var i = 0; i < allNames.length; i++) {
		//	console.log("Name: " + allNames[i]);
		//}
	}
	
	var row = 0;
	var col = 1;
	for (var i = 0; i < allNames.length; i++) {
		// check if it's there
		var name = allNames[i];
		var node = allAlbums[name];
		var href = node.href;
		if (!currentLinks.includes(href)) {
			div.appendChild(node);
		}
		node.style.webkitTransform = "translate3d(" + (col * dx) + "px, " + (row * dy) + "px, 0px)";
		node.style.width = width;
		node.style.height = height;
		col++;
		if (col > cols) {
			col = 0;
			row++;
		}
	}
}

function getMatrix(input) {
    const values = input.split(/\w+\(|\);?/);
    const transform = values[1].split(/,\s?/g);

    return {
      x: parseInt(transform[0]),
      y: parseInt(transform[1]),
      z: parseInt(transform[2])
    };
}

start();