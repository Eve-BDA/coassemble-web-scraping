import puppeteer from "puppeteer";

const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

const scrapeCourse = async () => {
  const browser = await puppeteer.launch({ 
    headless: false, 
    userDataDir: "./user_data" // saves login data
  });
  const page = await browser.newPage();
  
  // Add link to course 'overview' page
  await page.goto("https://learn.bdadyslexia.org.uk/preview/#/course/143557/overview", {
    waitUntil: "networkidle2",
  });

  console.log("Please log in manually, then press Enter in the console to continue...");

  // Pause to allow manual login
  await new Promise(resolve => {
    process.stdin.once("data", resolve);
  });

  // Initial data collection setup
  let hasNext = true;
  const courseData = [];

  while (hasNext) {
    // Collect page data
    const pageData = await page.evaluate(() => {
      let textContent = "";

      // Get all elements with the class 'txt-component-content'
      document.querySelectorAll(".txt-component-content").forEach(element => {
        textContent += element.innerText + " ";
      });

      // Get all <p> elements, regardless of class
      document.querySelectorAll("p").forEach(element => {
        textContent += element.innerText + " ";
      });

      return textContent.trim();
    });

    courseData.push(pageData);

    // Check if the "Next" button exists and try to click it
    hasNext = await page.evaluate(() => {
      const nextButton = document.querySelector('button.create.primary.icon-right.cobutton[type="button"]');
      if (nextButton) {
        console.log("Next button found, attempting to click");
        nextButton.click();
        return true;
      } else {
        console.log("Next button NOT found, ending navigation.");
        return false;
      }
    });

    // Use delay instead of page.waitForNavigation
    if (hasNext) {
      await delay(2000); // Adjust delay as necessary for content loading time
    }
  }

  console.log("Scraped Course Data:", courseData);
  await browser.close();
};

// Start the scraping process
scrapeCourse();
