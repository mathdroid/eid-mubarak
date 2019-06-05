// client-side js
// run by the browser each time your view template referencing it is loaded

console.log('hello world :o');

let dreams = [];

// define variables that reference elements on our page
const dreamsList = document.getElementById('dreams');
const dreamsForm = document.forms[0];


// a helper function to call when our request for dreams is done
const getDreamsListener = function() {
  // parse our response to convert to JSON
  dreams = JSON.parse(this.responseText);

  dreamsList.innerHTML = dreams.data
}




// listen for the form to be submitted and add a new dream when it is
dreamsForm.onsubmit = function(event) {
  event.preventDefault();
  console.log('hello')
  // stop our form submission from refreshing the page
  const dreamRequest = new XMLHttpRequest();
dreamRequest.onload = getDreamsListener;
dreamRequest.open('get', '/generated');
dreamRequest.send();

  
};
