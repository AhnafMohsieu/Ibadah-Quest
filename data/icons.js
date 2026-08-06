// data/icons.js
// Original flat inline-SVG icon set (24x24, filled, currentColor -> theme-tinted).
// Replaces Font Awesome across the app. Every icon returns an <svg> string.

const IQ_ICONS = {
  mosque: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21h18v-2H3v2z"/><path d="M12 3c-3.5 2-5.5 4.5-5.5 7.5 0 1.2.3 2.2.8 3h9.4c.5-.8.8-1.8.8-3 0-3-2-5.5-5.5-7.5z"/><circle cx="12" cy="12.5" r="2.6"/><path d="M9.8 19v-2h4.4v2z"/></svg>',
  moon: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z"/></svg>',
  sun: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4.4"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3L19 19M19 5l-1.7 1.7M6.7 17.3L5 19"/></svg>',
  star: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l2.6 5.6 6.1.7-4.6 4.1 1.3 6L12 16.6 6.6 19.4l1.3-6L3.3 9.3l6.1-.7z"/></svg>',
  stopwatch: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="14" r="7"/><path d="M12 2v3M8.5 2h7"/><path d="M12 9.5V14l3 1.8"/></svg>',
  clock: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.2l3.6 2.1"/></svg>',
  hourglass: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10v3.5L12.8 12l4.2 6.5V22H7v-3.5l4.2-6.5L7 5.5z"/><path d="M9 4h6v1.8L12 10 9 5.8zM9 20v-1.8L12 14l3 4.2V20z"/></svg>',
  fire: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 2C13 6 10.5 7.5 8.8 9.2 6.5 11.5 5.5 13.8 5.5 16a6.5 6.5 0 0 0 13 0c0-2.6-1.4-5-3.2-6.8C13.4 7.4 14 4.5 13.5 2z"/></svg>',
  search: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.6-4.6"/></svg>',
  chart: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4 20V10M10 20V4M16 20v-8M22 20v-5"/></svg>',
  refresh: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8A6.5 6.5 0 1 0 18.5 16M18 8V3M18 8h-5"/></svg>',
  seed: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22V12M12 12C12 8 9 6 4 6c0 4 3 6 8 6zM12 12c0-3.2 2.4-5 6.5-5.2C18.4 10.5 15.8 12 12 12z"/></svg>',
  leaf: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4C10 4 4 8 4 14.5c0 3 1.6 5.2 4 6.2C9 16 12 12 20 4zM4 17c2 1.5 4.5 2.5 6.5 3"/></svg>',
  book: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3h11a3 3 0 0 1 3 3v15H7a3 3 0 0 1-3-3V4a1 1 0 0 1 1-1z"/><path d="M16 3a3 3 0 0 1 3 3v15H14V5a2 2 0 0 1 2-2z"/></svg>',
  bookQuran: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3h11a3 3 0 0 1 3 3v15H7a3 3 0 0 1-3-3V4a1 1 0 0 1 1-1z"/><path d="M12 6v7.6c0 .3-.4.5-.9.5-.5 0-1.6-.2-1.6-1.4V6z"/><path d="M16 3a3 3 0 0 1 3 3v15H14V5a2 2 0 0 1 2-2z"/></svg>',
  brain: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8.5 3.5A2.8 2.8 0 0 0 5.7 5a2.6 2.6 0 0 0-1.4 4.3A2.7 2.7 0 0 0 4.5 13a2.7 2.7 0 0 0 3.2 3.2A2.7 2.7 0 0 0 10 17V6.2a2.8 2.8 0 0 0-1.5-2.7zM15.5 3.5a2.8 2.8 0 0 1 2.8 1.5 2.6 2.6 0 0 1 1.4 4.3A2.7 2.7 0 0 1 19.5 13a2.7 2.7 0 0 1-3.2 3.2A2.7 2.7 0 0 1 14 17V6.2a2.8 2.8 0 0 1 1.5-2.7z"/><path d="M12 2v20"/></svg>',
  bookOpen: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M2 5c0 5 2.5 7 5.5 7.5V20c-2.5-.5-4-2-5.5-5.5zM22 5c0 5-2.5 7-5.5 7.5V20c2.5-.5 4-2 5.5-5.5z"/><path d="M12 5.5C10 4 8 3.5 5.5 3.5V12c2.5 0 4.5.5 6.5 2 2-1.5 4-2 6.5-2V3.5c-2.5 0-4.5.5-6.5 2z"/></svg>',
  heart: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20s-7-4.3-9.3-8.2C1 8.4 2.7 4.8 6.2 4.2c2-.3 3.9.6 5.8 2.8 1.9-2.2 3.8-3.1 5.8-2.8 3.5.6 5.2 4.2 3.5 7.6C19 15.7 12 20 12 20z"/></svg>',
  heartPulse: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20s-7-4.3-9.3-8.2C1 8.4 2.7 4.8 6.2 4.2c2-.3 3.9.6 5.8 2.8 1.9-2.2 3.8-3.1 5.8-2.8 3.5.6 5.2 4.2 3.5 7.6C19 15.7 12 20 12 20z"/><path d="M6 12h3l1.5-3.5L13 14l1.5-2h3"/></svg>',
  handsPraying: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 6.5c1.5-2.2 4-3.4 6.5-2.8v9.6c-2 .3-3.6 1.4-4.5 3.2-1-1.8-2.5-2.9-4.5-3.2V3.7c2.5-.6 5 .6 6.5 2.8z"/><path d="M12 6.5C10.5 4.3 8 3.1 5.5 3.7v9.6c2 .3 3.5 1.4 4.5 3.2 1-1.8 2.5-2.9 4.5-3.2V3.7C12 3.9 12 5 12 6.5z"/></svg>',
  droplet: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c4.5 5 7 8.4 7 12a7 7 0 0 1-14 0c0-3.6 2.5-7 7-12z"/><path d="M12 15.5a3 3 0 0 0-3 3"/></svg>',
  personPraying: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="4" r="2.4"/><path d="M10 8c-.3 2-1 3.5-2.4 5l1.8 2.2c1.8-1.3 3.6-2.8 4.6-5l-4-2.2z"/><path d="M5 22l4-4 2.5 2 4-5 2 .4-5 7.6-3.5-2L5 22z"/></svg>',
  person: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7" r="3.6"/><path d="M12 12.5c-4 0-7 2.6-7 6.5v1h14v-1c0-3.9-3-6.5-7-6.5z"/></svg>',
  personDress: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="6.5" r="3.4"/><path d="M12 12c-3.5 0-6.5 2.5-6.5 6.5V21h13v-2.5c0-4-3-6.5-6.5-6.5z"/></svg>',
  personCane: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="6" r="3.2"/><path d="M11 11c-3.5 0-6 2.3-6 6v1h4v-1.5c0-1.2.9-2.3 2-2.5z"/><path d="M14 9l6 11-2 1.5-6-11z"/></svg>',
  coin: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M9.8 9.4h4.6c0 1.4-1 2-2.3 2 1.3 0 2.3.7 2.3 2.2H9.8c0-1.5 1-2.2 2.3-2.2-1.3 0-2.3-.6-2.3-2z"/></svg>',
  coins: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><ellipse cx="12" cy="6" rx="6.5" ry="3.4"/><path d="M5.5 6v4.6c0 1.9 2.9 3.4 6.5 3.4s6.5-1.5 6.5-3.4V6c0 1.9-2.9 3.4-6.5 3.4S5.5 7.9 5.5 6z"/><path d="M5.5 10.6v4.4c0 1.9 2.9 3.5 6.5 3.5s6.5-1.6 6.5-3.5v-4.4c0 1.9-2.9 3.5-6.5 3.5s-6.5-1.6-6.5-3.5z"/></svg>',
  scale: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v2h-6v1h4a1 1 0 0 1 1 1v4a3 3 0 0 1-5 2.2V9.5h-4v4.7A3 3 0 0 1 5 12V8a1 1 0 0 1 1-1h4V6H4z"/><path d="M12 20h8M12 20v-3.5h8V20"/></svg>',
  shield: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l7 2.8v6.2c0 4.6-3 8.3-7 10-4-1.7-7-5.4-7-10V4.8z"/><path d="M8.5 12l2.4 2.4 4.6-4.8"/></svg>',
  handHeart: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M2 12v8h6l9-3.5c2.2-.8 3.5-2.9 3-5.2l-.5-2.8-4.5 1.7V8.5h2.5l-7.5-4.5c-1.3-.8-3-1-4.3-.2L2 7.2v2.4"/><path d="M8 15l2.5 1.2"/></svg>',
  handshake: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M2 8.5h4.5l3 2h9V8.5c-3-1-6-1.5-8-1.5l-4.5 1-2.5-1zM13 10.5l1.5 1.5c1 .8 2.4.8 3.4 0L20 10.2c1-1 1-2.7 0-3.7l-3.2-3.2-3.5 1.2-4 1.3-2 1-1.5.5M2 9.5v6c0 1.6 1.3 3 3 3h1l2.5-1.5 3.5 1 6-3.5"/><path d="M11.5 14l2.8 2.6"/></svg>',
  handsHolding: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 10.5L5.5 8.2A2.4 2.4 0 0 0 2 10.2c0 1 .5 1.9 1.4 2.5L8 15zM16 10.5l2.5-2.3A2.4 2.4 0 0 1 22 10.2c0 1-.5 1.9-1.4 2.5L16 15z"/><path d="M12 21c-2-1.8-4-3.4-5-5.5-.6-1.2-.2-2.6 1-3.2.8-.4 1.8-.2 2.4.5.6-.8 1.5-1 2.4-.5.8.4 1.2 1.4.8 2.4-.9 2-2.9 3.7-4.9 5.5zM12 21c2-1.8 4-3.4 5-5.5.6-1.2.2-2.6-1-3.2-.8-.4-1.8-.2-2.4.5-.6-.8-1.5-1-2.4-.5-.8.4-1.2 1.4-.8 2.4.9 2 2.9 3.7 4.9 5.5z"/></svg>',
  dove: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21C6 21 3 17 3 12V4c4 .5 6.5 2.5 8 5.5 1.4-1 3-1.5 4.8-1.5 2.6 0 5 1.4 5 4 0 3.2-3 6.8-8.8 9z"/><path d="M3 12c1.5-1 3-1.5 4.5-1.5M6.5 15c1.5-.8 3-1.2 4.5-1.2"/></svg>',
  hand: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M7 11V6.5a1.8 1.8 0 0 1 3.6 0V11h.5V5a1.8 1.8 0 0 1 3.6 0v6h.5V6.3a1.8 1.8 0 0 1 3.6 0V13c0 4.5-3 8-8 8s-7-3.4-7-7.8V9a1.8 1.8 0 0 1 3.6 0z"/></svg>',
  globe: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.3 3.5 5.3 3.5 8.5s-1 6.2-3.5 8.5c-2.5-2.3-3.5-5.3-3.5-8.5s1-6.2 3.5-8.5z"/></svg>',
  bullseye: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.3"/></svg>',
  mountain: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M2 20L8 6l3.5 7 1.5-2.5L17 20z"/><path d="M15 20l3-6 2.5 4.5L22 20z"/></svg>',
  sailboat: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2v11M12 6l6 4-6 2.5z"/><path d="M3 14h18l-1.5 4.5H4.5z"/><path d="M5.5 18.5L7 21M12 18.5V21M18.5 18.5L17 21"/></svg>',
  key: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="7.5" cy="12" r="4.2"/><path d="M10.6 8.9L21 3l1 2.4-9 5.3z"/></svg>',
  lightbulb: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-4 12.7c1 .7 1.5 1.6 1.5 2.8h5c0-1.2.5-2.1 1.5-2.8A7 7 0 0 0 12 2z"/><path d="M9.5 19h5M10 21h4"/></svg>',
  pagelines: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21V9M12 9c0-3.5 2.5-6 6.5-6 0 4-2.5 6-6.5 6z"/><path d="M12 7c0-3-2-5-5.5-5C6.6 5 8.6 7 12 7z"/><path d="M12 13c0-3 2.5-5 6-5 0 3.4-2.5 5-6 5z"/></svg>',
  fire2: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 2C13 6 10.5 7.5 8.8 9.2 6.5 11.5 5.5 13.8 5.5 16a6.5 6.5 0 0 0 13 0c0-2.6-1.4-5-3.2-6.8C13.4 7.4 14 4.5 13.5 2z"/></svg>',
  ban: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/></svg>',
  badge: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/><path d="M12 6.5l1.6 3.2 3.4.5-2.5 2.4.6 3.4L12 14.5 8.9 16l.6-3.4-2.5-2.4 3.4-.5z"/></svg>',
  check: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4 12.5l5 5L20 6.5"/></svg>',
  bolt: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg>',
  home: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4 11L12 4l8 7v9h-6v-6h-4v6H4z"/></svg>',
  user: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7" r="3.6"/><path d="M12 12.5c-4 0-7 2.6-7 6.5v1h14v-1c0-3.9-3-6.5-7-6.5z"/></svg>',
  award: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="9" r="5.5"/><path d="M12 4.8c1.4-1 3-1.6 4.8-1.8L15.5 9 18 15c-1.8-.2-3.2-1-4-2.3M12 4.8c-1.4-1-3-1.6-4.8-1.8L8.5 9 6 15c1.8-.2 3.2-1 4-2.3"/><path d="M12 14v8"/></svg>',
  crown: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-1.8 11H4.8z"/></svg>',
  gem: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4 7l5-3h6l5 3-4 12h-8z"/><path d="M4 7l8 12M20 7l-8 12"/></svg>',
  gift: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="8" width="18" height="4"/><path d="M5 12v9h14v-9M12 8v13"/><path d="M12 8c-1-3.5-5-4-5-1.5S9 8 12 8zM12 8c1-3.5 5-4 5-1.5S15 8 12 8z"/></svg>',
  target: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.4"/></svg>',
  trophy: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h12v4a6 6 0 0 1-12 0z"/><path d="M6 5H3v2a3 3 0 0 0 3 3M18 5h3v2a3 3 0 0 1-3 3M12 14v4M9 20h6v2H9z"/></svg>',
  pencil: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4 20l1-4 11-11 3 3L8 19z"/><path d="M13 6l3 3"/></svg>',
  trash: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M5 7h14l-1 13H6z"/><path d="M9 7V4h6v3M3.5 7h17M10 11v5M14 11v5"/></svg>',
  gear: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3"/><path d="M12 2.5l1.2 2.6 2.8-.6.8 2.8 2.8.6-.6 2.8 2.2 1.8-2.2 1.8.6 2.8-2.8.6-.8 2.8-2.8-.6L12 21.5l-1.2-2.6-2.8.6-.8-2.8-2.8-.6.6-2.8L2.8 11l2.2-1.8-.6-2.8 2.8-.6.8-2.8 2.8.6z"/></svg>',
  bag: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M6 8h12l1.5 12h-15z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/></svg>',
  school: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20h18M4 9h16l-8-4z"/><path d="M6 9v9h3V9M15 9v9h3V9M10 18v-5h4v5"/></svg>',
  arrow: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4 12h14M14 6l6 6-6 6"/></svg>',
  chevronDown: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M6 9l6 6 6-6"/></svg>',
  alert: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l10 17H2z"/><path d="M12 10v4M12 16.5v.5"/></svg>',
  sparkle: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/><path d="M19 15l1 2.5L22 18l-2 1-1 2.5L18 19l-2-1 2-.5z"/></svg>',
  calendar: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></svg>',
  cloud: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 19a4.5 4.5 0 0 1-.8-8.9A6.5 6.5 0 0 1 18 11.5 3.5 3.5 0 0 1 17.5 19z"/></svg>',
  city: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4 21V5l5 3v4l5-3v12z"/><path d="M14 12l6-4v13H4"/><path d="M8 9h.01M8 12h.01M8 15h.01M14 9h.01M14 12h.01M14 15h.01M8 18h.01"/></svg>',
  compass: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2.5 6-6 2.5 2.5-6z"/></svg>',
  otter: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17c0-3 2-5.5 5-5.5 1.5 0 2.5.6 3.4 1.4.7-.5 1.6-.9 2.6-.9h4c1.7 0 3 1.3 3 3v3c0 .7-.5 1.3-1.2 1.3H8C5.2 19 3 18.2 3 17z"/><circle cx="8" cy="12.5" r="1.2"/><path d="M9.5 20c.5-1.5.5-3 0-4.5"/></svg>',
  broom: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4 21l3-3c-1-2 0-4 2-5l8-8 3 3-8 8c-1 2-3 3-5 2z"/><path d="M13 4l3-1 5 5-1 3z"/></svg>',
  chalkboardUser: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M8 21h8M12 17v4"/><circle cx="9" cy="11" r="1.8"/><path d="M5.5 15c.5-1.5 2-2.5 3.5-2.5s3 1 3.5 2.5"/></svg>',
  chair: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M7 3h10v8H7z"/><path d="M4 11h16v4H4z"/><path d="M6 15v6M18 15v6"/></svg>',
  bucket: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M5 9h14l-1.5 12h-11z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>',
  car: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4 16l1.5-5A2 2 0 0 1 7.4 9.5h9.2a2 2 0 0 1 1.9 1.5L20 16v4h-2.5v-2h-11v2H4z"/><circle cx="7.5" cy="16.5" r="1.2"/><circle cx="16.5" cy="16.5" r="1.2"/></svg>',
  child: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7" r="3.6"/><path d="M12 11.5c-3 0-5.5 2.2-6 5.5L8 21l2-2.5c.5 1.8 3.5 1.8 4 0L16 21l2-4c-.5-3.3-3-5.5-6-5.5z"/></svg>',
  couch: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M3 12a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3z"/><path d="M6 19v2M18 19v2"/></svg>',
  chartLine: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17l5-5 4 3 7-8"/><path d="M15 7h4v4"/></svg>',
  chartColumn: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4 20V10M10 20V4M16 20v-8M22 20v-5"/></svg>',
  mask: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="12" r="4"/><circle cx="18" cy="12" r="4"/><path d="M10 12h4M9 9.5h2M13 14.5h2"/></svg>',
  sparkline: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17l5-5 4 3 7-8"/><path d="M15 7h4v4"/></svg>',
  font: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4 20L10 4h4l6 16h-3.5l-1.2-3.5H8.7L7.5 20zM9.3 13.5h5.4L12 6.2z"/></svg>',
  briefcase: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="8" width="18" height="12" rx="1.5"/><path d="M9 8V6a3 3 0 0 1 6 0v2M3 12h18"/></svg>',
  bullhorn: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M3 11v4h2l8 4V7L5 11z"/><path d="M17 8.5a4 4 0 0 1 0 7M20 6a7.5 7.5 0 0 1 0 12"/></svg>',
  plane: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12l18-7-4 8 4 8-18-7 7 1z"/></svg>',
  utensils: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3v7h3V3h2v7h3V3M6 12v9M17 3c-2 1.5-3 3.5-3 6 0 2 .8 3.2 2 3.6V21h2V3z"/></svg>',
  wheat: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22V6M12 6C12 3 10.5 1.5 8 1.5 8 4 9.5 5.5 12 6zM12 6c0-3 1.5-4.5 4-4.5 0 2.5-1.5 4-4 4.5z"/><path d="M12 10c0-2.5-1.5-4-4-4 0 2.5 1.5 4 4 4zM12 10c0-2.5 1.5-4 4-4 0 2.5-1.5 4-4 4zM12 14c0-2.5-1.5-4-4-4 0 2.5 1.5 4 4 4zM12 14c0-2.5 1.5-4 4-4 0 2.5-1.5 4-4 4z"/></svg>',
  ring: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M12 12l2.5 9-2.5-2.5L9.5 21z"/></svg>',
  baby: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7" r="4.2"/><path d="M12 11.5c-4.5 0-8 3.2-8 7v1h16v-1c0-3.8-3.5-7-8-7z"/><path d="M9 14h.1M15 14h.1"/></svg>',
  parents: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="8" r="3.6"/><path d="M9 13.5c-3.5 0-6 2.4-6 5.5v1h12v-1c0-3.1-2.5-5.5-6-5.5z"/><circle cx="17.5" cy="9" r="2.8"/><path d="M17.5 13.5c2.8 0 4.5 1.8 4.5 4.5v1h-4"/></svg>',
  house: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4 11L12 4l8 7v9h-6v-6h-4v6H4z"/></svg>',
  community: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="7" r="3.2"/><path d="M9 12c-3.4 0-6 2.3-6 5.5v1h12v-1c0-3.2-2.6-5.5-6-5.5z"/><circle cx="17.5" cy="8" r="2.6"/><path d="M17.5 12c2.4 0 4.5 1.7 4.5 4.5V18h-4"/></svg>',
  venus: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4.5"/><path d="M12 12.5V21M9.5 18.5h5"/></svg>',
  umbrella: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9z"/><path d="M12 12v5a2.5 2.5 0 0 0 5 0M12 12v5a2.5 2.5 0 0 1-5 0"/></svg>',
  handshake2: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M2 9.5h4l3 2h8.5V10c-2.5-.8-5-1.2-7-1.2l-4 1zM13 11.5l1.5 1.5c.9.8 2.3.8 3.3 0L20 11.3c1-.9 1-2.6 0-3.6l-3-3-3.2 1-3.5 1.2-2 1-1.5.5M2 10.5v5c0 1.7 1.3 3 3 3l3-1.5 3.5 1 5.5-3"/><path d="M12 14.5l2.5 2.5"/></svg>',
  scroll: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12v9a3 3 0 0 0 3 3v3H8a3 3 0 0 0-3 3V7h11"/><path d="M6 19a2 2 0 0 1 2-2h13v-2"/></svg>',
  feather: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4C11 4 6 8 6 14c0 2 .5 3.8 1.5 5.2C12 15 17 11 20 4z"/><path d="M4 20c3-3 6-5 10-7M14 10l-5 5"/></svg>',
  tree: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21v-4M12 17c-4 0-7-2.6-7-6.2 0-1.4.4-2.7 1.2-3.8C5.6 5.2 7 3.5 9 3c1.5 1.3 2.4 3 2.6 4.6.4-2.5 1.6-4.8 3.4-6.6.8 1.6 1.1 3.3 1 5.2C18 7 18.5 9 18.5 10.8 18.5 14.4 16 17 12 17z"/></svg>',
  wheelchair: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="5" r="2.5"/><path d="M8 9v6h6l4 6 2-1.2-3-4.8h-3.5V9z"/><path d="M8 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/></svg>',
  money: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="6" width="18" height="12" rx="1.5"/><circle cx="12" cy="12" r="2.8"/><path d="M6.5 9.5h.01M17.5 14.5h.01"/></svg>',
  phone: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h12v20H6z"/><path d="M10 5h4M10.5 19h3"/></svg>',
  battery: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="8" width="18" height="8" rx="1.5"/><path d="M22 11v2M5 10v4"/></svg>',
  bed: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M2 5v14h3v-4h14v4h3V11a4 4 0 0 0-4-4H9V5z"/><circle cx="7" cy="9.5" r="1.6"/></svg>',
  apple: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 6c1.6-1.8 3.5-2 4.5-2 .5 2-.6 3.4-1.5 4.5-.9 1-2.3 1.6-3.5 1.6-1.2 0-2.6-.6-3.5-1.6C7.1 7.4 6 6 6.5 4c1 0 2.9.2 5.5 2z"/><path d="M12 8c-3-1.6-5.5-5.5-5.5-5.5C4 4 3.5 8 4.5 11 5.5 14 7.5 20 9 20c1 0 1.5-.7 3-.7 1.5 0 2 .7 3 .7 1.5 0 3.5-6 4.5-9 1-3 .5-7-2-2.5 0 0-2.5 3.9-5.5 5.5z"/></svg>',
  heart2: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20s-7-4.3-9.3-8.2C1 8.4 2.7 4.8 6.2 4.2c2-.3 3.9.6 5.8 2.8 1.9-2.2 3.8-3.1 5.8-2.8 3.5.6 5.2 4.2 3.5 7.6C19 15.7 12 20 12 20z"/></svg>',
  users: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="7" r="3.2"/><path d="M9 12c-3.4 0-6 2.3-6 5.5v1h12v-1c0-3.2-2.6-5.5-6-5.5z"/><circle cx="17" cy="8" r="2.6"/><path d="M17 13c2.3 0 4 1.7 4 4v1h-4"/></svg>',
  clipboardCheck: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="14" height="17" rx="1.5"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1z"/><path d="M8.5 12.5l2.2 2.2 4.3-4.6"/></svg>',
  hashtag: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M10 3L8 21M16 3l-2 18M5 8h16M3 16h16"/></svg>',
  dna: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M6 3c0 5 12 5 12 10s-12 5-12 10M18 3c0 5-12 5-12 10s12 5 12 10M8 6h8M8 18h8M7 12h10"/></svg>',
  landmark: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4 9l8-4 8 4z"/><path d="M5 9v9h14V9M3 21h18M4 18v-6M20 18v-6"/></svg>',
  horse: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4 21l3-8c1-2.5 3-4.5 5.5-5L15 4c.2 2 1 3.5 2.5 4.5l1-1.5c1 1.5 1.5 3 1.5 4.5 0 4-2 7-5 8.5z"/><path d="M7 21c1-2 2-3.5 4-4.5M14 9.5c1-.5 2-.5 3 0"/></svg>',
  archway: '<svg class="iq-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21h18M4 21V6c2.5-2.5 5.5-2.5 8 0 2.5-2.5 5.5-2.5 8 0v15"/><path d="M4 21h4v-5h8v5M8 13a4 4 0 0 1 8 0"/><path d="M12 21v-4"/></svg>'
};

