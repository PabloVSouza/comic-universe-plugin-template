<div align="center">
  <img src="https://github.com/pablovsouza/comic-universe/blob/main/src/renderer/assets/icon-icon.svg?raw=true" width="200">
  <h1>Comic Universe Plugin Template</h1>
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" />
  <a href="https://github.com/prisma/prisma/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" /></a>
  <a href="https://discord.gg/gPsQkDGDfc"><img alt="Discord" src="https://img.shields.io/discord/1270554232260526120?label=Discord"></a>
  <br />
  <br />
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/pablovsouza/comic-universe/">Main Project</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://www.instagram.com/opablosouza/">Instagram</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://discord.gg/gPsQkDGDfc">Discord</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://x.com/opablosouza">X (Twitter)</a>
  <br />
  <hr />
</div>

## What is this for?

This project is a base template for creating API-based plugins for the app [**Comic Universe**](https://github.com/pablovsouza/comic-universe).

This template uses **Next.js** to create a web application that exposes API endpoints that Comic Universe can consume. Unlike the old plugin system, plugins are now **remote API services** rather than local NPM packages.

## Why the New Architecture?

The new API-based plugin architecture was designed with several key goals in mind:

### 🦀 Groundwork for Comic Universe 3.0

This architecture is the groundwork for **Comic Universe 3.0**, which will replace Electron with **Tauri** (a Rust-based framework). By moving plugins to remote APIs, the main app no longer needs to:

- Execute JavaScript/TypeScript code directly
- Include a Node.js runtime
- Manage plugin dependencies and security contexts
- Handle plugin lifecycle and sandboxing

This separation allows Comic Universe 3.0 to be built with Tauri (Rust backend + web frontend) while maintaining full plugin compatibility. Plugins will continue to work seamlessly as the app transitions from Electron to Tauri, since they're now independent HTTP services rather than embedded code.

### 🚀 Simplified App Architecture

The new architecture removes significant complexity from the main application:

- **No plugin execution** - The app simply makes HTTP requests to plugin APIs
- **No Node runtime required** - The app doesn't need to bundle or run Node.js
- **Better security** - Plugins run in isolated environments, not within the app process
- **Easier updates** - Plugin updates happen on the server side, not requiring app updates

### 🌐 Easy Hosting & Deployment

Next.js plugins are incredibly easy to deploy with multiple free hosting options:

- **Vercel** - Zero-config deployment with automatic HTTPS and global CDN
- **Netlify** - Simple deployment with continuous integration
- **Railway** - Easy deployment with database support
- **Cloudflare Pages** - Fast, global edge network
- **Any Node.js hosting** - Works with any platform that supports Next.js

This makes it trivial for plugin developers to host and maintain their plugins without infrastructure expertise.

### 📦 Better Plugin Management

- **Independent updates** - Plugins can be updated without app updates
- **Version control** - Plugin versions are managed on the server
- **Analytics & monitoring** - Plugin developers can monitor their API usage
- **Scalability** - Plugins can scale independently based on demand

## ✨ Latest Updates (v2.0.0)

- **API-based architecture** - Plugins are now remote HTTP APIs instead of local NPM packages
- **Next.js template** - Built with Next.js 16 for easy deployment
- **Deep link installation** - Users can install plugins directly from a web page
- **Standardized API endpoints** - All plugins use the same REST API structure
- **Beautiful UI** - Template includes a styled home page matching Comic Universe's design

## Project Structure

```
comic-universe-plugin-template/
├── app/
│   ├── api/                    # API endpoints for Comic Universe
│   │   ├── getList/            # Get list of comics
│   │   ├── search/             # Search for comics
│   │   ├── getDetails/         # Get comic details
│   │   ├── getChapters/        # Get chapters for a comic
│   │   ├── getPages/           # Get pages for a chapter
│   │   └── downloadChapter/    # Download a chapter
│   ├── components/             # React components
│   │   └── StarrySky.tsx       # Animated background component
│   ├── page.tsx                # Home page with install button
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── public/                     # Static assets
│   └── logo.svg                # Comic Universe logo
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## Required API Endpoints

All plugins must implement the following POST endpoints:

### `POST /api/getList`

Returns a list of available comics.

**Response:** `IComic[]`

### `POST /api/search`

Search for comics by query.

**Request Body:** `{ query: string }`  
**Response:** `IComic[]`

### `POST /api/getDetails`

Get detailed information about a specific comic.

**Request Body:** `{ comic: IComic }`  
**Response:** `IComic`

### `POST /api/getChapters`

Get all chapters for a comic.

**Request Body:** `{ comic: IComic }`  
**Response:** `IChapter[]`

### `POST /api/getPages`

Get all pages for a chapter.

**Request Body:** `{ comic: IComic, chapter: IChapter }`  
**Response:** `IPage[]`

### `POST /api/downloadChapter`

Download a chapter (optional, for offline reading).

**Request Body:** `{ comic: IComic, chapter: IChapter }`  
**Response:** `{ success: boolean }`

## Getting Started

1. **Fork this repository** and clone it to your local machine

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Customize the API endpoints** in `app/api/` to connect to your data source

5. **Update the home page** (`app/page.tsx`) with your plugin's information

6. **Deploy your plugin** to a hosting service (Vercel, Netlify, etc.)

## Plugin Installation

Users can install your plugin using a deep link. The template includes an install button on the home page that generates a deep link in the format:

```
comic-universe://plugin/install?url=<YOUR_API_URL>&name=<PLUGIN_NAME>&tag=<PLUGIN_TAG>
```

When users click the install button:

1. Comic Universe app opens (if installed)
2. A confirmation dialog appears
3. Upon confirmation, the plugin is added to the user's database
4. The plugin becomes immediately available

## Development

### Running Locally

```bash
npm run dev
```

The plugin will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

### Customizing the Template

1. **Update API endpoints** - Modify the route handlers in `app/api/` to connect to your data source
2. **Customize the home page** - Edit `app/page.tsx` to reflect your plugin's information
3. **Update metadata** - Change the plugin name, tag, and description in `app/page.tsx`
4. **Add your logo** - Replace `public/logo.svg` with your plugin's logo

## TypeScript Interfaces

Make sure your API responses match the Comic Universe TypeScript interfaces:

- `IComic` - Comic information
- `IChapter` - Chapter information
- `IPage` - Page information

Refer to the main Comic Universe repository for the complete interface definitions.

## Best Practices

- **Keep responses fast** - Comic Universe expects API responses within 30 seconds
- **Handle errors gracefully** - Return appropriate error responses
- **Use proper HTTP status codes** - 200 for success, 4xx/5xx for errors
- **Minimize dependencies** - Keep your plugin lightweight
- **Document your API** - Help users understand how to use your plugin

## Deployment

You can deploy your plugin to any hosting service that supports Next.js:

- **Vercel** (recommended) - Zero-config deployment
- **Netlify** - Easy deployment with continuous integration
- **Railway** - Simple deployment with database support
- **Any Node.js hosting** - Works with any platform that supports Next.js

Make sure to set your API URL in the install button's deep link.

## Testing Your Plugin

1. **Deploy your plugin** to a public URL
2. **Open the home page** in a browser
3. **Click the install button** - This will trigger the deep link
4. **Check Comic Universe** - The plugin should appear in the plugins list
5. **Test the endpoints** - Use the app to browse comics and verify all endpoints work

## What if I'm stuck?

Feel free to reach me on the social networks provided above, as well as in our Discord server.

## I'm done developing my plugin, how do I publish it?

Reach me in the Discord server, on the channel **#plugin-submission**.

## License

MIT
