import {
    scrapeCourse
} from "./Scraper/Scaper";

async function main() {
  const result = await scrapeCourse(2026, "COMP1511", "T1", ["9749"]);
  console.log(result);
}

main();