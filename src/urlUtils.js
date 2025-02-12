const fetch = require('node-fetch');
// Function to check the status of a URL using fetch
async function checkUrlStatus(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US',
      },
    });
    return response.ok && response.status === 200;
  } catch (error) {
    return false;
  }
}
module.exports = { checkUrlStatus };