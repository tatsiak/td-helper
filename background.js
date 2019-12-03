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
let bgColor = "red";
let lastTotalTime = 0;

const formatSeconds = totalSeconds => {
  totalSeconds = Number(totalSeconds);
  hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  minutes = Math.floor(totalSeconds / 60);
  return {
    str: `${hours}:${minutes}`,
    hours: Number(hours),
    minutes: Number(minutes),
    timestamp: totalSeconds * SECOND
  };
};

const dateToString = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;
  const day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
  return `${year}-${month}-${day}`;
};

const setBadge = isLoggingTime => {
  if (isLoggingTime) {
    if (dayOrWeekFlag) {
      chrome.browserAction.setTitle({ title: `${8 - day.hours} hours left.` });
      chrome.browserAction.setBadgeText({ text: day.str }, () => {});
      if (day.hours >= 8) {
        bgColor = "green";
        chrome.browserAction.setTitle({ title: "Well done! Enough for today." });
      } else {
        bgColor = "red";
      }
    } else {
      const hoursShouldBeDoneTillTomorrow = new Date().getDay() * 8;
      chrome.browserAction.setTitle({ title: `${hoursShouldBeDoneTillTomorrow - week.hours} hours left.` });
      chrome.browserAction.setBadgeText({ text: week.str }, () => {});
      if (week.hours >= 40 || week.hours >= hoursShouldBeDoneTillTomorrow) {
        bgColor = "green";
        chrome.browserAction.setTitle({ title: "Well done! Enough for today." });
      } else {
        bgColor = "red";
      }
    }
  } else {
    chrome.browserAction.setTitle({ title: `You probably not logging time. Current status: ${status}` });
    chrome.browserAction.setBadgeText({ text: "time!" }, () => {});
    bgColor = "purple";
    sound.play();
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
      const isLoggingTime = lastTotalTime !== user.totaltime;
      lastTotalTime = user.totaltime;
      week = formatSeconds(user.totaltime);
      day = formatSeconds(user.timeline[dateToString(new Date())].worktime);
      status = user.statusCodeInfo;
      setBadge(isLoggingTime);
    })
    .catch(err => {
      chrome.browserAction.setTitle({ title: "something going wrong" });
      console.error(err);
      chrome.tabs.create({ url: host });
    });
};

setInterval(() => {
  getData();
}, 15 * MINUTE);

chrome.browserAction.onClicked.addListener(() => {
  dayOrWeekFlag = !dayOrWeekFlag;
});
