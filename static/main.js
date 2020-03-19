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
var imageDisplay = document.getElementById("image-display");
var uploadCaption = document.getElementById("upload-caption");
var predResult = document.getElementById("pred-result");
var loader = document.getElementById("loader");
var buttonCloth = document.getElementById("button-cloth")
var panel = document.getElementById('panel')

//========================================================================
// Main button events
//========================================================================

function submitImage() {
  // action for the submit button
  console.log("submit");

  if (!imageDisplay.src || !imageDisplay.src.startsWith("data")) {
    window.alert("Please select an image before submit.");
    return;
  }

  loader.classList.remove("hidden");
  imageDisplay.classList.add("loading");

  // call the predict function of the backend
  predictImage(imageDisplay.src);
}

function clearImage() {
  // reset selected files
  fileSelect.value = "";
  // remove image sources and hide them
  imagePreview.src = "";
  imageDisplay.src = "";
  predResult.innerHTML = "";
  hide(document.getElementById('pred-result2'))
  hide(imagePreview);
  hide(imageDisplay);
  hide(loader);
  hide(buttonCloth);
  hide(predResult);
  show(uploadCaption);
  imageDisplay.classList.remove("loading");
  document.getElementById('pred-result2').innerHTML = "";

}

function previewFile(file) {
  // show the preview of the image
  console.log(file.name);
  var fileName = encodeURI(file.name);

  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = () => {
    imagePreview.src = URL.createObjectURL(file);

    show(imagePreview);
    hide(uploadCaption);

    // reset
    predResult.innerHTML = "";
    imageDisplay.classList.remove("loading");

    displayImage(reader.result, "image-display");
  };
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
          displayResult(data);
        });
    })
    .catch(err => {
      console.log("An error occured", err.message);
      window.alert("Oops! Something went wrong.");
    });
}

function displayImage(image, id) {
  // display image on given id <img> element
  let display = document.getElementById(id);
  display.src = image;
  show(display);
}

function displayResult(data) {
  // display the result
  // imageDisplay.classList.remove("loading");
  hide(loader);
  //predResult.innerHTML = data.result;
  hide(imageDisplay);
  hide(panel);
  show(buttonCloth);
  //displayImage('https://media-exp1.licdn.com/dms/image/C4D03AQFiMJ8MbeNmrQ/profile-displayphoto-shrink_200_200/0?e=1590019200&v=beta&t=XjlSBOZZGmwMJGjQd3EcsVbA3wkLfQCezlDFS3zlj5A','pred-result');
  display_grid(data);
}

function hide(el) {
  // hide an element
  el.classList.add("hidden");
}

function show(el) {
  // show an element
  el.classList.remove("hidden");
}

//function show_res(data) {
//    image = data['images.model']
//    displayImage(image,text_to_show)
//}
function display_grid(data){
    var i, obj = JSON.parse(data);
    var text = '';
    for (i in obj) {
        //
        var newDiv = document.createElement("div");
        //
        var shortDescription = document.createElement("p"), Price = document.createElement("p"), img = new Image();
        img.src = obj[i]['images.model'];
        img.className = 'img-demo';
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