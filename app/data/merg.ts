import { coursesBySubject } from "./subject";
import linksData from "../../../scraper/all_courses.json";
import fs from 'node:fs';

// Create a lookup map from the JSON: code -> link
const linkMap = new Map(
  linksData.map((item) => [item.code, item.link])
);

// Merge links into coursesBySubject
const mergedCourses = Object.fromEntries(
  Object.entries(coursesBySubject).map(([subject, courses]) => [
    subject,
    courses.map((course) => ({
      ...course,
      link: linkMap.get(course.code) || "",
    })),
  ])
);

// Log the result to copy-paste back, or export it

// write this json in to new file


fs.writeFileSync("./merged-courses.json", JSON.stringify(mergedCourses, null, 2));
