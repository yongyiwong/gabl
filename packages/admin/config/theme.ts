import type {} from '@material-ui/lab/themeAugmentation';
import { createTheme } from '@material-ui/core/styles';

export const bg = '#0F121F';
export const bgHover = 'rgba(15, 18, 31, 0.4)';
// #0F121F

export const primary = '#09EEBC';
export const primaryHover = 'rgba(9, 238, 188, 0.8)';
export const secondary =  '#272A35';
export const success = '#4caf50';
export const danger = '#E7353B';
export const textPrimary = '#FFFFFF';
export const textSecondary = 'rgba(255,255,255,0.5)';
export const textMuted =  'rgba(255,255,255,0.3)';

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: primary,
    },
    secondary: {
      main: secondary
    },
    error: {
      main: danger
    },
    background: {
      default: bg,
      paper: '#272A35'
    },
    text: {
      primary: textPrimary,
      secondary: textSecondary,
      disabled: textMuted
    }
  },
  overrides: {
    MuiIconButton: {
      root: {
        color: '#fff'
      }
    },
    MuiButton: {
      containedPrimary: {
        color: '#fff',
      },
      textSecondary: {
        color: textSecondary
      },
      root: {
        '&.Mui-disabled': {
          color: '#fff',
          opacity: 0.5,
        },
        '&.MuiButton-contained.Mui-disabled': {
          color: '#fff',
          opacity: 0.5,
        }
      }
    },
    MuiSvgIcon: {
      colorDisabled: {
        color: textMuted
      }
    },
    MuiChip: {
      colorPrimary: {
        color: '#fff'
      }
    },
    MuiAppBar: {
      colorPrimary: {
        color: '#fff'
      }
    },
    MuiFab: {
      primary: {
        color: '#fff'
      }
    },
    MuiListItem: {
      root: {
        '&$selected': {
          color: textPrimary,
          fontWeight: 600,
          backgroundColor: 'rgba(255,255,255,0.1)'
        },
        '&$selected:hover': {
          color: textPrimary,
          fontWeight: 600,
          backgroundColor: 'rgba(255,255,255,0.15) !important'
        },
        '&:hover': {
          backgroundColor: 'rgba(255,255,255,0.05) !important'
        },
      },
    },
    MuiToggleButton: {
      root: {
        color: '#fff',

        '&$selected': {
          color: bg,
          fontWeight: 600,
          backgroundColor: primary,
          borderColor: primary,
          borderRightColor: bgHover
        },
        '&$selected:hover': {
          backgroundColor: `${ primaryHover } !important`,
          borderColor: primaryHover,
          borderRightColor: bgHover
        }
      }
    },
    MuiListItemIcon: {
      root: {
        color: textMuted
      }
    },
    MuiCssBaseline: {
      '@global': {
        body: {
          background: bg,
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        },
        '.MuiContainer-maxWidthLg > .MuiGrid-container': {
          flexWrap:'initial !important' as 'initial',
        }
      },
    },
  }
});

export default theme;
