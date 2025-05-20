function ready(a) {
	"loading" != document.readyState ? a() : document.addEventListener("DOMContentLoaded", a);
}

ready(function () {

	/*
	[
    {
        "sentence": "A smiling businessman shaking hands with a colleague",
        "tags": [
            "businessman",
            "handshake",
            "colleague",
            "business",
            "agreement"
        ]
    },*/
	fetch('./stockimages.json')
	.then(response => {
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		return response.json();  
	})
	.then(json => {
		console.log('len'+json.length+' '+json[0]['sentence']);

		imagesArray = json;//JSON.parse(json); 
		//document.getElementById('countmsg').innerHTML=" with "+imagesArray.length+" images";
		createGallery(imagesArray);
		//addDropdownFilters(imagesArray);
		addSearchListener();
		setResetButton();
		addModalListeners();
		showLoader(false);
	}) 
	.catch(error => console.error('Failed to fetch data:', error)); 

});

const searchGallery = document.getElementById('searchGallery');
const searchInput = document.getElementById('searchInput');
const searchGalModal = document.getElementById("searchGalModal");

let delay = 0;
let maximages=4;

//-------------------- Gallery Creation ----------------------//
function createGallery(imagesArray) {
	searchGallery.innerHTML = '';
	// On startup pick a random image
	pick=Math.floor(Math.random() * imagesArray.length);

	e=imagesArray[pick];
	oldsentence=e['sentence'];
	e['sentence']=e['sentence']+'  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>Random image chosen</b>';
	searchGallery.insertAdjacentHTML('beforeend', createImageElement(e));
	e['sentence']=oldsentence;

	showLoader(false);
	delay = 0;
}

const createImageElement = (item) => {
	// Item indexes are based on their column location in the CSV file
	const html = generateImageHTML(item['image'].split(","), item['sentence'], item['tags']);//, item[3], item[4].split(","));
	delay += 100;
	return html;
}

// Actually create the HTML for a given stock image
function generateImageHTML(images, desc, tags) {
	return `
		<div  class="search-gallery__gallery__element" style="animation-delay: ${delay}ms">
			${generateGalleryIcon(images)}
			<div class="search-gallery__gallery__element__image"><img src="${images[0]}" /></div>
			<div class="search-gallery__gallery__element__description">${desc}</div>
			<div class="search-gallery__gallery__element__description__types">
				${returnTags(tags)}
			</div>
		</div>
	`;
}

// Generate the tags for the stock image
const returnTags = (tags) => {//}, className) => {
	//console.log(type);
	var str='';
	for (ii=0; ii<tags.length; ii++) {
		tag=tags[ii];

		if (ii%2==0)
			className='primary';
		else
		    className='secondary';
		str+= `<div class="search-gallery__gallery__element__description__types__type ${className}"><span>${tag}</span></div>`;
	}
	return str;

}

const generateGalleryIcon = (images) => {
	let html = '';
	if (images.length > 1) {
		html = `
			<i class="search-gallery__gallery__element__icon fa fa-image">Gallery</i>
		`;
	}
	return html;
}


//-------------------- Search ----------------------//
function addSearchListener() {
	searchInput.addEventListener('keyup', getUserInput);
}

function getUserInput() {
	showLoader(true);
	const userInput = searchInput.value;
	searchImageArray(userInput.toLowerCase().split(" "));
}

// GL Just search based up on what entered
function searchImageArray(searchTermArray){//}, searchDropdowns = false) {
	searchGallery.innerHTML = '';
	let results = false;

	// List search in order of the most matches
	foundimages={};
	for (k=0; k<imagesArray.length; k++) {
		item=imagesArray[k];
		const somethingFound = findMatch(item, searchTermArray);//, searchDropdowns);
		if(somethingFound>0) {

			results = true;
			foundimages[k]=somethingFound;
			//searchGallery.insertAdjacentHTML('beforeend', createImageElement(item));
		}
	}
	var items = Object.keys(foundimages).map(function(key) {
		return [key, foundimages[key]];
	});
	//console.log("ite"+items);
	items.sort(function(first, second) {
		return second[1] - first[1];
	});
	// Only list maximages amount of images
	cnt=0;
	for (ind of items) {
		//console.log("in"+ind[0]);
		if (cnt<maximages) {
			item=imagesArray[ind[0]];
			searchGallery.insertAdjacentHTML('beforeend', createImageElement(item));
		}
		cnt++;
	}
	if (!results) { 
		showNoResults(); 
	}
	delay = 0;
	showLoader(false);
}

function showNoResults() {
	//<img style="width:300px; justify-content:center !important;" src="https://image.shutterstock.com/image-vector/no-image-available-vector-illustration-600w-744886198.jpg" alt="Avatar" class="career-path__courses__course-item__image image" style="width:100%">
	searchGallery.innerHTML =  `<div style="width:100%; margin-left:auto; margin-right:auto; justify-content:center !important; text-align:center; font-size:24px; margin-bottom:-28px;"><h1>No Results Found</h1></div>`;
}

const findMatch = (item, searchTermArray, searchDropdowns) => {
	let matchFound = 0;//false;
	itemlist=[];
	itemlist.push(item['sentence']);
	for (tag in item['tags'])
		itemlist.push(item['tags'][tag]);
	// If get count of matches and submatches for the stock image 'item' given the search terms entered
	for (let i = 0; i < itemlist.length; i++) {

		// Count exact matches
		for (j=0; j<searchTermArray.length; j++) {
			//console.log('mmm'+itemlist[i].toLowerCase()+' '+searchTermArray[j].toLowerCase());
			if (itemlist[i].toLowerCase()==searchTermArray[j].toLowerCase() ) {//} && !searchDropdowns) {
				matchFound++;
			}
		}
		// Count submatches
		for (j=0; j<searchTermArray.length; j++) {
			if (itemlist[i].toLowerCase().indexOf(searchTermArray[j].toLowerCase()) !== -1) {//} && !searchDropdowns) {
				matchFound++;
			}
		}
		
	}

	return matchFound;
}


