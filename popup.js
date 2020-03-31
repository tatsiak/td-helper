const overworkButton = document.querySelector(".overwork");
const image = document.querySelector(".image");
const dayWeek = document.querySelector(".day-week");
const day = document.querySelector(".day");
const week = document.querySelector(".week");
const goodJob = document.querySelector(".good-job");

const WEEK_NORM_HOURS = 40 * 0.7;
const DAY_NORM_HOURS = WEEK_NORM_HOURS / 5;
let hoursShouldBeDoneTillTomorrow = new Date().getDay() * DAY_NORM_HOURS;
hoursShouldBeDoneTillTomorrow = hoursShouldBeDoneTillTomorrow >= WEEK_NORM_HOURS ? WEEK_NORM_HOURS : hoursShouldBeDoneTillTomorrow;

const hoursToSeconds = hours => hours * 60 * 60;

chrome.runtime.sendMessage({ type: "get-data" }, function(response) {
  console.log(`message from background: ${JSON.stringify(response)}`);

  dayWeek.checked = !response.dayOrWeekFlag;

  day.innerHTML = `day: ${response.day.str}`;
  week.innerHTML = `week: ${response.week.str}`;

  console.log("hoursShouldBeDoneTillTomorrow: ", hoursShouldBeDoneTillTomorrow);
  if (!response.overwork && response.week.totalSeconds >= hoursToSeconds(hoursShouldBeDoneTillTomorrow)) {
    goodJob.classList.add("flex");
  }
});

overworkButton.addEventListener("click", () => {
  goodJob.classList.remove("flex");
  chrome.runtime.sendMessage({ type: "overwork" }, () => {});
});

dayWeek.addEventListener("change", e => {
  chrome.runtime.sendMessage({ type: "day-week", value: !e.target.checked }, () => {});
});
