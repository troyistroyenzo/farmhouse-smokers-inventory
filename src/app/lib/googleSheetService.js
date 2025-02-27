// lib/googleSheetsService.js
import { google } from 'googleapis';

// Initialize the Google Sheets API client
export async function getGoogleSheetsClient() {
  try {
    // Ensure private key is properly formatted
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;
    
    if (!privateKey) {
      throw new Error('Private key is missing or invalid');
    }
    
    if (!process.env.GOOGLE_CLIENT_EMAIL) {
      throw new Error('Client email is missing');
    }
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: process.env.GOOGLE_TYPE || 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: privateKey,
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: process.env.GOOGLE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
        token_uri: process.env.GOOGLE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
        universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN || 'googleapis.com'
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    return sheets;
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error);
    throw error;
  }
}

// Function to fetch inventory data from Google Sheets
export async function getInventoryData() {
  try {
    if (!process.env.SPREADSHEET_ID) {
      throw new Error('Spreadsheet ID is missing in environment variables');
    }
    
    const sheets = await getGoogleSheetsClient();
    
    // Try to get sheet information first to determine the correct sheet name
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
    });
    
    // Get the first sheet's title or use "Sheet1" as fallback
    const sheetTitle = spreadsheetInfo.data.sheets?.[0]?.properties?.title || 'Sheet1';
    console.log('Using sheet:', sheetTitle);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${sheetTitle}!A1:Z1000`, // Using the detected sheet name
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      console.warn('No data found in spreadsheet');
      return [];
    }

    // Extract headers from the first row
    const headers = rows[0].map(header => header.trim());
    console.log('Headers found:', headers);
    
    // Fixed pricing for each product category
    const productPricing = {
      'Smoked Beef Brisket': 3300,
      'Smoked Angus "Bri-Steak"': 3300,
      'Smoked Beef Belly': 2200,
      // Add fallbacks for old product names
      'Beef Brisket': 3300,
      'Beef Angus': 3300,
      'Beef Belly': 2200
    };
    
    // Helper function to clean and parse numeric values
    const parseNumericValue = (value) => {
      if (!value) return 0;
      
      // Handle string values
      if (typeof value === 'string') {
        // Remove all non-numeric characters except dots (for decimals)
        // This handles values like "PHP 2,290.20" or "2,290.20"
        const cleaned = value.replace(/[^\d.]/g, '');
        return cleaned ? parseFloat(cleaned) : 0;
      }
      
      // If it's already a number, return it
      return parseFloat(value) || 0;
    };
    
    // Transform the data into an array of objects with proper keys
    const inventory = rows.slice(1).map(row => {
      const item = {};
      
      // Explicitly set default values for all expected fields
      item.ITEM = '';
      item.KG = 0;
      item.UNIT = 0;
      item.SRP = 0;
      
      headers.forEach((header, index) => {
        // Check if this column exists in the current row
        if (index < row.length) {
          const value = row[index];
          
          // Handle different column types based on header
          switch(header) {
            case 'ITEM':
              item.ITEM = value || '';
              break;
            case 'KG':
            case 'WEIGHT': // Fallback for backward compatibility
              item.KG = parseNumericValue(value);
              break;
            default:
              // For any other fields, just assign them as-is
              item[header] = value || '';
          }
        }
      });
      
      // Replace old product names with new ones if necessary
      if (item.ITEM === 'Beef Brisket') {
        item.ITEM = 'Smoked Beef Brisket';
      } else if (item.ITEM === 'Beef Angus') {
        item.ITEM = 'Smoked Angus "Bri-Steak"';
      } else if (item.ITEM === 'Beef Belly') {
        item.ITEM = 'Smoked Beef Belly';
      }
      
      // Set the proper UNIT price based on product type
      item.UNIT = productPricing[item.ITEM] || 0;
      
      // Calculate SRP based on KG and fixed price per KG
      if (item.KG && item.UNIT) {
        item.SRP = item.KG * item.UNIT;
      }
      
      return item;
    });

    console.log(`Successfully processed ${inventory.length} inventory items`);
    return inventory;
  } catch (error) {
    console.error('Error fetching inventory data:', error);
    throw error;
  }
}