const currentDate = new Date();
const firstDate = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1));
const lastDate = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7));
const host = "https://login.timedoctor.com/";
const sound = new Audio(chrome.runtime.getURL("beep.mp3"));
const SECOND = 1000;
const MINUTE = 60 * SECOND;

let dayOrWeekFlag = false;
let day = { str: "", hours: 0 };
let week = { str: "", hours: 0 };
let status = "";
let notLoggingInterval = 0;
let bgColor = "red";

const formatSeconds = totalSeconds => {
  totalSeconds = Number(totalSeconds);
  hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  minutes = Math.floor(totalSeconds / 60);
  return {
    str: `${hours}:${minutes}`,
    hours: Number(hours),
    minutes: Number(minutes)
  };
};

// prettier-ignore
const randomColor = () => `#${Math.random().toString(16).substr(-6)}`;

const dateToString = date => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

const setBadge = () => {
  clearInterval(notLoggingInterval);

  if (status === "Working") {
    if (dayOrWeekFlag) {
      chrome.browserAction.setBadgeText({ text: day.str }, () => {});
      if (day.hours >= 8) {
        bgColor = "green";
      } else {
        bgColor = "red";
      }
    } else {
      chrome.browserAction.setBadgeText({ text: week.str }, () => {});
      if (week.hours >= 40 || week.hours >= new Date().getDay() * 8) {
        bgColor = "green";
      } else {
        bgColor = "red";
      }
    }
  } else {
    notLoggingInterval = setInterval(() => {
      const word = ["log", "time"][Math.round(Math.random())];
      chrome.browserAction.setBadgeText({ text: word }, () => {});
      bgColor = randomColor();
      chrome.browserAction.setBadgeBackgroundColor({ color: bgColor }, () => {});
      sound.play();
    }, 2000);
  }
  chrome.browserAction.setBadgeBackgroundColor({ color: bgColor }, () => {});
};

const getData = () => {
  fetch(`${host}individual-timesheet?fromDate=${dateToString(firstDate)}&routeParam=false&selectedUserId=false&timezone=33&toDate=${dateToString(lastDate)}`)
    .then(response => {
      return response.json();
    })
    .then(json => {
      const user = json.users[Object.keys(json.users)[0]];
      week = formatSeconds(user.totaltime);
      day = formatSeconds(user.timeline[dateToString(new Date())].worktime);
      status = user.statusCodeInfo;
      setBadge();
    })
    .catch(err => {
      console.log("err: ", err);
      chrome.tabs.create({ url: host });
    });
};

setInterval(() => {
  getData();
}, 2 * MINUTE);

chrome.browserAction.onClicked.addListener(() => {
  dayOrWeekFlag = !dayOrWeekFlag;
  getData();
});
