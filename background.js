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
var curr = formatDate(currentDate);

function formatDate(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

const url = `https://login.timedoctor.com/individual-timesheet?fromDate=${first}&routeParam=false&selectedUserId=false&timezone=33&toDate=${last}`;

fetch(url)
  .then(resp => {
    console.log("resp: ", resp);
    return resp.json();
  })
  .then(res => {
    console.log("res: ", res);
  });

let day = false;


chrome.browserAction.onClicked.addListener(function(tab) {
  day = !day;
});

setInterval(() => {
  fetch(url)
    .then(resp => {
      return resp.json();
    })
    .then(res => {
      console.log("res: ", res);
    }).catch(err => {
      chrome.tabs.create({url: 'https://timedoctor.com/'})
    })
}, 1000);
