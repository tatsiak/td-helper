const beepSound = new Audio(chrome.runtime.getURL("./sounds/beep.mp3"));

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const blue = "hsl(264, 100%, 50%)";
const pink = "hsl(315, 100%, 40%)";

const getDataUrl = () => {
  const numToStr = number => (number < 10 ? `0${number}` : `${number}`);

  const dateToString = date => {
    const year = date.getFullYear();
    const month = numToStr(date.getMonth() + 1);
    const day = numToStr(date.getDate());
    return `${year}-${month}-${day}`;
  };

  const curr = new Date();
  const curDay = curr.getDay() || 7;
  const first = curr.getDate() - curDay + 1;
  const last = first + 6;
  const firstday = new Date(new Date().setDate(first));
  const lastday = new Date(new Date().setDate(last));

  const host = "https://login.timedoctor.com/";
  return `${host}individual-timesheet?fromDate=${dateToString(firstday)}&routeParam=false&selectedUserId=false&timezone=33&toDate=${dateToString(lastday)}`;
};

let lastTotalTime = 0;

const setBadge = isLoggingTime => {
  if (!isLoggingTime) {
    chrome.browserAction.setTitle({ title: `You probably not logging time. Check TD` });
    chrome.browserAction.setBadgeText({ text: "time!" }, () => {});
    chrome.browserAction.setBadgeBackgroundColor({ color: blue }, () => {});
    beepSound.play();
  }
};

let lastGetTime = 0;

const getData = () => {
  if (new Date() - lastGetTime < 1 * MINUTE) return;

  lastGetTime = new Date();
  const url = getDataUrl();

  fetch(url)
    .then(response => {
      return response.json();
    })
    .then(json => {
      const user = json.users[Object.keys(json.users)[0]];

      const isLoggingTime = lastTotalTime !== user.totaltime;
      lastTotalTime = user.totaltime;
      setBadge(isLoggingTime);
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
}, 2 * MINUTE);

chrome.browserAction.onClicked.addListener(() => {
  getData();
});
