import fs from 'fs';

let content = fs.readFileSync('./src/App.tsx', 'utf-8');

// Replace default imports avoiding react-router-dom, etc. Only matching @/pages or ./pages
content = content.replace(/^import\s+([A-Z][a-zA-Z0-9_]*)\s+from\s+["'](@\/pages\/[^"']+|.\/pages\/[^"']+)["'];$/gm, (match, name, path) => {
    return `const ${name} = React.lazy(() => import("${path}"));`;
});

// Replace named imports from pages
content = content.replace(/^import\s+{\s*([A-Z][a-zA-Z0-9_]*)\s*}\s+from\s+["'](@\/pages\/[^"']+)["'];$/gm, (match, name, path) => {
    return `const ${name} = React.lazy(() => import("${path}").then(m => ({ default: m.${name} })));`;
});

// Add Suspense wrapping around Routes
if (!content.includes('<Suspense fallback=')) {
    content = content.replace(/<Routes location={location} key={location\.pathname}>/, '<React.Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Carregando...</div>}>\n        <Routes location={location} key={location.pathname}>');
    content = content.replace(/<\/Routes>/, '</Routes>\n        </React.Suspense>');
}

fs.writeFileSync('./src/App.tsx', content);
console.log("Refactoring complete.");
