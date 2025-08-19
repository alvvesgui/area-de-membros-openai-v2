/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Seus tokens de design ou extensões de tema podem vir aqui.
      // Por exemplo, se você definiu `--font-geist-sans` no CSS,
      // você pode querer configurar a fonte aqui:
      // fontFamily: {
      //   sans: ['var(--font-geist-sans)'],
      //   mono: ['var(--font-geist-mono)'],
      // },
    },
  },
  plugins: [
    // Adicione estes plugins (ou os que você realmente está usando para suas @diretivas)
    require('@tailwindcss/typography'), // Se você usa classes como prose
    require('@tailwindcss/forms'),     // Se você usa formulários padronizados
    require('@tailwindcss/container-queries'), // <-- MUITO PROVAVELMENTE PARA @custom-variant
    // Se @theme inline ainda causar problemas, pode ser um plugin personalizado
    // ou uma forma de usar `@layer theme` com `@apply` no CSS.
    // Se você tiver um setup de tema mais avançado que usa "@theme",
    // talvez precise de um plugin específico para isso.
  ],
};