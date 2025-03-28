const dropArea = document.getElementById('drop-area');
const textOutput = document.getElementById('text-output');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop area when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropArea.classList.add('highlight');
}

function unhighlight(e) {
    dropArea.classList.remove('highlight');
}

// Handle dropped files
dropArea.addEventListener('drop', handleDrop, false);

function ParseKeyItems(spoiler) {
    const regex = /Hints for key items:([\s\S]*?)-- Hints for bell bearings/m

    let matchArray = spoiler.match(regex)[1]
        .trim()
        .replaceAll("In ", "")
        .split("\r\n")
        .map((elt) => elt.split(": "))

    return matchArray;
}

function CreateLocationItemMapping(matchArray) {
    // Creates a list of items given a location.

    let locMap = {}

    matchArray.forEach(elt => {
        let item = elt[0];
        let loc = elt[1];

        if (!(loc in locMap)) {
            // If the loc key doesn't exist...
            locMap[loc] = [item];
        }
        else {
            // If the loc key does exist...
            locMap[loc].push(item);
        }
    })
    return locMap;
}

function MakeTablesForLocationItemMappings(locMap) {
    // Process each key-value pair in the mapping
    const $container = $("#container");

    $.each(locMap, function(key, value) {
      // Create a new div for this mapping item
      const $div = $('<div></div>').addClass("location");
      
      // Add the key as the title
      const $title = $('<h3></h3>').addClass("loc-title").text(key);
      $div.append($title);
      
      // Create a list for the values
      const $list = $('<ul></ul>').addClass("item");
      
      // Handle different value types
      if (Array.isArray(value)) {
        // If value is already an array, create list items for each element
        $.each(value, function(index, item) {
          const itemText = typeof item === 'object' ? JSON.stringify(item) : String(item);
          $('<li></li>').text(itemText).appendTo($list);
        });
      } else {
        // For primitive values, create a single list item
        $('<li></li>').text(String(value)).appendTo($list);
      }
      
      // Add the list to the div
      $div.append($list);
      
      // Add the div to the container
      $container.append($div);
    });
  }
  

function ReadTextFileBrowser(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
        const file = files[0];
        $('#drop-area').css("display", "none");

        ReadTextFileBrowser(file)
            .then(text => {
                // Hide the drag-drop area.
                let parsedKeyItems = ParseKeyItems(text)
                let locMap = CreateLocationItemMapping(parsedKeyItems)
                MakeTablesForLocationItemMappings(locMap);
                console.log(locMap);
            }
            )
            .catch(error => console.error(error));


        // let spoiler = reader.result;
        // console.log(spoiler)
        // let parsedKeyItems = ParseKeyItems(spoiler);
        // console.log(parsedKeyItems)
        // textOutput.value = parsedKeyItems;

    }
}


// document.getElementById('fileInput').addEventListener('change', (e) => {
//     const file = e.target.files[0];
//     readTextFileBrowser(file)
//         .then(text => console.log(text))
//         .catch(error => console.error(error));
// });