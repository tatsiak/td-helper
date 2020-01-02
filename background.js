const beepSound = new Audio(chrome.runtime.getURL("./sounds/beep.mp3"));
const completeSound = new Audio(chrome.runtime.getURL("./sounds/complete.mp3"));
const motivationQuotes = [
  "Passion is the result of action, not the cause of it.",
  "Never put off until tomorrow what can be done today.",
  "Promise little and do much.",
  "Always deliver more than expected.",
  "Always work hard on something uncomfortably exciting.",
  "If you are born poor it’s not your mistake, but if you die poor it’s your mistake.",
  "Whether you think you can, or you think you can’t – you’re right.",
  "The work praises the man.",
  "A bad workman always blames his tools.",
  "Don’t wish it were easier. Wish you were better.",
  "Do the hard jobs first. The easy jobs will take care of themselves.",
  "The future depends on what you do today.",
  "The man who moves a mountain begins by carrying away small stones.",
  "You don’t have to see the whole staircase, just take the first step.",
  "Luck is a matter of preparation meeting opportunity."
];

const randomQuote = motivationQuotes[Math.floor(Math.random() * Math.floor(motivationQuotes.length - 1))];
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const red = "hsl(0, 100%, 66%)";
const green = "hsl(80, 100%, 30%)";
const blue = "hsl(264, 100%, 50%)";
const pink = "hsl(315, 100%, 40%)";

const getDataUrl = () => {
  const curr = new Date();
  const curDay = curr.getDay() || 7;
  const first = curr.getDate() - curDay + 1;
  const last = first + 6;
  const firstday = new Date(new Date().setDate(first));
  const lastday = new Date(new Date().setDate(last));

  const host = "https://login.timedoctor.com/";
  return `${host}individual-timesheet?fromDate=${dateToString(firstday)}&routeParam=false&selectedUserId=false&timezone=33&toDate=${dateToString(lastday)}`;
};

const numToStr = number => (number < 10 ? `0${number}` : `${number}`);

const formatSeconds = totalSeconds => {
  const persistentTotalSeconds = totalSeconds;
  totalSeconds = Number(totalSeconds);
  hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  minutes = Math.floor(totalSeconds / 60);
  return {
    str: `${hours}:${numToStr(minutes)}`,
    hours: Number(hours),
    minutes: Number(minutes),
    totalSeconds: persistentTotalSeconds
  };
};

const hoursToSeconds = hours => hours * 60 * 60;

const dateToString = date => {
  const year = date.getFullYear();
  const month = numToStr(date.getMonth() + 1);
  const day = numToStr(date.getDate());
  return `${year}-${month}-${day}`;
};

let dayOrWeekFlag = false;
let day = false;
let week = false;
let status = "";
let lastTotalTime = 0;
let lastGetTimestamp = 0;

const setBadge = isLoggingTime => {
  let hoursShouldBeDoneTillTomorrow = new Date().getDay() * 8;
  hoursShouldBeDoneTillTomorrow = hoursShouldBeDoneTillTomorrow >= 40 ? 40 : hoursShouldBeDoneTillTomorrow;

  if (isLoggingTime || status === "Working") {
    if (week.hours >= hoursShouldBeDoneTillTomorrow) {
      completeSound.play();
      chrome.browserAction.setTitle({ title: "Well done! Enough for today." });
      chrome.browserAction.setBadgeBackgroundColor({ color: green }, () => {});
    } else {
      chrome.browserAction.setBadgeBackgroundColor({ color: red }, () => {});
      if (dayOrWeekFlag && day) {
        const dayTimeLeft = formatSeconds(hoursToSeconds(8) - day.totalSeconds);
        chrome.browserAction.setTitle({
          title: `After ${dayTimeLeft.str} of work you will make your day norm.\nDo your best!\n\n“${randomQuote}”`
        });
      } else if (week) {
        const weekTimeLeft = formatSeconds(hoursToSeconds(hoursShouldBeDoneTillTomorrow) - week.totalSeconds);
        chrome.browserAction.setTitle({
          title: `After ${weekTimeLeft.str} of work you will keep up with your week norm.\nDo your best!\n\n“${randomQuote}”`
        });
      }
    }
    if (dayOrWeekFlag && day) {
      chrome.browserAction.setBadgeText({ text: day.str }, () => {});
    } else if (week) {
      chrome.browserAction.setBadgeText({ text: week.str }, () => {});
    }
  } else {
    chrome.browserAction.setTitle({ title: `You probably not logging time. Current status: ${status}` });
    chrome.browserAction.setBadgeText({ text: "time!" }, () => {});
    chrome.browserAction.setBadgeBackgroundColor({ color: blue }, () => {});
    beepSound.play();
  }
};

const getData = shouldSetBadge => {
  shouldSetBadge && setBadge(true);
  if (new Date() - 2 * MINUTE < lastGetTimestamp) {
    return;
  }
  lastGetTimestamp = new Date();
  const url = getDataUrl();
  console.log("data url: ", url);

  fetch(url)
    .then(response => {
      return response.json();
    })
    .then(json => {
      const user = json.users[Object.keys(json.users)[0]];
      console.log("response user: ", user);

      const isLoggingTime = lastTotalTime !== user.totaltime;
      lastTotalTime = user.totaltime;
      const loggedToday = user.timeline[dateToString(new Date())];
      day = !!loggedToday && formatSeconds(loggedToday.worktime);
      week = !!lastTotalTime && formatSeconds(lastTotalTime);
      status = user.statusCodeInfo;
      setBadge(shouldSetBadge || isLoggingTime);
    })
    .catch(err => {
      chrome.browserAction.setTitle({ title: "something went wrong" });
      chrome.browserAction.setBadgeBackgroundColor({ color: pink }, () => {});
      chrome.browserAction.setBadgeText({ text: "err!" }, () => {});
      console.error(err);
    });
};

setInterval(() => {
  getData();
}, 10 * MINUTE);

chrome.browserAction.onClicked.addListener(() => {
  dayOrWeekFlag = !dayOrWeekFlag;
  getData(true);
});
