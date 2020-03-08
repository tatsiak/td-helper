const overworkButton = document.querySelector(".overwork");
const image = document.querySelector(".image");
const dayWeek = document.querySelector(".day-week");
const day = document.querySelector(".day");
const week = document.querySelector(".week");
const goodJob = document.querySelector(".good-job");
const WEEK_NORM_HOURS = 40;

let hoursShouldBeDoneTillTomorrow = new Date().getDay() * 8;
console.log("hoursShouldBeDoneTillTomorrow: ", hoursShouldBeDoneTillTomorrow);

hoursShouldBeDoneTillTomorrow = hoursShouldBeDoneTillTomorrow >= WEEK_NORM_HOURS ? WEEK_NORM_HOURS : hoursShouldBeDoneTillTomorrow;

chrome.runtime.sendMessage({ type: "get-data" }, function(response) {
  console.log(`message from background: ${JSON.stringify(response)}`);

  dayWeek.checked = !response.dayOrWeekFlag;

  day.innerHTML = `day: ${response.day.str}`;
  week.innerHTML = `week: ${response.week.str}`;

  console.log("hoursShouldBeDoneTillTomorrow: ", hoursShouldBeDoneTillTomorrow);
  if (!response.overwork && response.week.hours >= hoursShouldBeDoneTillTomorrow) {
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
