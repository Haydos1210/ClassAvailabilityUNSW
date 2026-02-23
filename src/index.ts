import {
  	scrapeCourses
} from "./Backend/Scraper/Scaper";

import {
	TargetCourses
} from "./Backend/Scraper/Interface";

const courses: TargetCourses[] = [
	{
		courseCode: "COMP1511",
		targetClassIDs: [
			"9750",
			"9755"
		]
	},
	{
		courseCode: "COMP1521",
		targetClassIDs: [
			"9984",
			"9995"
		]
	},
	{
		courseCode: "ACCT2511",
		targetClassIDs: [
			"13808",
			"11469"
		]
	}
]
async function main() {
  	const result = await scrapeCourses(2026, "T1", courses);
  	console.log(result);
}

main();