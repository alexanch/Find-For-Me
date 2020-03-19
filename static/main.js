//========================================================================
// Drag and drop image handling
//========================================================================

var fileDrag = document.getElementById("file-drag");
var fileSelect = document.getElementById("file-upload");

// Add event listeners
fileDrag.addEventListener("dragover", fileDragHover, false);
fileDrag.addEventListener("dragleave", fileDragHover, false);
fileDrag.addEventListener("drop", fileSelectHandler, false);
fileSelect.addEventListener("change", fileSelectHandler, false);

function fileDragHover(e) {
  // prevent default behaviour
  e.preventDefault();
  e.stopPropagation();

  fileDrag.className = e.type === "dragover" ? "upload-box dragover" : "upload-box";
}

function fileSelectHandler(e) {
  // handle file selecting
  var files = e.target.files || e.dataTransfer.files;
  fileDragHover(e);
  for (var i = 0, f; (f = files[i]); i++) {
    previewFile(f);
  }
}

//========================================================================
// Web page elements for functions to use
//========================================================================

var imagePreview = document.getElementById("image-preview");
var uploadCaption = document.getElementById("upload-caption");
var predResult = document.getElementById("pred-result");
var loader = document.getElementById("loader");
var buttonCloth = document.getElementById("button-cloth")
var buttonSubmit = document.getElementById('submit-button')
var panel = document.getElementById('panel')

//========================================================================
// Main button events
//========================================================================

function previewFile(file) {
// show the preview of the image
  console.log(file.name);
  var fileName = encodeURI(file.name);
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = () => {
  imagePreview.src = reader.result;
  show(imagePreview);
  hide(uploadCaption);

  }
}

function submitImage() {

  // action for the submit button
  console.log("submit");
  var imgPreview = document.getElementById('image-preview');
  if (!imgPreview.src || !imgPreview.src.startsWith("data")) {
    window.alert("Please select an image before submit.");
    return;
  }
  loader.classList.remove("hidden");
  document.getElementById('pred-result2').classList.remove('hidden');
  // call the predict function of the backend
  predictImage(imgPreview.src);
}

function clearImage() {
  // reset selected files
  fileSelect.value = "";
  // remove image sources and hide them
  imagePreview.src = "";
  hide(loader);
  hide(imagePreview);
  show(buttonSubmit);
  show(panel);
  //
  document.getElementById('pred-result2').innerHTML = "";
  hide(document.getElementById('pred-result2'))

  hide(buttonCloth);
  show(uploadCaption);
}

//========================================================================
// Helper functions
//========================================================================

function predictImage(image) {
  fetch("/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(image)
  })
    .then(resp => {
      if (resp.ok)
        resp.json().then(data => {
          displayGrid(data);
        });
    })
    .catch(err => {
      console.log("An error occured", err.message);
      window.alert("Oops! Something went wrong.");
    });
}

function displayGrid(data){
   // display the result
   //imageDisplay.classList.remove("loading");
   //predResult.innerHTML = data.result;
    hide(panel);
    hide(buttonSubmit);
    show(buttonCloth);

    var i, obj = JSON.parse(data);
    var text = '';
    for (i in obj) {
        //
        var newDiv = document.createElement("section");

        //
        var shortDescription = document.createElement("p"), Price = document.createElement("p"), img = new Image();
        img.src = obj[i]['images.model'];
        img.className = 'pred-img';
        newDiv.appendChild(img);
        //
        shortDescription.innerText = obj[i]['shortDescription'];
        newDiv.appendChild(shortDescription);
        //
        Price.innerText = obj[i]['priceInfo.finalPrice'];
        newDiv.appendChild(Price);
        //
        document.getElementById('pred-result2').appendChild(newDiv);
    }
}

function hide(el) {
  // hide an element
  el.classList.add("hidden");
}

function show(el) {
  // show an element
  el.classList.remove("hidden");
}


//  // show the preview of the image
//  console.log(file.name);
//  var fileName = encodeURI(file.name);
//
//  var reader = new FileReader();
//  reader.readAsDataURL(file);
//  reader.onloadend = () => {
//    imagePreview.src = URL.createObjectURL(file);
//
//    show(imagePreview);
//    hide(uploadCaption);
//
//    // reset
//    predResult.innerHTML = "";
//    imageDisplay.classList.remove("loading");
//    let display = document.getElementById("image-display");
//    display.src = reader.result;
//    show(display);
//  };
//}


//function displayImage(image, id) {
//  // display image on given id <img> element
//  let display = document.getElementById(id);
//  display.src = image;
//  show(display);
//}