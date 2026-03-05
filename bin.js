#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const projectName = process.argv[2] || "project-root";
const projectPath = path.join(process.cwd(), projectName);

const dirs = [
  "src/config",
  "src/controllers",
  "src/services",
  "src/models",
  "src/routes",
  "src/middlewares",
  "src/utils",
  "src/errors",
  "src/validators",
  "tests"
];

const files = {
  "src/app.js": `const express = require("express");
const app = express();

// Middlewares globales
app.use(express.json());

module.exports = app;`,

  "src/server.js": `const app = require("./app");
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(\`Servidor corriendo en puerto \${PORT}\`);
});`,

  ".gitignore": `node_modules
.env`,

  "README.md": `# ${projectName}
Backend generado automáticamente con Node.js CLI.`,

  ".env": `PORT=3000
DB_URI=mongodb://localhost:27017/${projectName}`
};

// Crear carpetas
fs.mkdirSync(projectPath);
dirs.forEach(dir => fs.mkdirSync(path.join(projectPath, dir), { recursive: true }));

// Crear archivos
Object.entries(files).forEach(([file, content]) => {
  fs.writeFileSync(path.join(projectPath, file), content);
});

// Crear package.json
fs.writeFileSync(
  path.join(projectPath, "package.json"),
  JSON.stringify({
    name: projectName,
    version: "1.0.0",
    main: "src/server.js",
    scripts: {
      start: "node src/server.js",
      dev: "nodemon src/server.js"
    },
    dependencies: {
      express: "^4.18.2"
    },
    devDependencies: {
      nodemon: "^3.0.0"
    }
  }, null, 2)
);

console.log(`✅ Proyecto ${projectName} creado con éxito en ${projectPath}`);
