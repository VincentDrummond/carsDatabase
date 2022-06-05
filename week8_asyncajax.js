/*
***************************************
ASYNC & AJAX

JS runtime:
	is single-threaded (can only do one thing at a time)
	orders work in a stack
	each function runs in own environment
		if F calls another F, the caller pauses to run the callee
	image processing, network requests etc
		take a long time so page gets stuck

	so some events get given to web browser (web API) to process
		event handlers, timeout, clicks etc
		results returned when JS main stack is clear

	eg.	console.log(1)
		setTimeout(() => {console.log(2)}), 0)
		console.log(3)

		will return 1, 3, 2

in summary:
	1. browser puts jobs on stack
	2. finds event that uses web API
	3. puts it on web API stack
	4. web API does its work
	4. web API puts complete jobs in message Q
	5. browser completes stack
	6. event loop watches and reads message Q
	7. passes web API events from message Q to browser
	8. browser completes web API event


***************************************
CONTROLLING CHAOS

calls to APIs may not return result when you need it
	results in undefined or crash

1. CALLBACKS (oldest way)
	pass a function to a call so that it executes it once it is done

2. PROMISES (old way)


3. AYSNC/AWAIT (do it this new way)
	1. async keyword goes before function keyword
		and makes function return a promise
*/

/*
async function myFunc() {
	return ("this returns a resolved promise");
};
	myFunc().then(alert);

function myFunc2() {
	return Promise.resolve("this returns an explicitly resolved promise");
}
	myFunc2().then(alert);

/*
	2. await keyword pauses async fuction execution
		and waits for promise to resolve before returning
		then continues exectuing function */

/*
	async function func3() {
	let promise = new Promise((resolve, reject) => {
		setTimeout(() => resolve('done!'), 3000)
	});

	let result = await promise; // pauses here and waits for promise to resolve
	console.log('result', result);
};

func3();
*/


/*
	3. can only use INSIDE async function

	4. takes a try catch block - if try fails, catch handles the error

	5. TOP LEVEL AWAIT
		if js code is type="module"
		then the module is one big async function
		no need to use async keyword
*/


/**********************************
EXAMPLE OF API CALL AND DISPLAY
**********************************/

// grab html element
const listNode = document.getElementById('cars');
const reloadBtn = document.getElementById('reload');
const messageDisplay = document.getElementById('messages');
const carForm = document.forms['car-form']; // WHY IS THIS AN ARRAY??

//store endpoint in a variable
const API_ENDPOINT = 'https://carsapp2050.herokuapp.com/api/v1/cars/';

//	reload button runs the getCars function
reloadBtn.addEventListener('click', () => {
	getCars();
})

carForm.addEventListener('submit', (e) => {
	e.preventDefault();

	const formData = new FormData(carForm);
	const data = Object.fromEntries(formData);
	data.bhp = Number[data.bhp];
	addCar(data);
});

async function addCar(carData) {
try{
	const response = await fetch( "https://carsapp2050.herokuapp.com/api/v1/cars/", {
			method: "POST",
			headers: {
	"Content-Type": "application/json"
	}, // FIGURE OUT WHAT THE HECK THIS DOES, RESEARCH HEADERS I SUPPOSE?

	body: JSON.stringify(carData),
});

	if (!response.ok) {
		throw response;
	}

	const data = await response.json();

	// Put the data into the UI
	const li = createCar(data);
	listNode.prepend(li);

	} catch (err) {
	console.log(err);
	};
};

async function createCar({avatar_url, bhp, name, _id}) {
//	make an li		
const li = document.createElement('li');
li.id = _id;
//	make an image
const img = document.createElement('img');
img.src = avatar_url;
img.alt = name;
img.width = 100;
img.style.borderRadius = '50%';

//	add image to the li
li.append(img);

//	make a span, and chnge it's content
const span = document.createElement('span');
span.textContent = `${name} (bhp: ${bhp})`;
li.append(span)

//	add a delete button
const deleteBtn = document.createElement('button');
deleteBtn.classList.add('delete', 'btn', 'btn-danger');
deleteBtn.textContent = 'Delete';
//	add the ID of the car to the delete button
deleteBtn.dataset.id = _id
li.append(deleteBtn);

return li;
}



/**********************************/
// GET CARS FUNCTION
async function getCars() {

//	show a spinner until function resolves
	listNode.innerHTML = 
	`<div class="spinner-border text-primary" role="status">
	<span class="sr-only">Loading...</span>
	</div>`
// try getting the API
try {
	const response = await fetch(API_ENDPOINT);

// check response is ok, if not, stop here & throw it to the catch
	if(!response.ok) throw repsonse;

//	take the response (as json) and parse it to make a JS obj
	const data = await response.json();

//	pass the data to the renderCars function
	renderCars(data);

// if response errors, then show error
	} 	catch (err) {
		console.log(err)
	}
}

/**********************************/
// DELETE FUNCTION

async function deleteCar(id) {
try {
	const response = await fetch(`https://carsapp2050.herokuapp.com/api/v1/cars/${id}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json"
			},
	});

	if (!response.ok) {
		throw response;
	}
//	update the UI
	document.getElementById(id).remove();



	} catch (err) {
	console.log(err);
// show the user that an error occurred show
	messageDisplay.textContent = `Could not delete car of ID: ${id}`;
	}
};


listNode.addEventListener('click', (e) => {
	const {target} = e;
//	if the thing that was clicked matches a button with a class of delete
	if (target.matches('button.delete')) {
		const {id} = target.dataset;
		console.log(id);

		deleteCar(id);
}});


/**********************************/
// RENDER FUNCTION

//	pass parameters: data as an empty array
function renderCars(cars=[], mountNode = listNode) {
	console.log(cars);

	const fragment = document.createDocumentFragment(); // X (see below)

//	loop over tasks, and make an li for each one 
//	this is now inside the createCar function
	for (const car of cars) {
		const li = createCar(car)

//	add li to the fragment
		fragment.append(li);
	}
// 	append fragment to the DOM (into the element declared above)
	mountNode.replaceChildren(fragment);
}
//	 run the functions
getCars();

/*
X
Document Fragment
1. DOM Node but NOT part of DOM tree

Append elements to the fragment, then append fragment to DOM tree
Allows for better performance as does not cause page refresh
Fragment is a lightweight version of the document

Can also use new DocumentFragment(); constructor
*/