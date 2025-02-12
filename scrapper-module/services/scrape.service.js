const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { connect } = require("puppeteer-real-browser");
const cheerio = require("cheerio");
const {
  wait,
  validateProductData,
  isValidLanguageCode,
} = require("../utils/utils.js");
const { 
  USER_AGENTS, 
  PRODUCTS_QUEUE, 
  SKIPPED_IDS, 
  DORCEL_ID,
  MODEL_NAME,
  SCRAPPER_QUEUE
} = require("../utils/constants.js");
const env = require("../config/env.js");
const axios = require("axios");
const { 
  addProduct,
  getAllProductsSmiIds,
} = require("../repositories/product.repository.js");
const { 
  addFailedProduct,
  getUnresolvedFailedIds,
  setResolvedFailed,
} = require("../repositories/failed.repository.js");
const { addInvalidProduct } = require('../repositories/invalid.repository.js');
const FormData = require("form-data");
const { sendToQueue } = require("../rabbitmq/producer.js");
puppeteer.use(StealthPlugin());
const API_KEYS = env.GEMINI_API_KEYS ? env.GEMINI_API_KEYS.split(',') : [];

const scrapePage = async (url, offerId, key) => {
  let browser;
  let page;

  try {
    const maxAttempts = env.SCRAPER_MAX_ATTEMPTS;
    let attempts = 0;
    let success = false;
    let bodyContent = null;
    const browserTimeout = env.BROWSER_TIMEOUT;
    const pageTimeout = env.PAGE_TIMEOUT;
    const retryBaseDelay = env.RETRY_BASE_DELAY;
    const extractionTimeout = env.EXTRACTION_TIMEOUT;

    // Add connection timeout
    const browserConnection = await Promise.race([
      connect({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--window-size=1920x1080",
        ],
      }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Browser connection timeout")),
          browserTimeout
        )
      ),
    ]);

    ({ page, browser } = browserConnection);

    let statusCode;
    let finalUrl = url;

    // Capture HTTP status code
    page.on("response", async (response) => {
      if (response.url() === url) {
        statusCode = response.status();
        console.log(`Status code = ${statusCode}`);

        // Capture redirection
        if(statusCode>= 300 && statusCode < 400){
          const redirectUrl = response.headers()["location"];
          if (redirectUrl) {
            finalUrl = new URL(redirectUrl, url).href;
          }
        }

        // Handle 404 Not Found
        if (statusCode === 404) {
          try{
            await createInvalid({url: finalUrl, idProductSmi : key, offerId, reason : 'URL returns 404 Not Found'})
            console.log('URL returns 404 Not Found');
            // Optionally, handle the Not Found case (e.g., return or throw an error)
            page.removeAllListeners("response"); // Stop further checks
            return; 
          }
          catch(error){
            await createFailed({
              idProductSmi: key,
              url: finalUrl,
              offerId,
              errorMessage: error.message,
            });
            return;
          }
        }

        // If status code is 200, stop further checks
        if (statusCode === 200) {
          console.log("Status code 200 received, proceeding...");
          // Optionally remove the event listener or exit if 200 is received
          page.removeAllListeners("response");
        }
      }
    });       

    // Set default timeout for all operations
    page.setDefaultTimeout(pageTimeout);
    page.setDefaultNavigationTimeout(pageTimeout);

    while (attempts < maxAttempts && !success) {
      try {
        const randomIndex = Math.floor(Math.random() * USER_AGENTS.length);
        await page.setUserAgent(USER_AGENTS[randomIndex]);

        // Add timeout to page.goto
        await Promise.race([
          page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: pageTimeout,
          }),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Navigation timeout")),
              pageTimeout
            )
          ),
        ]);

        await wait(2000); // Increased wait time

        await page.mouse.move(100, 100);
        await page.mouse.move(200, 200);

        const { valid, message } = checkUrl(finalUrl);
        if(!valid){
          try{
            await createInvalid({url: finalUrl, idProductSmi : key, offerId, reason : message});
            console.log('URL invalid = ', message);
            return;
          }
          catch(error){
            await createFailed({
              idProductSmi: key,
              url: finalUrl,
              offerId,
              errorMessage: error.message,
            });
            return;
          }
        }

        // Simple check if page loaded properly
        const bodyHandle = await page.$("body");
        if (!bodyHandle) {
          throw new Error("Body not found");
        }
        await bodyHandle.dispose();

        // Wrap content extraction in timeout
        bodyContent = await Promise.race([
          page.evaluate(() => {
            const selectorsToRemove = [
              "script",
              "style",
              "img",
              "iframe",
              "noscript",
              "svg",
              "path",
              ".advertisement",
              ".popup",
              ".newsletter",
              ".social-media",
              ".search-bar",
            ];

            // Remove specified elements
            selectorsToRemove.forEach((selector) => {
              document.querySelectorAll(selector).forEach((element) => {
                try {
                  if (element.parentNode) {
                    element.parentNode.removeChild(element); // Safe removal check
                  }
                } catch (error) {
                  // Log and continue if the element has already been removed or changed
                  console.log(`Failed to remove element: ${error.message}`);
                }
              });
            });

            // Remove all class names from all elements
            const allElements = document.querySelectorAll("*"); // Select all elements
            allElements.forEach((element) => {
              element.removeAttribute("class"); // Remove class names
              element.removeAttribute("style"); // Remove inline styles
              element.removeAttribute("tabindex"); // Remove tabindex attribute

              // Remove all data-* attributes
              Array.from(element.attributes).forEach((attr) => {
                if (attr.name.startsWith("data-")) {
                  element.removeAttribute(attr.name); // Remove data-action, data-hook, ...
                }
              });
            });

            // return document.querySelector("body").innerHTML;
            let bodyContent = document.querySelector("body").innerHTML;

            // Remove HTML comments
            bodyContent = bodyContent.replace(/<!--[\s\S]*?-->/g, "");

            // Remove extra spaces and newlines
            bodyContent = bodyContent.replace(/\s+/g, " ").trim();

            return bodyContent;
          }),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Content extraction timeout")),
              extractionTimeout
            )
          ),
        ]);

        // Check for Cloudflare or status code
        if (statusCode === 503 || statusCode === 403) {
          console.log(
            `Attempt ${attempts + 1}: Blocked by Cloudflare, status code = ${statusCode}, retrying...`
          );
          await wait(retryBaseDelay * (attempts + 1)); // Exponential backoff
          attempts++;
        } else {
          success = true;
        }
      } catch (attemptError) {
        console.error(`Attempt ${attempts + 1} failed:`, attemptError.message);
        attempts++;
        if (attempts >= maxAttempts) throw attemptError;
        await wait(retryBaseDelay * (attempts + 1)); // Exponential backoff
      }
    }

    if (!success) {
      throw new Error(`Scraping failed after ${maxAttempts} attempts`);
    }

    // Clean the content
    const $ = cheerio.load(bodyContent);
    $("script, img, style, button, link").remove();

    // Function to recursively remove empty tags
    function removeEmptyTags() {
      $('*').each(function () {
        const element = $(this);

        // Check if the element is empty or only contains whitespace/newlines
        if (!element.text().trim() && element.children().length === 0) {
          element.remove(); // Remove the element if it's empty
        }
      });
    }

    // Call the function multiple times to ensure nested empty tags are removed
    let previousHtml;
    do {
      previousHtml = $.html(); // Store the current state of the HTML
      removeEmptyTags(); // Remove empty tags
    } while ($.html() !== previousHtml); // Continue until no more changes are detected

    bodyContent = $.html();

    return {
      content : bodyContent,
      finalUrl
    };
  } catch (error) {
    console.error(`Scraping error: ${error.message}`);
    throw error;
  } finally {
    // Ensure browser is always closed
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError.message);
      }
    }
  }
};

