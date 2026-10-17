const fs = require('fs');
let html = fs.readFileSync('app/src/main/assets/index.html', 'utf8');

console.log('Applying Ticno Logo and Game Screen Overlap fixes...');

// =========================================================================
// 1. TICNO DEVELOPERS LOGO FIX (Make "DEVELOPERS" large, bold & crystal clear)
// =========================================================================

// In Pre-Splash SVG:
html = html.replace(
  /\.ticno-text-sub\s*\{[\s\S]*?\}/,
  `.ticno-text-sub {
    font-family: 'Montserrat', 'Orbitron', 'Rajdhani', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-weight: 900;
    font-size: 26px;
    letter-spacing: 6px;
    text-transform: uppercase;
  }`
);

// In About Modal SVG:
html = html.replace(
  /\.ticno-about-sub\s*\{[\s\S]*?\}/,
  `.ticno-about-sub {
    font-family: 'Montserrat', 'Orbitron', 'Rajdhani', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-weight: 900;
    font-size: 26px;
    letter-spacing: 6px;
    text-transform: uppercase;
  }`
);

// Also increase TICNO font size in both SVGs
html = html.replace(
  /\.ticno-text-main\s*\{[\s\S]*?\}/,
  `.ticno-text-main {
    font-family: 'Montserrat', 'Orbitron', 'Rajdhani', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-weight: 900;
    font-size: 52px;
    letter-spacing: 4px;
    text-transform: uppercase;
  }`
);

html = html.replace(
  /\.ticno-about-main\s*\{[\s\S]*?\}/,
  `.ticno-about-main {
    font-family: 'Montserrat', 'Orbitron', 'Rajdhani', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-weight: 900;
    font-size: 52px;
    letter-spacing: 4px;
    text-transform: uppercase;
  }`
);

// Update y coordinates and colors in both SVGs for optimal readability
html = html.replace(
  /<text x="0" y="215" class="ticno-text-main" fill="url\(#purpleTextGradient\)">TICNO<\/text>\s*<text x="5" y="262" class="ticno-text-sub" fill="url\(#whiteTextGradient\)">DEVELOPERS<\/text>/,
  `<text x="0" y="202" class="ticno-text-main" fill="url(#purpleTextGradient)">TICNO</text>
   <text x="4" y="260" class="ticno-text-sub" fill="#38bdf8" stroke="#000000" stroke-width="0.8">DEVELOPERS</text>`
);

html = html.replace(
  /<text x="0" y="215" class="ticno-about-main" fill="url\(#purpleTextGradientAbout\)">TICNO<\/text>\s*<text x="5" y="262" class="ticno-about-sub" fill="url\(#whiteTextGradientAbout\)">DEVELOPERS<\/text>/,
  `<text x="0" y="202" class="ticno-about-main" fill="url(#purpleTextGradientAbout)">TICNO</text>
   <text x="4" y="260" class="ticno-about-sub" fill="#38bdf8" stroke="#000000" stroke-width="0.8">DEVELOPERS</text>`
);

console.log('Ticno logo typography & visibility enhanced!');

fs.writeFileSync('app/src/main/assets/index.html', html, 'utf8');