function iqIcon(name) {
  const key = String(name || '').replace(/^fa-solid fa-/, '').trim();
  const fallback = { 'shield-halved': 'shield', 'hand-holding-heart': 'handHeart', 'hands-praying': 'handsPraying', 'person-praying': 'personPraying', 'book-quran': 'bookQuran', 'face-smile': 'person', 'people-roof': 'community', 'people-group': 'community', 'person-dress': 'personDress', 'person-cane': 'personCane', 'heart-pulse': 'heartPulse', 'scale-balanced': 'scale', 'book-open': 'bookOpen', 'hands-holding': 'handsHolding', 'magnifying-glass': 'search', 'graduation-cap': 'school', 'mobile-screen': 'phone', 'credit-card': 'money', 'apple-whole': 'apple', 'face-meh': 'person', 'triangle-exclamation': 'alert', 'circle-stop': 'bolt', 'arrows-rotate': 'refresh', 'bag-shopping': 'bag', 'basket-shopping': 'bag', 'cart-shopping': 'bag', 'bed': 'bed', 'bowl-food': 'utensils', 'cloud-rain': 'umbrella', 'cloud-sun': 'sun', 'comment': 'mask', 'comment-dots': 'mask', 'comment-slash': 'mask', 'door-open': 'home', 'ear-listen': 'bullhorn', 'envelope': 'mask', 'eye': 'target', 'eye-slash': 'target', 'face-tired': 'person', 'glass-water': 'droplet', 'headphones': 'mask', 'heart-crack': 'heart2', 'hospital': 'house', 'jar': 'droplet', 'masks-theater': 'mask', 'medal': 'award', 'money-bill': 'money', 'money-bill-wave': 'money', 'mug-hot': 'utensils', 'otter': 'paw', 'paw': 'hand', 'pen': 'pencil', 'pen-nib': 'pencil', 'clipboard-check': 'clipboardCheck', 'chalkboard-user': 'chalkboardUser', 'chart-column': 'chartColumn', 'chart-line': 'chartLine', 'person-running': 'bolt', 'person-walking': 'person', 'person-walking-with-cane': 'personCane', 'receipt': 'scroll', 'ring': 'ring', 'road': 'arrow', 'scissors': 'pencil', 'shirt': 'person', 'shower': 'droplet', 'soap': 'droplet', 'spa': 'leaf', 'toilet': 'droplet', 'trash-can': 'trash', 'utensils': 'utensils', 'virus': 'alert', 'volume-xmark': 'ban', 'wheat-awn': 'wheat', 'wind': 'leaf', 'atom': 'bolt', 'music': 'mask', 'microphone': 'mask', 'map': 'arrow', 'palette': 'gem', 'puzzle-piece': 'target', 'shapes': 'gem', 'hourglass': 'hourglass', 'feather': 'feather', 'dove': 'dove', 'bread-slice': 'utensils', 'tree': 'tree', 'flag': 'award', 'campfire': 'fire2', 'seedling': 'seed', 'fa-pagelines': 'pagelines' };
  const mapped = fallback[key] || key;
  return IQ_ICONS[mapped] || IQ_ICONS[key] || '';
}

window.iqIcon = iqIcon;

// Replaces any <i class="fa-solid fa-X"> elements under root with the flat SVG set.
function iqSwapIcons(root) {
  const scope = root || document;
  const nodes = scope.querySelectorAll ? scope.querySelectorAll('i.fa-solid') : [];
  nodes.forEach((el) => {
    const svg = iqIcon(el.className || '');
    if (!svg) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = svg;
    const node = tmp.firstChild;
    const extra = Array.from(el.classList).filter((c) => c !== 'fa-solid' && !c.startsWith('fa-'));
    extra.forEach((c) => node.classList.add(c));
    el.replaceWith(node);
  });
}

// Sweeps the whole document after each render cycle so no FA icon survives.
window.iqSwapIcons = iqSwapIcons;
let iqObserver = null;
function iqWatchIcons() {
  if (iqObserver || typeof MutationObserver === 'undefined') return;
  iqObserver = new MutationObserver(() => iqSwapIcons(document));
  iqObserver.observe(document.body, { subtree: true, childList: true });
}
if (typeof document !== 'undefined' && document.body) { iqWatchIcons(); iqSwapIcons(document); }
window.iqWatchIcons = iqWatchIcons;
