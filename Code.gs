function syncWithFirestore() { 
  var sheetId = 'YOUR_GOOGLE_SHEET_ID';  // Sheet without columns for choice B to E and without columns for fraction B to E.
  
  var sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
  
  var data = sheet.getDataRange().getValues();
  
  var headers = data[0];  // Assuming the first row contains headers
  var rows = data.slice(1);  // Skip the header row
  
  // Firestore API settings
  var firestoreProjectId = 'YOUR_FIREBASE_PROJECT_ID';  // Replace with your Firestore project ID
  var firestoreCollection = 'YOUR_FIREBASE_COLLECTION_NAME';  // Replace with your collection name
  
  var firestoreUrl = 'https://firestore.googleapis.com/v1/projects/' + firestoreProjectId + '/databases/(default)/documents/' + firestoreCollection;

  // Delete the entire Firestore collection
  deleteFirestoreCollection(firestoreCollection);

  // Loop through each row in the Google Sheet and create Firestore documents
  rows.forEach(function(row) {
    var documentId = row[headers.indexOf('documentId')]; // Use a unique identifier for your document
    var record = {};
    
    // Only add 'answer' if it has a value
    var answer = row[headers.indexOf('answer')];
    record.answer = answer || "";  

    // Collect fractions into an array, only if they exist
    var fractions = [];
    if (headers.includes('fraction A')) {
      fractions.push(parseFloat(row[headers.indexOf('fraction A')]) || 0);
    }
    if (headers.includes('fraction B')) {
      fractions.push(parseFloat(row[headers.indexOf('fraction B')]) || 0);
    }
    if (headers.includes('fraction C')) {
      fractions.push(parseFloat(row[headers.indexOf('fraction C')]) || 0);
    }
    if (headers.includes('fraction D')) {
      fractions.push(parseFloat(row[headers.indexOf('fraction D')]) || 0);
    }
    if (headers.includes('fraction E')) {
      fractions.push(parseFloat(row[headers.indexOf('fraction E')]) || 0);
    }
    if (fractions.length > 0) {
      record.fractions = fractions;
    }
    
    // Collect options into an array, only if they exist
    var options = [];
    if (headers.includes('choice A')) {
      options.push(row[headers.indexOf('choice A')] || "");
    }
    if (headers.includes('choice B')) {
      options.push(row[headers.indexOf('choice B')] || "");
    }
    if (headers.includes('choice C')) {
      options.push(row[headers.indexOf('choice C')] || "");
    }
    if (headers.includes('choice D')) {
      options.push(row[headers.indexOf('choice D')] || "");
    }
    if (headers.includes('choice E')) {
      options.push(row[headers.indexOf('choice E')] || "");
    }
    if (options.length > 0) {
      record.options = options;
    }

    // Only add 'question' if it has a value
    var question = row[headers.indexOf('question')];
    if (question) {
      record.question = question;
    }
    
    // Only add 'subsubcategory' if it has a value
    var subsubcategory = row[headers.indexOf('subsubcategory')];
    if (subsubcategory) {
      record.subsubcategory = subsubcategory;
    }

    // Proceed with Firestore operations only if the record has values
    if (Object.keys(record).length > 0) {
      var options = {
        "method": "POST",  // Use POST to add new documents
        "contentType": "application/json",
        "payload": JSON.stringify({
          fields: convertToFirestoreFormat(record)
        }),
        headers: {
          "Authorization": "Bearer " + ScriptApp.getOAuthToken()
        },
        "muteHttpExceptions": true
      };
      
      try {
        var createResponse = UrlFetchApp.fetch(firestoreUrl, options);
        Logger.log("Created Document ID: " + documentId + " Response: " + createResponse.getContentText());
      } catch (error) {
        Logger.log("Error creating document: " + error.toString());
      }
    } else {
      Logger.log("No data to sync for Document ID: " + documentId);
    }
  });
}

// Helper function to delete an entire Firestore collection
function deleteFirestoreCollection(collection) {

    var firestoreProjectId = 'nova-elearning-hp-app';  // Replace with your Firestore project ID
  var firestoreCollection = 'hpp_date_written_3.0';  // Replace with your collection name
  
  var firestoreUrl = 'https://firestore.googleapis.com/v1/projects/' + firestoreProjectId + '/databases/(default)/documents/' + collection;


  var options = {
    "method": "GET",
    "headers": {
      "Authorization": "Bearer " + ScriptApp.getOAuthToken(),
    },
    "muteHttpExceptions": true
  };

  // Fetch all documents in the collection
  var response = UrlFetchApp.fetch(firestoreUrl + ':list', options);
  var data = JSON.parse(response.getContentText());

  if (data.documents) {
    data.documents.forEach(function(doc) {
      var deleteOptions = {
        "method": "DELETE",
        "headers": {
          "Authorization": "Bearer " + ScriptApp.getOAuthToken(),
        },
        "muteHttpExceptions": true
      };

      UrlFetchApp.fetch(firestoreUrlForDelete + '/' + doc.name.split('/').pop(), deleteOptions);
    });
  }

  // Optionally, you can delete the collection reference if needed
  // Note: Firestore does not allow deleting an empty collection directly via API.
}

// Helper function to format data for Firestore (supports arrays and data types)
function convertToFirestoreFormat(data) {
  var firestoreData = {};
  
  for (var key in data) {
    if (Array.isArray(data[key])) {
      // If the value is an array, check if elements are doubles or strings and format accordingly
      firestoreData[key] = { 
        "arrayValue": { 
          "values": data[key].map(function(item) {
            if (typeof item === 'number') {
              return { "doubleValue": item };  // Handle fractions as double
            } else {
              return { "stringValue": item };  // Handle options as string
            }
          })
        }
      };
    } else {
      firestoreData[key] = { "stringValue": data[key].toString() };  // Regular string value
    }
  }
  
  return firestoreData;
}
