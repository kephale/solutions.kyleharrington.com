import baseTheme from "gatsby-theme-album/src/theme"
export const theme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    background: "#ffffff",
    primary: "#2da1e3",
    gray: ["#f1f1f1", "#cccccc", "#999999", "#777777"],
    modes: {
        ...baseTheme.colors.modes,
        dark: {
            ...baseTheme.colors.modes.dark,
            background: "#410041",
        }
    },
  },
}

export default theme