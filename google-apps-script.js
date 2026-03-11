/**
 * =========================================
 * Google Apps Script - Analytics Backend
 * لحفظ عدد الزوار والإعجابات في Google Sheets
 * =========================================
 * 
 * خطوات الإعداد:
 * 1. افتح https://script.google.com
 * 2. أنشئ مشروع جديد
 * 3. انسخ هذا الكود بالكامل
 * 4. احفظ المشروع (Ctrl+S)
 * 5. انقر على "Deploy" → "New deployment"
 * 6. اختر "Web app"
 * 7. اضبط "Execute as: Me" و "Who has access: Anyone"
 * 8. انقر "Deploy" وانسخ الرابط
 * 9. ألصق الرابط في ملف script.js في المتغير GAS_URL
 */

// اسم ورقة العمل
const SHEET_NAME = 'Analytics';

// الرئيسية - معالجة الطلبات
function doGet(e) {
  const action = e.parameter.action;
  let result = { success: false, error: 'Invalid action' };
  
  try {
    switch(action) {
      case 'visit':
        result = recordVisit();
        break;
      case 'like':
        result = recordLike();
        break;
      case 'getVisitors':
        result = getVisitorCount();
        break;
      case 'getLikes':
        result = getLikeCount();
        break;
    }
  } catch (error) {
    result = { success: false, error: error.toString() };
  }
  
  // إرجاع النتيجة مع CORS headers
  const output = ContentService.createTextOutput(JSON.stringify(result));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// معالجة طلبات OPTIONS (لـ CORS)
function doOptions() {
  const output = ContentService.createTextOutput('');
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// تسجيل زيارة جديدة
function recordVisit() {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  
  // البحث عن صف الزوار
  let visitorRow = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === 'visitors') {
      visitorRow = i;
      break;
    }
  }
  
  if (visitorRow === -1) {
    // إنشاء صف جديد
    sheet.appendRow(['visitors', 1, new Date()]);
  } else {
    // تحديث العداد
    const currentCount = parseInt(data[visitorRow][1]) || 0;
    sheet.getRange(visitorRow + 1, 2).setValue(currentCount + 1);
    sheet.getRange(visitorRow + 1, 3).setValue(new Date());
  }
  
  return { success: true, message: 'Visit recorded' };
}

// تسجيل إعجاب جديد
function recordLike() {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  
  // البحث عن صف الإعجابات
  let likeRow = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === 'likes') {
      likeRow = i;
      break;
    }
  }
  
  if (likeRow === -1) {
    // إنشاء صف جديد
    sheet.appendRow(['likes', 1, new Date()]);
  } else {
    // تحديث العداد
    const currentCount = parseInt(data[likeRow][1]) || 0;
    sheet.getRange(likeRow + 1, 2).setValue(currentCount + 1);
    sheet.getRange(likeRow + 1, 3).setValue(new Date());
  }
  
  return { success: true, message: 'Like recorded' };
}

// الحصول على عدد الزوار
function getVisitorCount() {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === 'visitors') {
      return { 
        success: true, 
        count: parseInt(data[i][1]) || 0 
      };
    }
  }
  
  return { success: true, count: 0 };
}

// الحصول على عدد الإعجابات
function getLikeCount() {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === 'likes') {
      return { 
        success: true, 
        count: parseInt(data[i][1]) || 0 
      };
    }
  }
  
  return { success: true, count: 0 };
}

// الحصول على أو إنشاء ورقة العمل
function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    // إنشاء رأس الأعمدة
    sheet.appendRow(['Type', 'Count', 'Last Updated']);
    sheet.getRange(1, 1, 1, 3).setFontWeight('bold');
    
    // إنشاء صفوف البيانات الأولية
    sheet.appendRow(['visitors', 0, new Date()]);
    sheet.appendRow(['likes', 0, new Date()]);
  }
  
  return sheet;
}
