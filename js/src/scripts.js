function ready(a) {
	"loading" != document.readyState ? a() : document.addEventListener("DOMContentLoaded", a);
}

ready(function () {
	// *************** uncomment ajax if you want to us CSV file instead of the array ***************
	// ajax_getImageData();
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
	 // $.getJSON("images/stockimages.json", function(json) {
	  //  fr = new FileReader();
      //  fr.onload = receivedText;
      //  fr.readAsText(".images/stockimages.json");
      //  json= require(".images/stockimages.json"); 
		

    //});
});


    /*

function receivedText(e) {
        let json = e.target.result;
   	    console.log(json); // this will show the info it in firebug console
        imagesArray = JSON.parse(json); 
		createGallery(imagesArray);
		addDropdownFilters(imagesArray);
		addSearchListener();
		setResetButton();
		addModalListeners();
		showLoader(false);
}*/

const searchGallery = document.getElementById('searchGallery');
const searchInput = document.getElementById('searchInput');
const searchGalModal = document.getElementById("searchGalModal");
// *************** Change to where your images are located ***************
//const imagePath = 'images/'; //https://via.placeholder.com/';
let delay = 0;
let maximages=4;

// *************** uncomment if using CSV file ***************
// let imagesArray

//-------------------- Gallery Creation ----------------------//
function createGallery(imagesArray) {
	searchGallery.innerHTML = '';
	pick=Math.floor(Math.random() * imagesArray.length);
	//for (i=0; i<imagesArray.length; i++) {
		//imagesArray.forEach(function (e) {
		//if (i<maximages) {
	e=imagesArray[pick];
	oldsentence=e['sentence'];
	e['sentence']=e['sentence']+'  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>Random image chosen</b>';
	searchGallery.insertAdjacentHTML('beforeend', createImageElement(e));
	e['sentence']=oldsentence;
		//}
		//});
	//}
	showLoader(false);
	delay = 0;
}

const createImageElement = (item) => {
	// Item indexes are based on their column location in the CSV file
	const html = generateImageHTML(item['image'].split(","), item['sentence'], item['tags']);//, item[3], item[4].split(","));
	//const html = generateImageHTML(item[0].split(","), item[1], item[2].split(","));//, item[3], item[4].split(","));
	delay += 100;
	return html;
}

//function generateImageHTML(type, subType, title, description, images) {
function generateImageHTML(images, desc, tags) {
	//		<!--<div class="search-gallery__gallery__element__title"><h3>${title}</h3></div>-->
	//			<!--${returnType(type, 'primary')}
	//			${returnType(subType, 'secondary')}-->
	//onclick="generateModal('${tags}', '${desc}', '${images}')"
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
	
	foundimages={};
	for (k=0; k<imagesArray.length; k++) {
	//imagesArray.forEach(item => {
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
	//foundimages={};
	for (let i = 0; i < itemlist.length; i++) {

		for (j=0; j<searchTermArray.length; j++) {
			//console.log('mmm'+itemlist[i].toLowerCase()+' '+searchTermArray[j].toLowerCase());
			if (itemlist[i].toLowerCase()==searchTermArray[j].toLowerCase() ) {//} && !searchDropdowns) {
				matchFound++;
			}
		}		
		for (j=0; j<searchTermArray.length; j++) {
			if (itemlist[i].toLowerCase().indexOf(searchTermArray[j].toLowerCase()) !== -1) {//} && !searchDropdowns) {
				matchFound++;
				/*keysi=Object.keys(foundimages);
				if (!(i in keysi))
					foundimages[i]=1;
				else
					foundimages[i]++;*/
				//break;
			}
		}
		
	}
	/*var items = Object.keys(foundimages).map(function(key) {
		return [key, list[key]];
	});
	items.sort(function(first, second) {
		return second[1] - first[1];
	});*/

	//Object.keys(
	return matchFound;
}

//-------------------- Modal ----------------------//
/*function generateModal(title, description, images) {
	showModal();
	searchGalModal.innerHTML = generateModalHTML(title, description, images.split(","));
	addSlideshowControls(images.split(","));
}

const generateModalHTML = (title, description, images) => {
	return `
		<div class="search-gallery__modal__close" onClick="closeModal()">
			<div class="search-gallery__modal__close__close-button">Close</div>
		</div>
		<span class="search-gallery__modal__title">${title}</span>
		${generateSlideshowSlides(images)}
		<div class="search-gallery__modal__description">${description}</div>
	`;
}

function addModalListeners() {
	document.addEventListener('mouseup', function(e) {
		if (!searchGalModal.contains(e.target)) {
			closeModal();
		}
	});
	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			closeModal();
		}
	  })
}


function closeModal() {
	searchGalModal.classList.remove("showModal");
	searchGalModal.classList.add("hidden");
}

function showModal() {
	searchGalModal.innerHTML = '';
	searchGalModal.classList.remove("hidden");
	searchGalModal.classList.add("showModal");
}*/

//-------------------- Slideshow -----------------------//

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
