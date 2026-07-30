(() => {
  const balanceStylesheet = "/assets/css/layout-balance.css";

  try {
    const preload = document.createElement("link");
    preload.rel = "preload";
    preload.as = "style";
    preload.href = balanceStylesheet;
    document.head.append(preload);

    document.addEventListener(
      "DOMContentLoaded",
      () => {
        const alreadyLoaded = document.querySelector(
          `link[rel="stylesheet"][href="${balanceStylesheet}"]`
        );
        if (alreadyLoaded) return;

        const stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.href = balanceStylesheet;
        document.head.append(stylesheet);
      },
      { once: true }
    );

    const stored = localStorage.getItem("aastha-theme");
    const prefersDark = window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored === "dark" || stored === "light"
      ? stored
      : (prefersDark ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
  } catch (_) {
    document.documentElement.dataset.theme = "light";
  }
})();
