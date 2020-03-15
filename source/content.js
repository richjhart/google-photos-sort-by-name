window.addEventListener("resize", resize);

var cwiz = document.querySelector("c-wiz.yDSiEe.uGCjIb.zcLWac.eejsDc.xa0xze.Udl2rb");

// dictionary mapping albums urls to the html objects
var allLinks = {};
// dictionary mapping album names to the html objects
var allAlbums = {};
// array of all album names
var allNames = [];
// pixels between the start of each column
var dx = 0;
// pixels between the start of each row
var dy = 0;
// number of columns (1 less than - 0 based)
var cols = 0;
// pixel width of each item
var width = 0;
// pixel height of each item
var height = 0;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// scrolls down a somewhat random amount.
// The idea is to get to the bottom quickly, but still pause regularly to ensure that it starts loading other albums
async function scrollDown() {
	cwiz.scrollBy(
	{
		left: 0,
		top: 1000,
		behavior: 'auto' // jump immediately
	}
	);
	await sleep(20); // very brief pause
	run(); // update the list
}

async function start() {
	// fetch all the initial values
	await resize();
	
	// start scrolling to the bottom
	var scrollTop = cwiz.scrollTop;
	while (true) {
		scrollDown();
		// see if the top changed during the last scrolling (if not, we are already at the bottom)
		if (cwiz.scrollTop == scrollTop) {
			// we've reached the bottom - wait a bit longer to check if anything else loads
			await sleep(2000);
			// scroll again and check for further movement
			scrollDown();
			if (cwiz.scrollTop == scrollTop) {
				// no further movement, assume this is the bottom
				break;
			} // else - more loaded, continue scrolling
		}
		scrollTop = cwiz.scrollTop;
	}
	
	// scroll back to the top
	cwiz.scrollTo(0, 0);
	
	// wait for it to jump back to the top
	await sleep(100);
	run();

	// now listen for scroll events. This is because it will be modifying it as you scroll, this needs to override it
	cwiz.addEventListener("scroll", scroll);

}

// what to do when the user scrolls
function scroll() {
	// currently just update - we should already have all the albums
	run();
}

// what to do when the page resizes
async function resize() {
	// reset all the size related values
	width = 0;
	height = 0;
	dx = 0;
	dy = 0;
	cols = 0;

	await sleep(50);

	// update - which will also trigger calculating the sizes again
	run();
}

function run() {
	// look for all the links to albums
	var links = document.querySelectorAll("a.MTmRkb");
	var newFound = false;
	
	// the current links found - to see if there are new ones, and which ones need adding back in to the page
	var currentLinks = [];
	// the div containing all the objects
	var div;
	// all the row starting points, to work out the difference
	// the first one present may not be at 0, so we need to work out the difference, not use any of the absolute ones
	var dys = [];

	// go through all current objects
	for (var i = 0; i < links.length; i++) {
		// get the div containing all the objects
		if (!div) {
			div = links[i].parentElement;
		}
		// add the URL to the currently shown links
		currentLinks[currentLinks.length] = links[i].href;
		// check if this item has been seen before
		if (!allLinks[links[i].href]) {
			// we have found one - we need to re-sort the list
			newFound = true;
			// save the whole HTML object against the URL
			allLinks[links[i].href] = links[i];
			// get the name of the album
			var name = links[i].querySelector("div.mfQCMe").innerHTML;
			// save the whole HTML object against the Name
			allAlbums[name] = links[i];
			// save the name
			allNames[allNames.length] = name;
		}

		// save the size of the HTML objects
		if (!width) {
			width = links[i].style.width;
		}
		if (!height) {
			height = links[i].style.height;
		}
		
		// get the position of the object
		var translate = getMatrix(links[i].style.webkitTransform);
		// work out the size of the columns
		if (dx == 0 && translate.x > 0) {
			dx = translate.x;
		}
		if (translate.x > 0 && translate.x < dx) {
			dx = translate.x;
		}

		// save all the tops of the rows
		if (!dys.includes(translate.y)) {
			dys[dys.length] = translate.y;	
		}		
		
		// find the number of columns (find the highest column number)
		if (dx > 0) {
			var col = translate.x / dx;
			if (col > cols) {
				cols = col;
			}
		}
	}
	
	// work out the difference between the tops of each row
	if (dy == 0) {
		dys.sort(function(a, b){return a-b});
		dy = dys[1] - dys[0];
	}
	
	// Sort the list of names alphabetically
	if (newFound) {
		allNames.sort();
	}
	
	// position all the HTML objects.
	// Start with the second column of the first row (skipping the add album link)
	var row = 0;
	var col = 1;
	for (var i = 0; i < allNames.length; i++) {
		// check if it's already there, and only add it if not
		var name = allNames[i];
		var node = allAlbums[name];
		var href = node.href;
		if (!currentLinks.includes(href)) {
			div.appendChild(node);
		}
		// Now move it to the right position
		node.style.webkitTransform = "translate3d(" + (col * dx) + "px, " + (row * dy) + "px, 0px)";
		node.style.width = width;
		node.style.height = height;
		// move to the next column, and start the next row if needed
		col++;
		if (col > cols) {
			col = 0;
			row++;
		}
	}
}

// Parse the 3d transform into x, y and z integers
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