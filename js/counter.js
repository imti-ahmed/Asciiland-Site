// The visitor pill: counts page views with the owner's own counter service (imticounter.vercel.app).
// Every page load on the live site adds 1. On your own computer (npm run dev) it only reads the number,
// so working on the site doesn't inflate the count. If the service can't be reached, the pill shows a dash.
var SERVICE = "https://imticounter.vercel.app";
var NAMESPACE = "asciiland", KEY = "home";   // the site name and counter name; change KEY to start a fresh count from 0
var TIMEOUT = 6000;                          // ms to wait per try; the service's database can be slow to wake up

var el = document.getElementById("count");
var host = location.hostname;
var local = host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "";

function show(n) { el.textContent = Number(n).toLocaleString("en-US"); }

function request(action) {
  var ctrl = new AbortController();
  var timer = setTimeout(function () { ctrl.abort(); }, TIMEOUT);
  return fetch(SERVICE + "/" + action + "/" + NAMESPACE + "/" + KEY, { signal: ctrl.signal })
    .then(function (r) {
      if (r.status === 404) return { value: 0 };      // nobody has visited the live site yet
      if (!r.ok) throw new Error("counter " + r.status);
      return r.json();
    })
    .finally(function () { clearTimeout(timer); });
}

// The retry only reads: a timed-out "hit" may already have been counted, so hitting again could count twice.
request(local ? "get" : "hit")
  .catch(function () { return request("get"); })
  .then(function (d) { show(d.value); })
  .catch(function () { el.textContent = "\u2014"; });