const scrapeDorcel = async (url) => {
  let browser;
  let page;

  try {
    const maxAttempts = env.SCRAPER_MAX_ATTEMPTS;
    let attempts = 0;
    let success = false;
    let bodyContent = null;
    const browserTimeout = env.BROWSER_TIMEOUT;
    const pageTimeout = env.PAGE_TIMEOUT;
    const retryBaseDelay = env.RETRY_BASE_DELAY;
    const extractionTimeout = env.EXTRACTION_TIMEOUT;

    // Add connection timeout
    const browserConnection = await Promise.race([
      connect({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--window-size=1920x1080",
        ],
      }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Browser connection timeout")),
          browserTimeout
        )
      ),
    ]);

    ({ page, browser } = browserConnection);

    let statusCode;

    // Capture HTTP status code
    page.on("response", (response) => {
      if (response.url() === url) {
        statusCode = response.status();
        console.log(`Status code = ${statusCode}`);

        // If status code is 200, stop further checks
        if (statusCode === 200) {
          console.log("Status code 200 received, proceeding...");
          // Optionally remove the event listener or exit if 200 is received
          page.removeAllListeners("response");
        }
      }
    });       

    // Set default timeout for all operations
    page.setDefaultTimeout(pageTimeout);
    page.setDefaultNavigationTimeout(pageTimeout);

    while (attempts < maxAttempts && !success) {
      try {
        const randomIndex = Math.floor(Math.random() * USER_AGENTS.length);
        await page.setUserAgent(USER_AGENTS[randomIndex]);

        // Add timeout to page.goto
        await Promise.race([
          page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: pageTimeout,
          }),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Navigation timeout")),
              pageTimeout
            )
          ),
        ]);

        await wait(2000); // Increased wait time

        await page.mouse.move(100, 100);
        await page.mouse.move(200, 200);

        // Simple check if page loaded properly
        const bodyHandle = await page.$("body");
        if (!bodyHandle) {
          throw new Error("Body not found");
        }
        await bodyHandle.dispose();

        // Wrap content extraction in timeout
        bodyContent = await Promise.race([
          page.evaluate(() => {
            const selectorsToRemove = [
              "script",
              "style",
              "img",
              "iframe",
              "footer",
              "aside",
              "noscript",
              "button",
              "svg",
              "path",
              ".advertisement",
              ".popup",
              ".newsletter",
              ".social-media",
              ".search-bar",
              ".carousel",
              "scalapay-modal-core"
            ];

            // Remove specified elements
            selectorsToRemove.forEach((selector) => {
              document.querySelectorAll(selector).forEach((element) => {
                try {
                  if (element.parentNode) {
                    element.parentNode.removeChild(element); // Safe removal check
                  }
                } catch (error) {
                  // Log and continue if the element has already been removed or changed
                  console.log(`Failed to remove element: ${error.message}`);
                }
              });
            });

            // Remove all class names from all elements
            const allElements = document.querySelectorAll("*"); // Select all elements
            allElements.forEach((element) => {
              element.removeAttribute("tabindex"); // Remove tabindex attribute
              element.removeAttribute("slot");
              element.removeAttribute("aria-hidden");
              element.removeAttribute("style");
            });

            // return document.querySelector("body").innerHTML;
            let bodyContent = document.querySelector("body").innerHTML;

            // Remove HTML comments
            bodyContent = bodyContent.replace(/<!--[\s\S]*?-->/g, "");

            // Remove empty HTML elements (self-closing and opened/closed)
            bodyContent = bodyContent.replace(/<(\w+)([^>]*)>\s*<\/\1>/g, ""); // Remove tags with no content
            bodyContent = bodyContent.replace(/<(\w+)([^>]*?)\/>/g, ""); // Remove self-closing tags with no content

            // Remove extra spaces and newlines
            bodyContent = bodyContent.replace(/\s+/g, " ").trim();

            return bodyContent;
          }),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Content extraction timeout")),
              extractionTimeout
            )
          ),
        ]);

        // Check for Cloudflare or status code
        if (statusCode === 503 || statusCode === 403) {
          console.log(
            `Attempt ${attempts + 1}: Blocked by Cloudflare, status code = ${statusCode}, retrying...`
          );
          await wait(retryBaseDelay * (attempts + 1)); // Exponential backoff
          attempts++;
        } else {
          success = true;
        }
      } catch (attemptError) {
        console.error(`Attempt ${attempts + 1} failed:`, attemptError.message);
        attempts++;
        if (attempts >= maxAttempts) throw attemptError;
        await wait(retryBaseDelay * (attempts + 1)); // Exponential backoff
      }
    }

    if (!success) {
      throw new Error(`Scraping failed after ${maxAttempts} attempts`);
    }

    // Clean the content
    const $ = cheerio.load(bodyContent);
    $("script, img, style, button, link").remove();
    bodyContent = $.html();

    return bodyContent;
  } catch (error) {
    console.error(`Scraping error: ${error.message}`);
    throw error;
  } finally {
    // Ensure browser is always closed
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError.message);
      }
    }
  }
};

