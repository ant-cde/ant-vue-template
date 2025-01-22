import { Icon } from '@iconify/vue'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

export const vuetify = createVuetify({
  defaults: {
    VNavigationDrawer: {
      elevation: 0,
    },
    VCard: {
      rounded: 'xl',
      flat: true,
      border: true,
    },
    VCardTitle: {
      style: 'white-space: break-spaces;',
    },
    VBtn: {
      rounded: 'xl',
      class: 'text-none',
    },
    VBtnToggle: {
      rounded: 'xl',
    },
    VBtnGroup: {
      rounded: 'xl',
    },
    VChip: {
      rounded: 'xl',
      borderColor: '#B8B8B8',
    },
  },
  theme: {
    themes: {
      light: {
        colors: {
          'background': '#fff', // Updated background color
          'subtitle': '#8F8B8B', // Grey color, for text
          'surface': '#FFFFFF', // Kept as white for contrast
          'surface-bright': '#85FFCD', // Light green, for highlighted surfaces
          'surface-light': '#125CFF', // Blue, for lighter elements on surfaces
          'surface-variant': '#E0E0E0', // Light grey, for variant surfaces
          'on-surface-variant': '#00003E', // Dark blue, text on variant surfaces
          'primary': '#125CFF', // Blue, primary branding color
          'primary-darken-1': '#1046B3', // Slightly darker blue, for hover states
          'secondary': '#85FFCD', // Coral, adjusted to match the style guide
          'secondary-darken-1': '#E07672', // Slightly darker coral, for hover states
          'error': '#B00020', // Default red, for errors
          'info': '#2196F3', // Default blue, for informational messages
          'success': '#4CAF50', // Default green, for success states
          'warning': '#FB8C00', // Default orange, for warnings
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    sets: {
      mdi: {
        component: Icon as any,
      },
    },
  },
})
