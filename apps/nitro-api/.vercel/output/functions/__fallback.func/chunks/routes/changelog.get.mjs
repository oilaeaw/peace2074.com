import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { d as defineEventHandler, n as useStorage } from '../nitro/nitro.mjs';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const changelog_get = defineEventHandler(async () => {
  try {
    const bundledChangelog = await useStorage("assets:release").getItem("CHANGELOG.md").catch(() => "");
    let content = typeof bundledChangelog === "string" ? bundledChangelog : "";
    if (!content) {
      const candidates = [
        join(dirname(fileURLToPath(globalThis._importMeta_.url)), "..", "..", "..", "..", "..", "CHANGELOG.md"),
        join(dirname(fileURLToPath(globalThis._importMeta_.url)), "CHANGELOG.md"),
        join(process.cwd(), "CHANGELOG.md"),
        join(process.cwd(), "..", "..", "CHANGELOG.md")
      ];
      for (const p of candidates) {
        try {
          content = await readFile(p, "utf-8");
          break;
        } catch {
        }
      }
    }
    if (!content) {
      console.error("CHANGELOG.md could not be loaded from the bundled asset or fallback paths");
      return { ok: false, deploys: [] };
    }
    const deploys = [];
    const sections = content.split(/(?=## \d+\.\d+\.\d+)/);
    for (const section of sections) {
      if (!section.trim()) continue;
      const versionMatch = section.match(/## (\d+\.\d+\.\d+) \((\d{4}-\d{2}-\d{2})\)/);
      if (!versionMatch) continue;
      const version = versionMatch[1];
      const dateStr = versionMatch[2];
      const date = new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      const featuresMatch = section.match(/### Features\n\n([\s\S]*?)(?=\n### |\n## |$)/);
      const features = featuresMatch ? featuresMatch[1].split("\n").filter((line) => line.trim().startsWith("-")).map((line) => line.replace(/^-\s*/, "").trim()) : [];
      const fixesMatch = section.match(/### Bug Fixes\n\n([\s\S]*?)(?=\n### |\n## |$)/);
      const fixes = fixesMatch ? fixesMatch[1].split("\n").filter((line) => line.trim().startsWith("-")).map((line) => line.replace(/^-\s*/, "").trim()) : [];
      const documentationMatch = section.match(/### Documentation\n\n([\s\S]*?)(?=\n### |\n## |$)/);
      const documentation = documentationMatch ? documentationMatch[1].split("\n").filter((line) => line.trim().startsWith("-")).map((line) => line.replace(/^-\s*/, "").trim()) : [];
      const choresMatch = section.match(/### Chores\n\n([\s\S]*?)(?=\n### |\n## |$)/);
      const chores = choresMatch ? choresMatch[1].split("\n").filter((line) => line.trim().startsWith("-")).map((line) => line.replace(/^-\s*/, "").trim()) : [];
      let icon = "rocket_launch";
      let color = "secondary";
      let message = "Release update";
      if (features.length > 0) {
        const firstFeature = features[0].toLowerCase();
        if (firstFeature.includes("auto-continue") || firstFeature.includes("quran")) {
          icon = "auto_awesome";
          color = "positive";
          message = features[0].split(/\s[-–—]\s/)[0].trim();
        } else if (firstFeature.includes("sign up") || firstFeature.includes("registration")) {
          icon = "person_add";
          color = "secondary";
          message = "Improved user registration";
        } else if (firstFeature.includes("ramadan") || firstFeature.includes("campaign")) {
          icon = "campaign";
          color = "amber";
          message = "Ramadan campaign features";
        } else if (firstFeature.includes("locale") || firstFeature.includes("turkish") || firstFeature.includes("translation")) {
          icon = "translate";
          color = "info";
          message = "Turkish locale and Quran improvements";
        } else {
          message = features[0].split(/\s[-–—]\s/)[0].trim();
        }
      } else if (fixes.length > 0) {
        icon = "bug_report";
        color = "info";
        message = fixes[0].split(/\s[-–—]\s/)[0].trim();
      } else if (documentation.length > 0) {
        icon = "article";
        color = "primary";
        message = documentation[0].split(/\s[-–—]\s/)[0].trim();
      } else if (chores.length > 0) {
        icon = "build";
        color = "grey-7";
        message = chores[0].split(/\s[-–—]\s/)[0].trim();
      }
      deploys.push({
        version,
        date,
        message,
        icon,
        color,
        features: features.length > 0 ? features : void 0,
        fixes: fixes.length > 0 ? fixes : void 0,
        documentation: documentation.length > 0 ? documentation : void 0,
        chores: chores.length > 0 ? chores : void 0
      });
    }
    return {
      ok: true,
      deploys
    };
  } catch (error) {
    console.error("Failed to read changelog:", error);
    return {
      ok: false,
      error: (error == null ? void 0 : error.message) || "Failed to read changelog",
      deploys: []
    };
  }
});

export { changelog_get as default };
//# sourceMappingURL=changelog.get.mjs.map
