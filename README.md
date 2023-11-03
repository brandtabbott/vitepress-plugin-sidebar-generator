# VitePress Plugin - Sidebar Generator

This VitePress plugin automatically generates and updates the sidebar for your documentation based on the structure of your Markdown files.

## Features

- Updates the VitePress config before it is resolved.
- Watches for additions/deletions in your Markdown files and automatically updates a `sidebar.json` file.

## Installation

Install the plugin via npm:

```bash
npm install vitepress-plugin-sidebar-generator --save-dev
```

## Usage

1. Configure your VitePress project.
2. Create a sidebar.json file (the plugin will look for it in docs/.vitepress/sidebar.json by default) with an empty object. An existing sidebar configuration will work as well; just copy/paste it into a .json file.
3. Create a configuration object with the following options:

   - `docsDir` (default: "docs"): Specify the documentation directory.
   - `includeDirs` (default: []): List of directories to include in the sidebar.
   - `ignoreFiles` (default: []): List of files to ignore.
   - `collapsible` (default: true, optional): Enable collapsible sections.
   - `collapsed` (default: false, optional): Set sections to be initially collapsed.
   - `sidebarFile` (default: "docs/.vitepress/sidebar.json", optional): Define the path for the generated sidebar file.

4. Import and use the plugin in your VitePress configuration:

```javascript
import sidebar from './sidebar.json';
import sidebarGenerator from "vitepress-plugin-sidebar-generator";

export default defineConfig{
  ...

  themeConfig: {
    ...

    sidebar: sidebar
  },
  vite: {
    plugins: [
      sidebarGenerator({
        docsDir: "docs",
        includeDirs: ["components"],
      }),
    ],
  }
}
```

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
