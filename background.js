const currentDate = new Date();
const firstDate = new Date(
  currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1)
);
const lastDate = new Date(
  currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7)
);
var firstDateStr = formatDate(firstDate);
var lastDateStr = formatDate(lastDate);

var currentDateStr = formatDate(new Date());

function formatDate(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function secondsToHoursMinutes(totalSeconds) {
  totalSeconds = Number(totalSeconds);
  hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  minutes = Math.floor(totalSeconds / 60);
  return {
    str: `${hours}:${minutes}`,
    hours: Number(hours),
    minutes: Number(minutes)
  };
}

function setBadge() {
  let color = "red";
  if (dayFlag) {
    chrome.browserAction.setBadgeText({ text: day.str }, () => {});
    if (day.hours >= 8) {
      color = "green";
    } else {
      color = "red";
    }
  } else {
    chrome.browserAction.setBadgeText({ text: week.str }, () => {});
    if (week.hours >= 40 || week.hours >= new Date().getDay() * 8) {
      color = "green";
    } else {
      color = "red";
    }
  }
  chrome.browserAction.setBadgeBackgroundColor({ color }, () => {});
}

const url = `https://login.timedoctor.com/individual-timesheet?fromDate=${firstDateStr}&routeParam=false&selectedUserId=false&timezone=33&toDate=${lastDateStr}`;

let dayFlag = false;

chrome.browserAction.onClicked.addListener(function() {
  dayFlag = !dayFlag;
  setBadge();
});

let day = { str: "", hours: 0 };
let week = { str: "", hours: 0 };

setInterval(() => {
  fetch(url)
    .then(resp => {
      return resp.json();
    })
    .then(res => {
      const user = res.users[Object.keys(res.users)[0]];
      week = secondsToHoursMinutes(user.totaltime);
      day = secondsToHoursMinutes(user.timeline[currentDateStr].worktime);

      setBadge();
    })
    .catch(err => {
      console.log("err: ", err);
      chrome.tabs.create({ url: "https://login.timedoctor.com/" });
    });
}, 60 * 1000);
