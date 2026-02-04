import puppeteer from "puppeteer";
import {
  ClassInfo 
} from "./Interface";
/**
 * Scrapes timetable site to get info about certain classes
 *
 * @param {number} year - The year for which the information is to be scraped
 * @param {string} courseCode - the code for the course eg COMP1511
 * @param {string} term - the term which the class is intended to take place
 * @param {string[]} classIds = the ids of classes to be scraped
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
const scrapeCourse = async (
  year: number,
  courseCode: string,
  term: string,
  classIds: string[]
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
    const page = await browser.newPage();

    page.on("console", msg => {
      console.log("PAGE:", msg.text());
    });
    // Base url to be used for all scraping
    const base = `http://timetable.unsw.edu.au/${year}/`;

    // TODO: handle error checking for course code(using regex)

    // Go to the page with list of subjects (Accounting, Computers etc)
    console.log(base + courseCode + ".html")
    await page.goto(base + courseCode + ".html", {
      waitUntil: "networkidle2",
    });

    const listOfClasses: ClassInfo[] = [];
    for (const classId of classIds) {
      const classContent = await page.evaluate((hrefCode, classId) => {
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
          classID: classId,
          isOpen: true,
          date: date,
          activity: activity
        }
      },
      hrefCode,
      classId
    );
      if (classContent) {
        listOfClasses.push(classContent);
      }
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

export {
  scrapeCourse
}