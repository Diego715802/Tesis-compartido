import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: {
      main: "#1C84C6",
      dark: "#166B9F",
      light: "#EAF5FB",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#23C6C8",
      dark: "#17999B",
      light: "#E6F8F8",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FFFFFF",
      paper: "#FDFDFD",
    },
    text: {
      primary: "#4B4E51",
      secondary: "#676A6C",
      disabled: "#A8AAAB",
    },
    divider: "#E7EAEC",
  },
  shape: {
    borderRadius: 2,
  },
  typography: {
    fontFamily:
      'var(--font-roboto), Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: 13,
    h1: {
      fontWeight: 500,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 500,
      letterSpacing: "-0.015em",
    },
    h3: {
      fontWeight: 500,
      letterSpacing: "-0.015em",
    },
    button: {
      fontWeight: 500,
      letterSpacing: 0,
      textTransform: "none",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFeatureSettings: '"kern" 1, "liga" 1',
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiTooltip: {
      defaultProps: {
        arrow: true,
        enterDelay: 450,
      },
      styleOverrides: {
        tooltip: {
          padding: "7px 10px",
          borderRadius: 2,
          backgroundColor: "#3F3F3F",
          fontSize: "0.75rem",
          fontWeight: 500,
        },
        arrow: {
          color: "#3F3F3F",
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          minWidth: 0,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          minWidth: 0,
          maxWidth: "100%",
          "&.MuiInputBase-multiline textarea": {
            overflowWrap: "anywhere",
            textOverflow: "clip",
            whiteSpace: "pre-wrap",
          },
        },
        input: {
          minWidth: 0,
          maxWidth: "100%",
          textOverflow: "ellipsis",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          maxWidth: "calc(100% - 30px)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          maxWidth: "100%",
          overflowWrap: "anywhere",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        },
      },
    },
  },
});
