// The About and Story pills. Hovering one (or tapping it on a touch screen) opens the card below it.
// The opening and closing animation itself is in css/style.css (.card).
var menus = Array.prototype.slice.call(document.querySelectorAll(".menu"));

function close(m) { m.classList.remove("open"); m.querySelector(".link").setAttribute("aria-expanded", "false"); }

menus.forEach(function (m) {
  var btn = m.querySelector(".link");
  btn.addEventListener("click", function () {                 // tap (or keyboard) toggles the card
    var willOpen = !m.classList.contains("open");
    menus.forEach(close);
    if (willOpen) { m.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
  });
  m.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") close(m); });
});

document.addEventListener("pointerdown", function (e) {       // tapping anywhere else closes the cards
  menus.forEach(function (m) { if (!m.contains(e.target)) close(m); });
});
document.addEventListener("keydown", function (e) { if (e.key === "Escape") menus.forEach(close); });
