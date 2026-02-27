import {
  Page,
  Browser,
  Puppeteer
} from "puppeteer";

import puppeteer from "puppeteer";

import {
  ClassInfo,
  TargetCourses,
  createPagesParams
} from "./Interface";
/**
 * Scrapes timetable site to get info about certain classes
 *
 * @param {number} year - The year for which the information is to be scraped
 * @param {string} courseCode - the code for the course eg COMP1511
 * @param {string} term - the term which the class is intended to take place
 * @param {TargetCourses[]} targetCourses = course objects which contain ids of classes to be scraped
 * @returns {Promise{ listOfClasses: ClassInfo[]; lastUpdated: number; }} 
 * @returns {false}
 * @example
 * 1.
 *    const data = await scrapeCourse(2025, "COMP1511", "T1", ["9301", "9313"])
 *    console.log(data) // Expect class info for class with id 9301 and/or 9313 given their status is open
 * 2.
 *    const data = await scrapeCourse(500, "COMP1511", "T1", ["9301", "9313"])
 *    console.log(data) // false
 */
export const scrapeCourses = async (
  year: number,
  term: string,
  targetCourses: TargetCourses[]
): Promise<
  | {
      listOfClasses?: ClassInfo[];
      lastUpdated: number;
    }
  | false
> => {

 
  let hrefCode = null;
  if (term === 'SUMMER') {
    hrefCode = 'X1';
  } else if (term.match(/T[123]{1}/)) {
    hrefCode = "S" + term[1];
  } else {
    return false;
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });
  try {
    // Base url to be used for all scraping
    const base = `http://timetable.unsw.edu.au/${year}/`;

    // TODO: handle error checking for course code(using regex)

    // Go through each course to find classes

    const numPages = targetCourses.length;
    const pages = await createPages({
      browser: browser,
      batchsize: numPages,
    });

    // Scrape classes
    const listOfClasses: ClassInfo[] = [];
    for (let i = 0; i < numPages; i++) {
      const page = pages[i];
      page.on("console", msg => {
        console.log("PAGE:", msg.text());
      });

      const course = targetCourses[i];
      await page.goto(base + course.courseCode + ".html", {
        waitUntil: "networkidle2",
      });

      await scrapeClasses(course.courseCode, listOfClasses, hrefCode, page, course.targetClassIDs);
    }
    

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

const scrapeClasses = async(
  courseCode: string,
  listOfClasses: ClassInfo[],
  hrefCode: string,
  page: Page,
  classIds: string[]
): Promise< ClassInfo[] > => {
  for (const classId of classIds) {
    const classContent = await page.evaluate((courseCode, hrefCode, classId) => {
      console.log(`a[href="#${hrefCode}-${classId}"]`);
      const dataChild = document.querySelector(`a[href="#${hrefCode}-${classId}"]`);
      if (!dataChild) console.log("data not found");

      const tableParent = dataChild?.parentElement?.parentElement;
      if (!tableParent) console.log("parent not found");

      const children = tableParent?.children;
      if (!children) {
        console.log("table children not found");
        return null;
      }

      const status = children[4].querySelector('font[color="green"]')?.textContent;
      console.log(`Here is status: ${status}`);

      if (!status) {
        console.log("Class full");
        return null;
      }

      const activityElem = children[0].querySelector(`a[href="#${hrefCode}-${classId}"]`);
      let activity;
      if (activityElem) {
        activity = activityElem.textContent;
      } else return null;
      const date = children[6].textContent;

      return {
        courseCode: courseCode,
        classID: classId,
        isOpen: true,
        date: date,
        activity: activity
      }
    },
    courseCode,
    hrefCode,
    classId
    );
    if (classContent) {
      listOfClasses.push(classContent);
    }
  }
  return listOfClasses;
}

/**
 * Creates browser pages to then use to scrape the website
 *
 * @param {Browser} browser - browser object (window) in which to create new pages
 * @param {number} batchsize - Number of pages to be created
 * @returns {Promise<Page[]>}
 */
export const createPages = async ({ browser, batchsize }: createPagesParams): Promise<Page[]> => {
  // List of pages
  const pages: Page[] = [];
  for (let pageno = 0; pageno < batchsize; pageno++) {
    const singlepage = await browser.newPage();
    await singlepage.setRequestInterception(true);
    singlepage.on("request", (request) => {
      const type = request.resourceType();
      if (type === "document") {
        request.continue();
      } else {
        request.abort();
      }
    });
    pages.push(singlepage);
  }
  return pages;
};

