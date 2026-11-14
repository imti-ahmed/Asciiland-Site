// The visitor pill: counts page views with a free outside counter service (abacus.jasoncameron.dev).
// Every page load on the live site adds 1. On your own computer (npm run dev) it only reads the number,
// so working on the site doesn't inflate the count. If the service can't be reached, the pill shows a dash.
var SERVICE = "https://abacus.jasoncameron.dev";
var NAMESPACE = "asciiland-site", KEY = "views";   // change KEY to start a fresh count from 0

var el = document.getElementById("count");
var host = location.hostname;
var local = host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "";
var url = SERVICE + "/" + (local ? "get" : "hit") + "/" + NAMESPACE + "/" + KEY;

function show(n) { el.textContent = Number(n).toLocaleString("en-US"); }

fetch(url)
  .then(function (r) {
    if (r.status === 404) return { value: 0 };      // nobody has visited the live site yet
    if (!r.ok) throw new Error("counter " + r.status);
    return r.json();
  })
  .then(function (d) { show(d.value); })
  .catch(function () { el.textContent = "\u2014"; });
