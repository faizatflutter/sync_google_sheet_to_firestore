Syncing Google Sheets with Firebase Firestore


This Google Apps Script syncs data from a specified Google Sheets document to a Firestore collection. The script ensures that the Firestore collection always reflects the current state of the sheet.
Prerequisites:
Google Sheets: The data should be organized in a Google Sheets document with the following headers:
answer
fraction A
fraction B
fraction C
fraction D
fraction E
choice A
choice B
choice C
choice D
choice E
question
subcategory

(Note: It is not necessary to add fractions from A to E and Choices from A to E, but at least one of them should be added)

Google Cloud Firestore: A Firestore project must be set up, and the required permissions should be granted to allow Google Apps Script to access it.

Authorization: Ensure that the script has been authorized to access Google Sheets and Firestore.
We will enable appscript.json file from the project settings.
Then we will add the following auth code there:

 "oauthScopes": [
   "https://www.googleapis.com/auth/datastore",
   "https://www.googleapis.com/auth/script.external_request",
   "https://www.googleapis.com/auth/spreadsheets"
],


Script Code: Find the script code here at github

Customize the Code:
- Replace the following placeholders in the script with your specific information:
  - YOUR_GOOGLE_SHEET_ID: The ID of your Google Sheet (found in the URL).
  - YOUR_FIRESTORE_PROJECT_ID: Your Firebase project ID.
  - YOUR_COLLECTION_NAME: The name of the Firestore collection you want to sync data to.

Tiggers (optional): 
- If you want this function to run automatically at set intervals:
  - Click on the clock icon in the left sidebar (Triggers).
  - Click + Add Trigger.
  - Select syncWithFirestore for the function to run.
  - Choose Time-driven for the event source.
  - Select Hour timer and set it to run Every hour.
  - Select Head for the deployment.
  - Click Save.
