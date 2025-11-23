# Basic Fit QR Code Generator

A minimal, TypeScript-based QR code generator that creates time-based QR codes with SHA-256 hash validation. The application runs entirely in the browser with no backend required.

## Features

- 🔐 **SHA-256 Hash Generation** - Secure hash-based QR code validation
- ⏱️ **Auto-refresh** - QR codes regenerate every 5 seconds with updated timestamps
- 💾 **Local Storage** - Configuration persists between sessions
- 📱 **Mobile-friendly** - Responsive design optimized for all screen sizes
- 🚀 **No Backend Required** - Runs completely client-side
- 🎨 **Clean UI** - Simple, modern interface

## How It Works

The application generates QR codes in the format:

```
GM2:{CARD_NUMBER}:{CONSTANT}:{TIMESTAMP}:{HASH}
```

Where:

- **GM2**: QR code format identifier
- **CARD_NUMBER**: Your card identifier (e.g., V00123456)
- **CONSTANT**: A fixed constant value (e.g., 3M9) that changes everytime you kill & relaunch the BF app.
- **TIMESTAMP**: Unix timestamp (seconds since epoch)
- **HASH**: Last 8 characters of SHA-256 hash (uppercase)

The hash is computed from: `CARD_NUMBER + CONSTANT + TIMESTAMP + DEVICE_ID`

## Running Locally

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd bf-qr-code-generator
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

4. Open `index.html` in your browser:

```bash
open index.html
```

That's it! No server required - just open the HTML file directly.

### Development

The project uses:

- **TypeScript** for type-safe code
- **esbuild** for fast bundling
- **QRCode.js** for QR code generation

To rebuild after making changes:

```bash
npm run build
```

## Project Structure

```
bf-qr-code-generator/
├── index.html          # Main HTML file
├── styles.css          # Styling
├── src/
│   └── main.ts         # TypeScript source code
├── dist/
│   ├── main.js         # Compiled & bundled JavaScript
│   └── main.js.map     # Source maps for debugging
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## GitHub Pages Deployment

The project uses GitHub Actions to automatically build and deploy:

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Under "Build and deployment", select **GitHub Actions** as the source
4. Push to the `main` branch to trigger automatic deployment
5. Your app will be available at `https://<username>.github.io/<repository>/`

The GitHub Action workflow will automatically:

- Install dependencies
- Build the TypeScript code
- Deploy to GitHub Pages

**Note:** The `dist/` folder is not committed to the repository. It's built automatically during deployment.

## Disclaimer

**This project is for educational and demonstration purposes only.**

This QR code generator is **NOT** affiliated with, endorsed by, or intended for actual use in Basic Fit facilities. It is a personal project created solely for learning and educational purposes.

- This tool is **NOT** intended for real-world use in Basic Fit gyms
- The author assumes **NO responsibility** for any misuse of this application
- Any use of this tool in actual Basic Fit facilities is **strictly prohibited**
- Users are solely responsible for any consequences resulting from the use of this software

By using this software, you acknowledge that it is a demonstration project only and agree not to use it for any unauthorized purposes.
