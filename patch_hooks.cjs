const fs = require('fs');
const path = require('path');

const hooksDir = path.join('e:\\Projetos_Novos\\Odonto PRO\\src\\hooks');
const files = fs.readdirSync(hooksDir).filter(f => f.startsWith('use') && f.endsWith('.ts'));

let patchedCount = 0;

files.forEach(file => {
  const filePath = path.join(hooksDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // We want to patch Hooks for procedures that have 'ordem_servico'
  if (content.includes('useCreateProcedimento') || 
      content.includes('useCreateResinaImpressa') || 
      content.includes('useCreateLabExterno') || 
      content.includes('useCreateProvisorio') || 
      content.includes('useCreateCeramica') || 
      content.includes('useCreatePlaca')) {
      
    if (!content.includes('ensureOrdemServicoExists')) {
      // 1. Add import
      // We will add it right below import { toast
      content = content.replace(
        /import { toast[^\n]+;/g,
        "$& \nimport { ensureOrdemServicoExists } from '@/utils/syncOS';"
      );
      
      // 2. Inject function call right after: if (!user) throw new Error('Usuário não autenticado');
      // Some hooks use data: Partial<...>; others use something else, but inside mutationFn they do:
      // if (!user) throw new Error(...)
      content = content.replace(
        /if \(!user\) throw new Error\('Usuário não autenticado'\);/g,
        "if (!user) throw new Error('Usuário não autenticado');\n\n      if (data.ordem_servico) {\n        await ensureOrdemServicoExists(data.ordem_servico, user.id, data.paciente_id, data.dentista_id);\n      }"
      );
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Patched', file);
      patchedCount++;
    }
  }
});

console.log('Total files patched:', patchedCount);
