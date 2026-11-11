(function () {
  var root = document.documentElement;
  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }
  function sync() {
    document.querySelectorAll("[data-toggle=dark]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(root.classList.contains("dark-mode")));
    });
    document.querySelectorAll("[data-toggle=contrast]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(root.classList.contains("high-contrast")));
    });
    var lang = root.getAttribute("data-lang");
    if (lang) {
      document.querySelectorAll("[data-aria-" + lang + "]").forEach(function (el) {
        el.setAttribute("aria-label", el.getAttribute("data-aria-" + lang));
      });
      document.querySelectorAll("[data-set-lang]").forEach(function (b) {
        if (b.getAttribute("data-set-lang") === lang) b.setAttribute("aria-current", "true");
        else b.removeAttribute("aria-current");
      });
    }
  }
  document.addEventListener("click", function (event) {
    var target = event.target.closest("[data-toggle], [data-set-lang]");
    if (!target) return;
    var toggle = target.getAttribute("data-toggle");
    if (toggle === "dark") store("darkMode", String(root.classList.toggle("dark-mode")));
    if (toggle === "contrast") store("highContrast", String(root.classList.toggle("high-contrast")));
    var lang = target.getAttribute("data-set-lang");
    if (lang) {
      root.setAttribute("data-lang", lang);
      root.setAttribute("lang", { pt: "pt-BR", en: "en", es: "es" }[lang]);
      store("lang", lang);
    }
    sync();
  });
  // Opening a resume from the landing page remembers its language for the next visit.
  document.querySelectorAll("[data-remember-lang]").forEach(function (a) {
    a.addEventListener("click", function () { store("lang", a.getAttribute("data-remember-lang")); });
  });
  sync();
})();
