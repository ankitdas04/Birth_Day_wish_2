/**
 * Google Apps Script - Birthday Wish Database & Email Notifications
 * 
 * Instructions:
 * 1. Open your Google Sheets Apps Script editor.
 * 2. Replace all existing code with this updated script.
 * 3. Save the script (disk icon).
 * 4. Deploy a new version: 
 *    Click Deploy -> Manage deployments -> Click the Pencil (edit) icon -> 
 *    Under "Version" choose "New version" -> Click Deploy.
 */

function doPost(e) {
  try {
    // Safety check: Google Apps Script editor runs doPost without an event object 'e',
    // which throws an error if we try to read e.parameter.
    if (!e) {
      throw new Error("No event data was received. (Note: You cannot click 'Run' inside the Apps Script Editor to test this function because it needs data from the website! Please test by submitting a wish from the website instead).");
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var timestamp = new Date();
    var wishText = "";
    
    var type = "wish";
    var actionName = "";
    var ip = "Unknown";
    var userAgent = "Unknown";

    // Support both JSON fetch payload and standard HTML Form post
    if (e.postData && e.postData.contents) {
      try {
        var data = JSON.parse(e.postData.contents);
        wishText = data.wish;
        type = data.type || "wish";
        actionName = data.actionName || "";
        ip = data.ip || "Unknown";
        userAgent = data.userAgent || "Unknown";
      } catch (err) {
        // Fallback if content is not JSON
        wishText = (e.parameter ? e.parameter.wish : null) || e.postData.contents;
        type = (e.parameter ? e.parameter.type : null) || "wish";
        actionName = e.parameter ? e.parameter.actionName : "";
        ip = e.parameter ? e.parameter.ip : "Unknown";
        userAgent = e.parameter ? e.parameter.userAgent : "Unknown";
      }
    } else if (e.parameter) {
      wishText = e.parameter.wish;
      type = e.parameter.type || "wish";
      actionName = e.parameter.actionName || "";
      ip = e.parameter.ip || "Unknown";
      userAgent = e.parameter.userAgent || "Unknown";
    }
    
    if (type === "action") {
      if (!actionName) {
        throw new Error("No actionName received.");
      }
      
      // Add row to Google Sheet: Timestamp | Action | Status
      sheet.appendRow([
        timestamp, 
        "Action: " + actionName + "\nIP: " + ip + "\nDevice: " + userAgent, 
        "Tracked"
      ]);
      
      MailApp.sendEmail({
        to: Session.getEffectiveUser().getEmail(),
        subject: "✨ Alert: User Action on Birthday Site ✨",
        htmlBody: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fff0fa; border-radius: 12px; border: 1.5px solid #ffb3d9; max-width: 600px; margin: auto;">
            <h2 style="color: #e91e8c; text-align: center;">👀 Activity Alert! 👀</h2>
            <p style="font-size: 1.1em; color: #7b3f6e;">A user performed the following action:</p>
            <div style="background-color: #fff; padding: 15px; border-left: 4px solid #ff6eb4; border-radius: 6px; font-size: 1.2em; color: #5b2a4a; margin: 20px 0; font-weight: bold; text-align: center;">
              ${actionName}
            </div>
            <div style="background-color: #fdf5ff; padding: 12px; border-radius: 6px; margin-bottom: 20px; font-size: 0.9em; color: #5b2a4a; line-height: 1.5;">
              <strong>🌍 IP Address:</strong> ${ip}<br>
              <strong>💻 Device/Browser:</strong> ${userAgent}<br>
              <strong>🕒 Time:</strong> ${timestamp.toLocaleString()}
            </div>
            <hr style="border: none; border-top: 1px dashed #ffb3d9; margin: 20px 0;" />
            <p style="font-size: 0.8em; color: #c06aaa; text-align: center;">Tracked securely by Google Apps Script</p>
          </div>
        `
      });
      
    } else {
      if (!wishText) {
        throw new Error("No wish content received in parameters.");
      }
      
      // Add row to Google Sheet: Timestamp | Wish | Status
      sheet.appendRow([
        timestamp, 
        wishText, 
        "Unread"
      ]);
      
      MailApp.sendEmail({
        to: Session.getEffectiveUser().getEmail(),
        subject: "✨ New Birthday Wish from Binita! ✨",
        htmlBody: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fff0fa; border-radius: 12px; border: 1.5px solid #ffb3d9; max-width: 600px; margin: auto;">
            <h2 style="color: #e91e8c; text-align: center;">🌸 Wishing Well Alert! 🌸</h2>
            <p style="font-size: 1.1em; color: #7b3f6e;">Binita just made a silent wish in the Magic Wishing Well:</p>
            <div style="background-color: #fff; padding: 15px; border-left: 4px solid #ff6eb4; font-style: italic; border-radius: 6px; font-size: 1.2em; color: #5b2a4a; margin: 20px 0;">
              "${wishText}"
            </div>
            <hr style="border: none; border-top: 1px dashed #ffb3d9; margin: 20px 0;" />
            <p style="font-size: 0.9em; color: #c06aaa; text-align: center;">Sent on ${timestamp.toLocaleString()}</p>
          </div>
        `
      });
    }
    
    var result = {
      status: "success", 
      message: "Wish stored and notification sent!"
    };
    
    // Allow JSONP response if callback is requested
    var callback = (e.parameter) ? (e.parameter.prefix || e.parameter.callback) : null;
    if (callback) {
      return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    var errResult = {
      status: "error", 
      message: error.toString()
    };
    
    var callback = (e && e.parameter) ? (e.parameter.prefix || e.parameter.callback) : null;
    if (callback) {
      return ContentService.createTextOutput(callback + '(' + JSON.stringify(errResult) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    return ContentService.createTextOutput(JSON.stringify(errResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    // Safety check if run inside editor
    if (!e) {
      throw new Error("No event data received. (Note: You cannot click 'Run' inside the Apps Script Editor to test this. Test by opening admin.html in the browser instead).");
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var wishes = [];
    
    // Start at index 1 to skip header row
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][1]) {
        wishes.push({
          timestamp: data[i][0],
          wish: data[i][1],
          status: data[i][2] || "Unread"
        });
      }
    }
    
    var result = {
      status: "success",
      wishes: wishes
    };
    
    // Allow JSONP response (prefix callback) to completely bypass CORS in local files
    var callback = (e.parameter) ? (e.parameter.prefix || e.parameter.callback) : null;
    if (callback) {
      return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    var errResult = {
      status: "error",
      message: error.toString()
    };
    
    var callback = (e && e.parameter) ? (e.parameter.prefix || e.parameter.callback) : null;
    if (callback) {
      return ContentService.createTextOutput(callback + '(' + JSON.stringify(errResult) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    return ContentService.createTextOutput(JSON.stringify(errResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
