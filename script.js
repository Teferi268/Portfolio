const themeButton = document.querySelector("#theme-btn");
const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
    document.body.classList.toggle("darkmode", savedTheme === "dark");
}

const updateThemeButton = () => {
    const isDarkMode = document.body.classList.contains("darkmode");
    themeButton.setAttribute("aria-label", isDarkMode ? "Activer le mode clair" : "Activer le mode sombre");
    themeButton.setAttribute("aria-pressed", String(isDarkMode));
};

updateThemeButton();

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("darkmode");
    localStorage.setItem("theme", document.body.classList.contains("darkmode") ? "dark" : "light");
    updateThemeButton();
});

const path = document.querySelector(".path");
const links = document.querySelectorAll(".nav-link");

links.forEach((link) => {
  link.addEventListener("click", () => {
    const pageName = link.textContent;
    path.textContent = `@mathieu-morin-dev/${pageName}`;
  });
});