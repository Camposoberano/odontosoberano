const fs = require('fs');
const path = require('path');

const hooksDir = path.join('e:\\Projetos_Novos\\Odonto PRO\\src\\hooks');
const files = fs.readdirSync(hooksDir).filter(f => f.startsWith('use') && f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(hooksDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Remove all instances of the block
  const badBlockRegex = /\n\s*if\s*\(data\.ordem_servico\)\s*\{\s*await\s*ensureOrdemServicoExists\(data\.ordem_servico,\s*user\.id,\s*data\.paciente_id,\s*data\.dentista_id\);\s*\}/g;
  content = content.replace(badBlockRegex, '');
  
  // 2. Add it back only inside mutationFn: async (...) => { ... }
  // We'll search for mutationFn: async (...) => { \n if (!user) throw new Error('Usuário não autenticado');
  const injectRegex = /(mutationFn:\s*async\s*\([\s\S]*?\)\s*=>\s*\{\s*if\s*\(!user\)\s*throw\s*new\s*Error\([^)]*\);)/g;
  
  if (content.includes('ensureOrdemServicoExists')) {
      content = content.replace(injectRegex, "$1\n\n      if (data && data.ordem_servico) {\n        await ensureOrdemServicoExists(data.ordem_servico, user.id, data.paciente_id, data.dentista_id);\n      }");
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', file);
  }
});
