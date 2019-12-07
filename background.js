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
  const currentDate = new Date();
  const firstDate = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1));
  const lastDate = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7));
  const host = "https://login.timedoctor.com/";
  return `${host}individual-timesheet?fromDate=${dateToString(firstDate)}&routeParam=false&selectedUserId=false&timezone=33&toDate=${dateToString(lastDate)}`;
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
let day = { str: "", hours: 0 };
let week = { str: "", hours: 0 };
let status = "";
let bgColor = "";
let lastTotalTime = 0;

const setBadge = isLoggingTime => {
  if (isLoggingTime || status === "Working") {
    if (dayOrWeekFlag) {
      chrome.browserAction.setBadgeText({ text: day.str }, () => {});
      if (day.hours >= 8) {
        bgColor = green;
        chrome.browserAction.setTitle({ title: "Well done! Enough for today." });
        completeSound.play();
      } else {
        const timeLeftStr = formatSeconds(hoursToSeconds(8) - day.totalSeconds).str;
        chrome.browserAction.setTitle({
          title: `After ${timeLeftStr} of work you will make your day norm.\nDo your best!\n\n“${randomQuote}”`
        });
        bgColor = red;
      }
    } else {
      const hoursShouldBeDoneTillTomorrow = new Date().getDay() * 8;
      chrome.browserAction.setBadgeText({ text: week.str }, () => {});
      if (week.hours >= 40 || week.hours >= hoursShouldBeDoneTillTomorrow) {
        bgColor = green;
        chrome.browserAction.setTitle({ title: "Well done! Enough for today." });
        completeSound.play();
      } else {
        const timeLeftStr = formatSeconds(hoursToSeconds(40) - week.totalSeconds).str;
        chrome.browserAction.setTitle({
          title: `After ${timeLeftStr} of work you will keep up with your week norm.\nDo your best!\n\n“${randomQuote}”`
        });
        bgColor = red;
      }
    }
  } else {
    chrome.browserAction.setTitle({ title: `You probably not logging time. Current status: ${status}` });
    chrome.browserAction.setBadgeText({ text: "time!" }, () => {});
    bgColor = blue;
    beepSound.play();
  }
  chrome.browserAction.setBadgeBackgroundColor({ color: bgColor }, () => {});
};

const getData = shouldSetBadge => {
  fetch(getDataUrl())
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
}, 15 * MINUTE);

chrome.browserAction.onClicked.addListener(() => {
  dayOrWeekFlag = !dayOrWeekFlag;
  getData(true);
});
