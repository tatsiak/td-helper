var currentDate = new Date();
var first = formatDate(
  new Date(
    currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1)
  )
);
var last = formatDate(
  new Date(
    currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7)
  )
);
var currentDateKey = formatDate(currentDate);

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
  if (dayFlag) {
    chrome.browserAction.setBadgeText({ text: day.str }, () => {});
    if (day.hours < 8) {
      chrome.browserAction.setBadgeBackgroundColor({ color: "red" }, () => {});
    } else {
      chrome.browserAction.setBadgeBackgroundColor(
        { color: "green" },
        () => {}
      );
    }
  } else {
    chrome.browserAction.setBadgeText({ text: week.str }, () => {});

    if (week.hours < 40) {
      chrome.browserAction.setBadgeBackgroundColor({ color: "red" }, () => {});
    } else {
      chrome.browserAction.setBadgeBackgroundColor(
        { color: "green" },
        () => {}
      );
    }
  }
}

const url = `https://login.timedoctor.com/individual-timesheet?fromDate=${first}&routeParam=false&selectedUserId=false&timezone=33&toDate=${last}`;

let dayFlag = false;

chrome.browserAction.onClicked.addListener(function(tab) {
  dayFlag = !dayFlag;
  setBadge()
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
      day = secondsToHoursMinutes(user.timeline[currentDateKey].worktime);
      setBadge()
    })
    .catch(err => {
      console.log("err: ", err);
      // chrome.tabs.create({ url: "https://timedoctor.com/" });
    });
}, 5000);