//-------------------- Slideshow -----------------------//
// These are redundant
const generateSlideshowSlides = (images) => {
	let slideshowHTML = `<div class="search-gallery__modal__slideshow">${generateSlideshowControls(images)}`;
	images.forEach((image, i) => {
		slideshowHTML += generateSlide(image, i);
	});
	slideshowHTML += '</div>';
	return slideshowHTML;
}

function addSlideshowControls(images) {
	if (images.length > 1) {
		const slideShowArrows = Array.prototype.slice.call(document.querySelectorAll('.search-gallery__modal__slideshow__arrows__arrow'));
		slideShowArrows.forEach((arrow, i) => {
			arrow.addEventListener('click', function () {
				prevOrNextImage(i);
			});
		})
	}
}

function prevOrNextImage(i) {
	const slides = Array.prototype.slice.call(document.querySelectorAll('.search-gallery__modal__slideshow__slide'));
	if (i === 0) {
		findPrevOrNextSlide(slides, 'previous');
	}
	else {
		findPrevOrNextSlide(slides, 'next');
	}
}

function findPrevOrNextSlide(slides, prevOrNext) {
	for (let i = 0; i < slides.length; i++) {
		let slide = slides[i];
		if (slide.classList.contains('show')) {
			const currentSlideIndex = parseInt(slide.getAttribute("data-slide"));
			slide.classList.remove('show');
			slide.classList.add('hidden');
			if (prevOrNext === 'previous') { previousSlide(currentSlideIndex, slides.length, prevOrNext); }
			if (prevOrNext === 'next') { nextSlide(currentSlideIndex, slides.length, prevOrNext); }
			break;
		} 
	}
}

function previousSlide(currentSlideIndex, numOfSlides) {
		let index = currentSlideIndex - 1;
		if (index === -1) { index = numOfSlides - 1; }
		showSlide(document.querySelector(`[data-slide="${index}"]`), index, numOfSlides)
}

function nextSlide(currentSlideIndex, numOfSlides) {
		let index = currentSlideIndex + 1;
		if (index === numOfSlides) { index = 0; }
		showSlide(document.querySelector(`[data-slide="${index}"]`), index, numOfSlides)
}

function showSlide(slide, index, numOfSlides) {
	slide.classList.remove('hidden');
	slide.classList.add('show');
	// console.log(index, numOfSlides);
	document.getElementById('galleryCount').innerHTML = `${index + 1}/${numOfSlides}`;
}


const generateSlide = (image, i) => {
	return `
		<div class="search-gallery__modal__slideshow__slide ${showFirstSlide(i)}" data-slide="${i}">
			<img src="${image}" />
		</div>
	`;
}

const generateSlideshowControls = (images) => {
	let controlsHTML = '';
	if (images.length > 1) {
		controlsHTML = `
			<div class="search-gallery__modal__slideshow__count" id="galleryCount">1/${images.length}</div>
			<div class="search-gallery__modal__slideshow__arrows">
				<div class="search-gallery__modal__slideshow__arrows__arrow">&#10094;</div>
				<div class="search-gallery__modal__slideshow__arrows__arrow">&#10095;</div>
			</div>
		`;
	}
	return controlsHTML;
}

const showFirstSlide = (i) => {
	if (i === 0) {
		return 'show';
	}
	else {
		return 'hidden';
	}
}

//-------------------- Reset ----------------------//
function setResetButton() {
	const resetButton = document.getElementById('reset');
	resetButton.addEventListener('click', resetValues);
}

function resetValues() {
	Array.prototype.slice.call(document.querySelectorAll('.search-gallery__search__dropdowns__filter')).forEach(dropdown => {
		dropdown.selectedIndex = 0;
	})
	document.getElementById("searchInput").value = '';
	createGallery(imagesArray);
}

//-------------------- Ajax ----------------------//
function ajax_getImageData() {
	var request = new XMLHttpRequest();
	request.open("POST", "../../php/functions.php", true);
	request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	request.send("");
	request.onload = function () {
		if (request.status >= 200 && request.status < 400) {
			//Success! Now iterate through data
			var data = request.responseText;
			const promoArray = JSON.parse(data);
			imagesArray = promoArray; //For Searching
			createGallery(imagesArray);
			addDropdownFilters(imagesArray);
		} else {
			// We reached our target server, but it returned an error
		}
	};
	request.onerror = function () {
		// There was a connection error of some sort
	};
}

function help_transformURL() {
	var scriptLocation = new Object();
	scriptLocation.location = "./php/functions.php";
	var scriptURL = scriptLocation.location;
	return scriptURL;
}

//-------------------- Helpers ----------------------//
//For when you need to show/hide the loader on the page
function showLoader(trueOrFalse) {
	if (trueOrFalse == true) {
		searchGallery.style.display = "none";
		document.getElementById("loader").style.display = "flex";
	} else {
		searchGallery.style.display = "flex";
		document.getElementById("loader").style.display = "none";
	}
}

if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function (s) {
		var el = this;

		do {
			if (el.matches(s)) return el;
			el = el.parentElement || el.parentNode;
		} while (el !== null && el.nodeType === 1);
		return null;
	};
}
