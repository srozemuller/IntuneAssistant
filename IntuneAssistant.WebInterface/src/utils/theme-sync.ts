export function getTheme(): "light" | "dark" {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        return savedTheme as "light" | "dark";
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
}

export function setTheme(theme: "light" | "dark") {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
}

export function toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
}