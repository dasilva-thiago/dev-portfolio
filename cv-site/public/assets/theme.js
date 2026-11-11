// Runs in <head> before first paint, like the portfolio's pre-paint script: applies the stored or
// system theme so the page never flashes the wrong one, and picks the landing page language.
(function () {
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem("darkMode");
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (saved === "true" || (saved === null && prefersDark)) root.classList.add("dark-mode");
    if (localStorage.getItem("highContrast") === "true") root.classList.add("high-contrast");
  } catch (e) {}
  if (root.hasAttribute("data-landing")) {
    var lang = null;
    try { lang = localStorage.getItem("lang"); } catch (e) {}
    if (lang !== "pt" && lang !== "en" && lang !== "es") {
      var nav = (navigator.language || "").slice(0, 2);
      lang = nav === "en" || nav === "es" ? nav : "pt";
    }
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", { pt: "pt-BR", en: "en", es: "es" }[lang]);
  }
})();
