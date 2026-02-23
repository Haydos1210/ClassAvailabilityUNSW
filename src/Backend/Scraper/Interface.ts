import {
  Browser
} from "puppeteer";

/**
 * @interface: info returned by scrapeCourse
 */
interface ClassInfo {
  courseCode: string,
  classID: string;
  isOpen: boolean;
  date: string;
  activity: string;
}

/**
 * @interface: Input classes
 */
interface TargetCourses {
  courseCode: string;
  targetClassIDs: string[];
}

interface createPagesParams {
  browser: Browser;
  batchsize: number;
}

export {
  ClassInfo,
  TargetCourses,
  createPagesParams
}