const getProductData = async (data) => {
  try {
    const { content, model, url, api_key } = data;
    const apUrl = `${env.LLM_API_URL}?model=${encodeURIComponent(model)}`;

    const maxAttempts = env.LLM_MAX_ATTEMPTS;
    let attempts = 0;
    let success = false;

    while (attempts < maxAttempts && !success) {
      try {
        const formData = new FormData();
        formData.append("content", content);
        formData.append("url", url);
        formData.append("api_key", api_key);

        const response = await axios.post(apUrl, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.status === 200) {
          success = true;
          return response.data.json_data;
        }
      } catch (error) {
        if (error.response && error.response.status === 500) {
          attempts++;
          console.error(
            `Attempt ${attempts} failed with status 500. Retrying...`
          );

          await new Promise((res) => setTimeout(res, 1000));
        } else {
          throw error;
        }
      }
    }

    throw new Error("Failed to fetch product data after maximum attempts.");
  } catch (error) {
    console.error("Error fetching product data:", error.message);
    throw error;
  }
};

const createFailed = async (data) => {
  try {
    const result = await addFailedProduct(data);
    return result;
  } catch (error) {
    console.error("Error adding a new failed product :", error.message);
    throw error;
  }
};

const extractData = async (data) => {
  const { key, offerId, url, model, content, api_key } = data;
  let savedData;

  let productData;
  try {
    // Data extraction step
    productData = await getProductData({ content, model, url, api_key });
    console.log("Product data extracted successfully");

    savedData = {
      ...productData,
      url,
      id_product_smi: key,
      offer_id: offerId,
    };
      
    savedData = validateProductData(savedData);
    let addedProduct;
      
    // Saving product data
    addedProduct = await addProduct(savedData);
    console.log("Product data saved successfully");
    
    return addedProduct;
  } catch (error) {
    await createFailed({
      idProductSmi: key,
      url,
      offerId,
      errorMessage: error.message,
      idProduct: savedData?.id_product
    });
  }
};

