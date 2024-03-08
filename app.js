require('dotenv').config();

const express = require("express");
const app = express();

const port = process.env.PORT;

app.get("/", async (req, res) => {
  try {

    const problemsResponse = await fetch("https://codeforces.com/api/problemset.problems?tags=implementation");
    const problemsData = await problemsResponse.json();
    const problems = problemsData.result.problems;
    const submissionsResponse = await fetch("https://codeforces.com/api/user.status?handle=atharva_ask");
    const submissionsData = await submissionsResponse.json();

    const tagFrequency = {};

    submissionsData.result.forEach(result => {
      if (result.verdict !== "OK") {
        result.problem.tags.forEach(tag => {
          if (!tagFrequency[tag]) {
            tagFrequency[tag] = 1;
          } else {
            tagFrequency[tag]++;
          }
        });
      }
    });


    const sortedTags = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(entry => entry[0]);


    const filteredProblems = problems.filter(problem => {
      const problemTags = problem.tags;
      const commonTagsCount = problemTags.filter(tag => sortedTags.includes(tag)).length;
      return commonTagsCount >= 2;
    });

    res.json({ filteredProblems });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});