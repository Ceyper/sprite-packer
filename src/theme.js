
export const themes = {
    LIGHT: "light",
    DARK: "dark",
}

function switchThemeClass(className) {
    Object.entries(themes).forEach((theme) => {
        document.body.classList.remove(theme[1]);
    });
    document.body.classList.add(className);
    localStorage.setItem("theme", className);
    currentTheme = className;
}

let currentTheme = themes.LIGHT;
export function light() {
    switchThemeClass(themes.LIGHT);
}

export function dark() {
    switchThemeClass(themes.DARK);
}

export function switchTheme() {
    if (currentTheme == themes.LIGHT) {
        dark();
    } else {
        light();
    }
}

export function getCurrentTheme() {
    return currentTheme;
}

export function initialize() {
    let theme = localStorage.getItem("theme") || themes.DARK;
    switchThemeClass(theme);
}


initialize();
