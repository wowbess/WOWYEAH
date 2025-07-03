let tei = document.getElementById("folio");
let tei_xml = tei.innerHTML;
let extension = ".xml";
let folio_xml = tei_xml.concat(extension);
let addArray = [];
let delArray = [];


// function to transform the text encoded in TEI with the xsl stylesheet "conan_doyle_text.xsl", this will apply the templates and output the text in the html <div id="text">
function documentLoader() {

    Promise.all([
      fetch(folio_xml).then(response => response.text()),
      fetch("conan_doyle_text.xsl").then(response => response.text())
    ])
    .then(function ([xmlString, xslString]) {
      var parser = new DOMParser();
      var xml_doc = parser.parseFromString(xmlString, "text/xml");
      var xsl_doc = parser.parseFromString(xslString, "text/xml");

      var xsltProcessor = new XSLTProcessor();
      xsltProcessor.importStylesheet(xsl_doc);
      var resultDocument = xsltProcessor.transformToFragment(xml_doc, document);

      var criticalElement = document.getElementById("text");
      criticalElement.innerHTML = ''; // Clear existing content
      criticalElement.appendChild(resultDocument);

      setUpAddDel();
    })
    .catch(function (error) {
      console.error("Error loading documents:", error);
    });
  }
  
// function to transform the metadata encoded in teiHeader with the xsl stylesheet "conan_doyle_meta.xsl", this will apply the templates and output the text in the html <div id="stats">
  function statsLoader() {

    Promise.all([
      fetch(folio_xml).then(response => response.text()),
      fetch("conan_doyle_meta.xsl").then(response => response.text())
    ])
    .then(function ([xmlString, xslString]) {
      var parser = new DOMParser();
      var xml_doc = parser.parseFromString(xmlString, "text/xml");
      var xsl_doc = parser.parseFromString(xslString, "text/xml");

      var xsltProcessor = new XSLTProcessor();
      xsltProcessor.importStylesheet(xsl_doc);
      var resultDocument = xsltProcessor.transformToFragment(xml_doc, document);

      var criticalElement = document.getElementById("stats");
      criticalElement.innerHTML = ''; // Clear existing content
      criticalElement.appendChild(resultDocument);
    })
    .catch(function (error) {
      console.error("Error loading documents:", error);
    });
  }

  function getOriginalStyles(element) {
    // Get the computed styles
    var computedStyles = window.getComputedStyle(element);
    // Create an object to store the styles
    var originalStyles = {};
    // Loop through all computed styles
    for (var key of computedStyles) {
        originalStyles[key] = computedStyles.getPropertyValue(key);
    }
    return originalStyles;
}

function changeStyle(elements) {
    elements.forEach(function(element) {
        // Change the styles
        element.style.display = 'none';
        // element.style.backgroundColor = 'yellow';
        // Optionally remove the original class
    });
}

function revertStyle(elements) {
    elements.forEach(function(element) {
        // Revert to the original styles from data attributes
        var originalStyles = JSON.parse(element.dataset.originalStyles);
        for (var key in originalStyles) {
            element.style[key] = originalStyles[key];
        }
    });
}

function simpleTextStyle(elements) {
  var basicLine = document.getElementsByTagName('p');
  var basicStyle = window.getComputedStyle(basicLine[0]);
  var styleObject = {};
  for (var i = 0; i < basicStyle.length; i++) {
      var key = basicStyle[i];
      styleObject[key] = basicStyle.getPropertyValue(key);
  }
  elements.forEach(element => {
    for (var key in styleObject) {
      if (key === 'display')
        element.style[key] = '';
      else
        element.style[key] = styleObject[key];
    }
  });
}

function setUpAddDel() {
  var additions = document.getElementsByClassName('add');
  var deletions = document.getElementsByClassName('del');

  addArray = Array.from(additions);
  delArray = Array.from(deletions);
  addArray.forEach(element => {
    var originalStyles = getOriginalStyles(element);
    element.dataset.originalStyles = JSON.stringify(originalStyles);
  });
  delArray.forEach(element => {
    var originalStyles = getOriginalStyles(element);
    element.dataset.originalStyles = JSON.stringify(originalStyles);
  });
}

  documentLoader();
  statsLoader();


  function selectVersion(event) {
    if (event.target.value == 'all') {
      revertStyle(addArray);
      revertStyle(delArray);
    } else if (event.target.value == 'final') {
      // revertStyle(addArray);
      simpleTextStyle(addArray);
      changeStyle(delArray);
    } else {
      changeStyle(addArray);
      // revertStyle(delArray);
      simpleTextStyle(delArray);
    }
  }
// write another function that will toggle the display of the deletions by clicking on a button
// EXTRA: write a function that will display the text as a reading text by clicking on a button or another dropdown list, meaning that all the deletions are removed and that the additions are shown inline (not in superscript)