const getProductsFromJson = (file) => {
  return file.articles ? file.articles : [];
};

const extractDataFromFile = async (data) => {
  const { fileData } = data;
  const articles = getProductsFromJson(fileData);

  articles.forEach((article) => {
    const message = {
      url: article.url,
      key: article.key,
      offerId: article.offerid,
    };
    sendToQueue(SCRAPPER_QUEUE, message);
  })
};

const getDataDorcel = (html) => {
  const $ = cheerio.load(html);
  
  const productData = {available_color : null,
    keys : null,
    category : null,
    subcategory : null,
    id_product : null,
    price : null,
    product_name : null,
    currency : null,
    availability : null,
    description : null
  };

  // Extracting Color
  const colorRow = $('tr')
    .filter((i, el) => $(el).find('th.col.label').text().includes('Couleur'));
  if (colorRow.length) {
    productData.available_color = colorRow.find('td.col.data').text().trim();
  }

  // Extracting Keywords (breadcrumbs)
  const keys = [];
  $('div.breadcrumbs-wrapper .breadcrumbs .items .item').each((i, el) => {
    const keyword = $(el).text().trim();
    if (keyword && keyword !== 'Accueil') { // Skip 'Accueil' as it's the home link
      keys.push(keyword);
    }
  });
  if (keys.length) {
    productData.keys = keys.join("/");
  }

  // If keywords are found, assign first element as category and last one as subcategory
  if (keys.length) {
    productData.category = keys[0]; // First element as category
    productData.subcategory = keys[keys.length - 1]; // Last element as subcategory
  }

  // Extracting Product Id
  const productId = $('meta[property="product:retailer_item_id"]').attr('content');
  if (productId) {
    productData.id_product = productId;
  }

  // Extracting Price
  const priceText = $('div.price-box.price-final_price .price-container .price-wrapper .price').text().trim();
  if (priceText) {
    productData.price = parseFloat(priceText.replace('€', '').trim().replace(',', '.')).toString();
  } else {
    const price = $('meta[property="product:price:amount"]').attr('content');
    if (price) {
      productData.price = parseFloat(price).toString();
    }
  }

  // Extracting Currency
  const currency = $('meta[property="product:price:currency"]').attr('content');
  if (currency) {
    productData.currency = currency;
  }

  // Extracting Product Name
  const productName = $('meta[property="og:title"]').attr('content');
  if (productName) {
    productData.product_name = productName;
  }

  // Extracting Availability
  const availability = $('meta[property="product:availability"]').attr('content');
  if (availability) {
    productData.availability = availability === 'in stock' ? true : false;
  }

  // Extracting Description (cleaning HTML)
  const description = $('meta[property="og:description"]').attr('content');
  if (description) {
    const textOnly = $.text().replace(/\s+/g, ' ').trim(); // Remove any HTML tags
    productData.description = textOnly;
  }

  return productData;
};

const extractDorcel = async (data) => {
  const { url, offerId, key } = data;
  let productData;
  try{
    const htmlContent = await scrapeDorcel(url);
    productData = getDataDorcel(htmlContent);

    productData = validateProductData({
      ...productData,
      url,
      id_product_smi: key,
      offer_id: offerId
    });
    
    // Saving product data
    const addedProduct = await addProduct({
      ...productData,
    });
    console.log("Product data saved successfully");

    return addedProduct;
  }
  catch(error){
    console.error(`Extracting error: ${error.message}`);
    await createFailed({
      idProductSmi: key,
      url,
      offerId,
      errorMessage: error.message,
      idProduct: productData?.id_product
    });
  }
};

