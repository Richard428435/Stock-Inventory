const { google } = require('googleapis');
const stream = require('stream');

/**
 * Uploads a base64 string to Google Drive
 * Requires GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON and GOOGLE_DRIVE_FOLDER_ID in .env
 */
const uploadToDrive = async (base64Data, filename) => {
  try {
    const serviceAccount = JSON.parse(process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON);
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!serviceAccount || !folderId) {
      throw new Error('Google Drive credentials not configured');
    }

    const auth = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/drive.file']
    );

    const drive = google.drive({ version: 'v3', auth });

    // Extract buffer from base64
    const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
    const buffer = Buffer.from(matches[2], 'base64');
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    const res = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [folderId],
      },
      media: {
        mimeType: matches[1],
        body: bufferStream,
      },
      fields: 'id, webViewLink, webContentLink',
    });

    // Make file public (optional, but needed for use in <img> tags)
    await drive.permissions.create({
      fileId: res.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Return the direct link format
    return `https://drive.google.com/uc?export=view&id=${res.data.id}`;
  } catch (err) {
    console.error('Google Drive Upload Error:', err);
    throw err;
  }
};

module.exports = { uploadToDrive };
