// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
	// Get all dropdown items
	var dropdownItems = document.querySelectorAll('.dropdown-item');
	
	// Add click event listener to each item
	dropdownItems.forEach(function(item) {
		item.addEventListener('click', function() {
			var value = this.getAttribute('data-value'); // Get the value 
			
			document.getElementById('selected-item').innerText = 'Selected: ' + value; // Let user know what they selected
		});
	});
});

// Handles all logic for generating a quote and updating the UI
function generate(){
	let selectedItemText = document.getElementById('selected-item').innerText;
	let endpoint = "";
	
	let prompt = document.getElementById('promptInput').value; // Use the input prompt
	let presidentName = "";

	if (selectedItemText.includes("Joe Biden")){
		console.log("Generating Joe Biden quote");
		endpoint = "/generate-biden-quote/";
		presidentName = "Joe Biden";
	} else if (selectedItemText.includes("Donald Trump")){
		console.log("Generating Donald Trump quote");
		endpoint = "/generate-trump-quote/";
		presidentName = "Donald Trump";
	} else {
		console.log("Unknown value in dropdown. Please select a president.");
		return;
	}

	fetch(`${endpoint}?prompt=${encodeURIComponent(prompt)}`)
	.then(response => response.json())
	.then(data => {
		console.log('Success:', data);
		// Update the UI with the generated quote
		var tableBody = document.getElementById('quotesTable').getElementsByTagName('tbody')[0];
		let row = tableBody.insertRow();
		let cell1 = row.insertCell(0);
		let cell2 = row.insertCell(1);
		let cell3 = row.insertCell(2); // Cell for action buttons

		cell1.textContent = presidentName;
		// Add nice image
		let image = document.createElement('img');
		if (presidentName === "Joe Biden"){
			image.src = 'https://www.whitehouse.gov/wp-content/uploads/2021/04/P20210303AS-1901-cropped.jpg';
		} else if (presidentName === "Donald Trump"){
			image.src = 'https://media.npr.org/assets/img/2023/07/20/trumpbedminster_wide-b9e9152ef862b1a876e2c35255788782043e3452.jpg';
		}
		image.style.height = '50px'; 
		cell1.appendChild(image);
		cell2.textContent = data.quote;

		// Create delete button
		let deleteBtn = document.createElement('button');
		deleteBtn.classList.add('btn', 'btn-danger');
		deleteBtn.textContent = 'Delete';
		deleteBtn.onclick = function() { deleteQuote(data.id); };
		cell3.appendChild(deleteBtn);

		// Create edit button
		let editBtn = document.createElement('button');
		editBtn.classList.add('btn', 'btn-primary');
		editBtn.textContent = 'Edit';
		editBtn.style.marginLeft = '5px';
		editBtn.onclick = function() { editQuote(data.id, presidentName); };
		cell3.appendChild(editBtn);
	})
	.catch((error) => {
		console.error('Error:', error);
	});
}

// Fetch quotes from the server and populate the table
function fetchAndPopulateQuotes() {
	fetch('/quotes/')
		.then(response => response.json())
		.then(data => {
			const tableBody = document.getElementById('quotesTable').getElementsByTagName('tbody')[0];
			tableBody.innerHTML = ''; 

			data.forEach(quote => {
				let row = tableBody.insertRow();
				let cell1 = row.insertCell(0);
				let cell2 = row.insertCell(1);
				let cell3 = row.insertCell(2);

				cell1.textContent = quote.author;
				// Create image element
				let image = document.createElement('img');
				if (quote.author === "Joe Biden"){
					image.src = 'https://www.whitehouse.gov/wp-content/uploads/2021/04/P20210303AS-1901-cropped.jpg';
				} else if (quote.author === "Donald Trump"){
					image.src = 'https://media.npr.org/assets/img/2023/07/20/trumpbedminster_wide-b9e9152ef862b1a876e2c35255788782043e3452.jpg';
				}
				image.style.height = '50px'; 
				cell1.appendChild(image);
				cell2.textContent = quote.text;

				// Create delete button
				let deleteBtn = document.createElement('button');
				deleteBtn.classList.add('btn', 'btn-danger');
				deleteBtn.textContent = 'Delete';
				deleteBtn.onclick = function() { deleteQuote(quote.id); };
				cell3.appendChild(deleteBtn);

				// Create edit button
				let editBtn = document.createElement('button');
				editBtn.classList.add('btn', 'btn-primary');
				editBtn.textContent = 'Edit';
				editBtn.style.marginLeft = '5px';
				editBtn.onclick = function() { editQuote(quote.id, quote.author); };
				cell3.appendChild(editBtn);
			});
		})
		.catch(error => console.error('Error fetching quotes:', error));
}

function editQuote(quoteId, author) {
	let newText = prompt("Please enter the new text for the quote:");
	if (newText !== null && newText !== "") {
		let updatedQuote = { text: newText, author: author };

		fetch(`/quotes/${quoteId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(updatedQuote),
		})
		.then(response => response.json())
		.then(() => {
			fetchAndPopulateQuotes(); // Update UI with the new quote
		})
		.catch(error => console.error('Error updating quote:', error));
	}
}


function deleteQuote(quoteId) {
	fetch(`/quotes/${quoteId}`, { method: 'DELETE' })
		.then(response => {
			if (response.ok) {
				fetchAndPopulateQuotes(); // Update UI with the new quote
			} else {
				console.error('Error deleting quote with ID:', quoteId);
			}
		})
		.catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', fetchAndPopulateQuotes); // Populate the table when the page loads