const checkUrl = (url) => {
  try {
    const parsedUrl = new URL(url);

    // Get the pathname of the URL (without query parameters or hash fragments)
    const pathName = `${parsedUrl.pathname}`;

    // Split the pathname into segments
    const pathSegments = pathName.split('/').filter(Boolean); // Remove empty segments

    // Determine if it's a homepage
    const isHomePage = 
      pathSegments.length === 0 || // No segments (e.g., "/")
      (pathSegments.length === 1 && isValidLanguageCode(pathSegments[0])) || // Single language code (e.g., "/fr/")
      (pathSegments.length === 2 && isValidLanguageCode(pathSegments[0]) && isValidLanguageCode(pathSegments[1])) || // Two language codes
      (pathSegments.length === 3 && isValidLanguageCode(pathSegments[0]) && isValidLanguageCode(pathSegments[1]) && isValidLanguageCode(pathSegments[2])); // Three language codes

    const valid = !isHomePage;
    const pageType = isHomePage ? 'Homepage' : 'Non-Homepage';

    // Return the validation result
    return {
      url,
      valid,
      message: `The URL represents a ${pageType}.`
    };
  } catch (error) {
    return { url, valid: false, message: `Invalid URL format.${error}`};
  }
};

const createInvalid = async (data) => {
  try {
    const result = await addInvalidProduct(data);
    return result;
  } catch (error) {
    console.error("Error adding a new invalid product :", error.message);
    throw error;
  }
};

const getPageContent = async (data) => {
  const { url, offerId, key } = data
  try {
    const isNotAllowed = SKIPPED_IDS.includes(offerId);

    if(isNotAllowed){
      await createInvalid({idProductSmi: key, offerId, url, reason : 'This brand is not allowed to be scraped'})
      console.log('This brand is not allowed to be scraped');
      return;
    }

    // Check if the brand is Dorcel Store
    if(offerId == DORCEL_ID){
      await extractDorcel({ url, offerId, key });
      return;
    }

    const { content, finalUrl } = await scrapePage(url, offerId, key);
    if(content){
      sendToQueue(PRODUCTS_QUEUE, {
        url : finalUrl,
        model : MODEL_NAME,
        key,
        offerId,
        content,
      });
    }
  } catch (error) {
    await createFailed({
      idProductSmi: key,
      url,
      offerId,
      errorMessage: error.message,
    });
  }
};

const extractOne = async (data) => {
  const { url, offerid, key } = data
  const offerId = offerid;
  let productData;
  try {
    const isNotAllowed = SKIPPED_IDS.includes(offerId);

    if(isNotAllowed){
      await createInvalid({idProductSmi: key, offerId, url, reason : 'This brand is not allowed to be scraped'})
      console.log('This brand is not allowed to be scraped');
      return;
    }

    // Check if the brand is Dorcel Store
    if(offerId == DORCEL_ID){
      const addedProduct = await extractDorcel({ url, offerId, key });
      return addedProduct;
    }
    else{
      const { content, finalUrl } = await scrapePage(url, offerId, key);
      if(content){
        // Data extraction step
        start = Date.now();
        productData = await getProductData({ content, model: MODEL_NAME, url: finalUrl, api_key: API_KEYS[0] });
        console.log("Product data extracted successfully");
        console.log(
          "Data extraction duration:",
          (Date.now() - start) / 1000,
            "seconds"
        );
      }
      else{
        return 'No content extracted, URL can be invalid.'
      }

      let savedData = {
        ...productData,
        url,
        id_product_smi: key,
        offer_id: offerId,
      };

      savedData = validateProductData(savedData);
      const addedProduct = await addProduct(savedData);
      console.log("Product data saved successfully");

      return addedProduct;
    }

  } catch (error) {
    await createFailed({
      idProductSmi: key,
      url,
      offerId,
      errorMessage: error.message,
      idProduct: productData?.id_product
    });
  }
};

const setResolved = async () => {
  try{
    const [ productsIds, failedIds ] = await Promise.all([
      getAllProductsSmiIds(),
      getUnresolvedFailedIds()
    ]);

    const resolvedFailedIds = failedIds.filter(id => productsIds.includes(id));
    console.log('resolvedFailedIds = ', resolvedFailedIds)
    const result = await setResolvedFailed(resolvedFailedIds);
    return result;
  }
  catch(error){
    throw error;
  }
};

module.exports = {
  scrapePage,
  getProductData,
  extractDataFromFile,
  extractData,
  createFailed,
  scrapeDorcel,
  getDataDorcel,
  extractDorcel,
  checkUrl,
  extractOne,
  getPageContent,
  setResolved,
};
