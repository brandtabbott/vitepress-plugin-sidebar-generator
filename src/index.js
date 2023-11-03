import { startCase, merge } from "lodash-es";
import { watch } from "chokidar";
import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";

/**
 * @typedef {Object} VitepressPluginSidebarGeneratorOptions
 * @property {string} docsDir
 * @property {string[]} includeDirs
 * @property {string[]} [ignoreFiles]
 * @property {boolean} [collapsible]
 * @property {boolean} [collapsed]
 * @property {string} [sidebarFile]
 */

const DEFAULT_OPTIONS = {
  docsDir: "docs",
  includeDirs: [],
  ignoreFiles: [],
  collapsible: true,
  collapsed: false,
  sidebarFile: "docs/.vitepress/sidebar.json",
};

/**
 * @param {VitepressPluginSidebarGeneratorOptions} options
 */
export default (options) => {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return {
    name: "vitepress-plugin-sidebar-generator",

    // Before the config is resolved, update the .json file and then update the config
    config(vitepressConfig) {
      const sidebar = mergeSidebar(config);
      vitepressConfig.vitepress.userConfig.themeConfig.sidebar = sidebar;
    },

    // Watch for .md file add and unlink when the dev server is running
    configureServer() {
      const watcher = watch(config.docsDir, {
        ignoreInitial: true,
      });

      const handleFileChange = (filePath) => {
        if (filePath.endsWith(".md")) {
          mergeSidebar(config);
        }
      };

      watcher.on("add", handleFileChange);
      watcher.on("unlink", handleFileChange);
    },
  };
};

function mergeSidebar(config) {
  const { docsDir, includeDirs, ignoreFiles, collapsible, collapsed, sidebarFile } = config;

  try {
    // Get sidebar file contents
    const sidebarContent = readSidebarFileSync(sidebarFile);

    // Generate a fresh sidebar object
    const sidebar = getSidebar(docsDir, includeDirs, ignoreFiles, collapsible, collapsed);

    // Merge the sidebar object into the sidebar file contents
    merge(sidebarContent, sidebar);

    fs.writeFileSync(sidebarFile, JSON.stringify(sidebarContent, null, 2));
    return sidebarContent;
  } catch (error) {
    console.error("Error while updating sidebar:", error);
    return {};
  }
}

function readSidebarFileSync(sidebarFile) {
  if (fs.existsSync(sidebarFile)) {
    return JSON.parse(fs.readFileSync(sidebarFile, "utf8"));
  } else {
    return {};
  }
}

function getSidebar(docsDir, includeDirs, ignoreFiles, collapsible, collapsed) {
  const sidebar = {};

  glob
    .sync(`${docsDir}/**/*.md`)
    .filter((file) => {
      const fileName = path.basename(file);
      const fileBaseDirectory = file.split("/")[1];
      return includeDirs.includes(fileBaseDirectory) && !ignoreFiles.includes(fileName);
    })
    .sort()
    .forEach((file) => {
      const filePath = file.replace(`${docsDir}/`, "");
      addSidebarSection(sidebar, filePath, collapsible, collapsed);
    });

  return sidebar;
}

function addSidebarSection(sidebar, filePath, collapsible, collapsed) {
  const parts = filePath.split("/");
  const sectionName = parts[0];

  if (!sidebar[`/${sectionName}/`]) {
    sidebar[`/${sectionName}/`] = [
      {
        text: startCase(sectionName),
        items: [],
        collapsed: collapsible ? collapsed : undefined,
      },
    ];
  }

  parts.shift();

  addSidebarItems(sidebar[`/${sectionName}/`][0].items, parts, filePath, collapsible, collapsed);
}

function addSidebarItems(items, parts, fullFilePath, collapsible, collapsed) {
  if (parts[0].endsWith(".md")) {
    const existingItem = items.find((item) => item.text === parts[0].replace(".md", ""));
    if (!existingItem) {
      items.push({
        text: parts[0].replace(".md", ""),
        link: `/${fullFilePath}`,
      });
    }
  } else {
    addSidebarLevel(items, parts, fullFilePath, collapsible, collapsed);
  }
}

function addSidebarLevel(items, parts, fullFilePath, collapsible, collapsed) {
  let existingLevel = items.find((item) => item.text === startCase(parts[0]));

  if (!existingLevel) {
    existingLevel = {
      text: startCase(parts[0]),
      items: [],
      collapsed: true,
    };
    items.push(existingLevel);
  }

  parts.shift();

  addSidebarItems(existingLevel.items, parts, fullFilePath, collapsible, collapsed);
}
