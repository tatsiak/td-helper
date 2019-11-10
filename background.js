const url = "https://login.timedoctor.com/#/dashboard_individual";

const contentCode = `
setTimeout(()=>{
  const weekEl = document.querySelector('#twtw')
  const dayEl = document.querySelector('#twt')
  if (weekEl && dayEl) {
    chrome.runtime.sendMessage({week: weekEl.innerText, day: dayEl.innerText}, ()=>{});
  } else {
    chrome.runtime.sendMessage({logout: true}, ()=>{});
  }
}, 1000)
`;

let day = false;

chrome.runtime.onMessage.addListener(function(request, sender) {
  console.log("request: ", request);

  if (!request.logout) {
    console.log("case");

    let text = day ? request.day : request.week;
    text = text && text.replace(" ", ":").replace(/[hm]/g, "");
    let color = "";
    const hours = Number(text && text.replace(/\:.*/, ""));
    if (day) {
      color = hours > 8 ? "green" : "red";
    } else {
      color = hours > 40 ? "green" : "red";
    }

    if (text && color) {
      chrome.browserAction.setBadgeText({ text });
      chrome.browserAction.setBadgeBackgroundColor({ color });
    }
  } else {
    chrome.browserAction.setBadgeText({ text: "" });
    chrome.windows.update(sender.tab.windowId, { focused: true }, () => {});
    chrome.tabs.update(sender.tab.id, { active: true }, tab => {});
  }
});

chrome.browserAction.onClicked.addListener(function(tab) {
  day = !day;
});

setInterval(() => {
  chrome.tabs.query({ url: "https://login.timedoctor.com/*" }, tabs => {
    if (!tabs.length) {
      chrome.tabs.create({ url, pinned: true, active: false }, () => {});
    } else {
      chrome.tabs.executeScript(tabs[0].id, { code: contentCode });
    }
  });
}, 1000);
