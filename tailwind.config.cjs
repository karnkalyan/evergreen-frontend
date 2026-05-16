const colors = require('tailwindcss/colors');
const typography = require('@tailwindcss/typography');

module.exports = {
  content: ['./index.html', './*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}', './context/**/*.{js,jsx,ts,tsx}', './lib/**/*.{js,jsx,ts,tsx}', './pages/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        primaryStart: '#2bb6a6',
        primaryEnd: '#2f80ed',
        coral: '#FF7A7A',
        amber: {
          300: '#fcd34d',
          500: '#f59e0b',
        },
        slate: {
          ...colors.slate,
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      boxShadow: {
        'soft-md': '0 6px 18px rgba(16,24,40,0.06), 0 1px 2px rgba(16,24,40,0.04)',
        'soft-lg': '0 12px 40px rgba(16,24,40,0.08), 0 2px 4px rgba(16,24,40,0.05)',
        'gradient-glow': '0 0 20px -5px #2f80ed66, 0 0 10px -7px #2bb6a699',
      },
      borderRadius: {
        '2xl': '1rem',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(to right, #2bb6a6, #2f80ed)',
        'secondary-gradient': 'linear-gradient(to right, #fcd34d, #f59e0b)',
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.slate.600'),
            '--tw-prose-headings': theme('colors.slate.900'),
            '--tw-prose-lead': theme('colors.slate.600'),
            '--tw-prose-links': theme('colors.primaryEnd'),
            '--tw-prose-bold': theme('colors.slate.900'),
            '--tw-prose-counters': theme('colors.slate.500'),
            '--tw-prose-bullets': theme('colors.slate.400'),
            '--tw-prose-hr': theme('colors.slate.200'),
            '--tw-prose-quotes': theme('colors.slate.900'),
            '--tw-prose-quote-borders': theme('colors.slate.200'),
            '--tw-prose-captions': theme('colors.slate.500'),
            '--tw-prose-code': theme('colors.slate.900'),
            '--tw-prose-pre-code': theme('colors.slate.200'),
            '--tw-prose-pre-bg': theme('colors.slate.800'),
            '--tw-prose-th-borders': theme('colors.slate.300'),
            '--tw-prose-td-borders': theme('colors.slate.200'),
          },
        },
      }),
    },
  },
  plugins: [typography],
};
