import puppeteer from "puppeteer";
/**
 * The scraper that scrapes the timetable site
 *
 * @param {number} year - The year for which the information is to be scraped
 * @returns {Promise<{ timetableData: TimetableData; warnings: Warning[] }} The data that has been scraped, grouped into one of 6 terms. If the scraper is unable to classify courses, then it will group them under 'Other'
 * @returns {false}: Scraping failed due to some error. Error printed to console.error
 * @example
 * 1.
 *    const data = await timetableScraper(2020)
 *    console.log(data.timetableData.T1) // Expect list of T1 courses in 2020
 * 2.
 *    const data = await timetableScraper(40100)
 *    console.log(data) // false
 */
const scrapeCourse = async (
  year: number,
  courseCode: string,
  term: string
): Promise<
  | {
      timetableData: TimetableData;
      courseWarnings: CourseWarning[];
      lastUpdated: number;
    }
  | false
> => {
  // Launch the browser. Headless mode = true by default
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });
  try {
    const page = await browser.newPage();
    // Base url to be used for all scraping
    const base = `http://timetable.unsw.edu.au/${year}/`;

    // TODO: handle error checking for course code(using regex)

    // Go to the page with list of subjects (Accounting, Computers etc)
    await page.goto(base + courseCode + ".html", {
      waitUntil: "networkidle2",
    });

    // TODO: call scrape page function

    // TODO: filter and return list of available classes

    // Close the browser.
    return {
      listOfClasses,
      lastUpdated: Date.now(),
    };
  } catch (err) {
    // Log error and close browser.
    console.error(err);
    return false;
  } finally {
    await browser.close();
  }
};