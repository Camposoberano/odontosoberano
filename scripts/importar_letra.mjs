/**
 * Importação genérica por letra — SimplesDental → Instituto Belém
 *
 * Uso:
 *   node --env-file=.env scripts/importar_letra.mjs A
 *   node --env-file=.env scripts/importar_letra.mjs B
 *   LETRA=C node --env-file=.env scripts/importar_letra.mjs
 *
 * Fontes de dados (por paciente):
 *   - csv/paciente.csv           → dados cadastrais
 *   - csv/consultas.csv          → agenda/histórico de consultas → agendamentos
 *   - json/evolucoes.json        → evoluções clínicas → evolucoes
 *   - json/recebimentos.json     → histórico financeiro → contas_receber
 *   - json/attachments/manifest_attachments.json → imagens JPEG → documentos
 *   - json/documentos_gerados/manifest_documentos_gerados.json → PDFs → documentos
 *   - documentos_gerados/contratos/*.html → contratos HTML → documentos
 *
 * Deduplicação:
 *   documentos  → conteudo_json->>'sd_id'
 *   agendamentos/evolucoes/contas_receber → tag [SD:XXXXX] no campo observacoes/texto
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, extname, basename } from 'path'

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------
const LETRA = process.argv[2] || process.env.LETRA
if (!LETRA) {
  console.error('USO: node scripts/importar_letra.mjs <LETRA>')
  console.error('  Ex: node --env-file=.env scripts/importar_letra.mjs B')
  process.exit(1)
}

const SCRAP_BASE    = 'E:/Projetos_Novos/scrap simples'
const BACKUP_BASE   = `${SCRAP_BASE}/backup_simplesdental_por_letra/_validacao_letra_${LETRA.toUpperCase()}`
const SUPABASE_URL  = process.env.VITE_SUPABASE_URL
const SERVICE_KEY   = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
const ADMIN_USER_ID = '23104667-36ce-487f-866e-f24ea892691b'
const STORAGE_BUCKET = 'documentos'
const SIGNED_URL_EXPIRY = 31536000 // 1 ano

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('ERRO: VITE_SUPABASE_URL ou VITE_SUPABASE_SERVICE_ROLE_KEY não definidos')
  process.exit(1)
}

if (!existsSync(BACKUP_BASE)) {
  console.error(`ERRO: pasta não encontrada: ${BACKUP_BASE}`)
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function titleCase(str) {
  if (!str) return ''
  const particles = new Set(['da','de','do','das','dos','e','a','o','em','na','no','nas','nos','di','du'])
  return str.toLowerCase().split(' ').map((w, i) => {
    if (!w) return ''
    if (i > 0 && particles.has(w)) return w
    return w.charAt(0).toUpperCase() + w.slice(1)
  }).join(' ')
}

function formatPhone(raw) {
  if (!raw) return ''
  const d = raw.replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return d.length > 0 ? d : ''
}

function parseCSV(content) {
  const lines = content.replace(/^﻿/, '').trim().split('\n').filter(l => l.trim())
  const headers = lines[0].split(',').map(h => h.trim())
  return lines.slice(1).map(line => {
    const vals = line.split(',')
    const obj = {}
    headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim() })
    return obj
  })
}

/** Sanitiza nome de arquivo para storage key válido (sem espaços, acentos, chars especiais) */
function sanitizeKey(str) {
  return str
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // remover acentos
    .replace(/[^a-zA-Z0-9\-_.]/g, '_')               // só alphanum, -, _, .
    .replace(/_+/g, '_')                               // colapsar múltiplos _
    .replace(/^_|_$/, '')                              // trim _
}

/** Converte path do backup (relativo a SCRAP_BASE ou absoluto com barras mistas) */
function resolvePath(rawPath) {
  // rawPath pode ser: "backup_simplesdental_por_letra\..." ou caminho absoluto
  const normalized = rawPath.replace(/\\/g, '/')
  if (normalized.startsWith('backup_simplesdental_por_letra/')) {
    return `${SCRAP_BASE}/${normalized}`
  }
  if (normalized.startsWith('E:/') || normalized.startsWith('e:/')) {
    return normalized
  }
  return `${SCRAP_BASE}/${normalized}`
}

function getPacienteFolders() {
  return readdirSync(BACKUP_BASE)
    .filter(d => {
      if (d.startsWith('_') || d.startsWith('.')) return false
      try { return statSync(join(BACKUP_BASE, d)).isDirectory() } catch { return false }
    })
    .sort()
}

function readJsonSafe(filePath) {
  try { return JSON.parse(readFileSync(filePath, 'utf8')) } catch { return null }
}

// ---------------------------------------------------------------------------
// Verificar documentos já importados (por sd_id)
// ---------------------------------------------------------------------------
async function getJaImportados(pacienteId) {
  const { data } = await supabase
    .from('documentos')
    .select('id, conteudo_json')
    .eq('paciente_id', pacienteId)
    .not('conteudo_json', 'is', null)
  const sdIds = new Set()
  for (const doc of data || []) {
    const sdId = doc.conteudo_json?.sd_id
    if (sdId) sdIds.add(String(sdId))
  }
  return sdIds
}

// ---------------------------------------------------------------------------
// Upload + registro no banco
// ---------------------------------------------------------------------------
async function importarArquivo({ pacienteId, sdId, titulo, localPath, contentType, tipo, pasta }) {
  const nomeArquivo = sanitizeKey(basename(localPath))
  const storagePath = `paciente_${pacienteId}/${pasta}/${sdId}_${nomeArquivo}`

  // Ler arquivo local
  let fileBuffer
  try { fileBuffer = readFileSync(localPath) }
  catch (e) { throw new Error(`leitura local: ${e.message}`) }

  // Upload para Storage
  const { error: uploadErr } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, fileBuffer, { contentType, upsert: true })
  if (uploadErr) throw new Error(`upload: ${uploadErr.message}`)

  // URL assinada (1 ano)
  const { data: signedData, error: signErr } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRY)
  const urlToStore = signErr ? storagePath : signedData.signedUrl

  // Inserir registro
  const { error: docErr } = await supabase.from('documentos').insert({
    user_id:     ADMIN_USER_ID,
    paciente_id: pacienteId,
    tipo,
    titulo,
    pdf_url:     urlToStore,
    conteudo_json: {
      origem:       'simples_dental',
      sd_id:        String(sdId),
      storage_path: storagePath,
      contentType,
    },
  })
  if (docErr) throw new Error(`insert doc: ${docErr.message}`)

  return storagePath
}

// ---------------------------------------------------------------------------
// Processar documentos de um paciente
// ---------------------------------------------------------------------------
async function processarDocumentos(pacienteId, pacBase) {
  const jaImportados = await getJaImportados(pacienteId)
  let ok = 0, skip = 0, err = 0

  // ── 1. IMAGENS via manifest_attachments.json ──────────────────────────────
  const manifestAtt = readJsonSafe(join(pacBase, 'json', 'attachments', 'manifest_attachments.json'))
  if (manifestAtt?.files) {
    for (const file of manifestAtt.files) {
      const sdId = String(file.id)
      if (jaImportados.has(sdId)) { skip++; continue }

      const localPath = resolvePath(file.original?.path || '')
      if (!localPath || !existsSync(localPath)) {
        console.warn(`      ⏭  img ${sdId} (${file.name}): arquivo local não encontrado`)
        err++; continue
      }

      try {
        await importarArquivo({
          pacienteId,
          sdId,
          titulo: file.metadata?.descricao || file.name,
          localPath,
          contentType: file.content_type || 'image/jpeg',
          tipo: 'documento_externo',
          pasta: 'imagens',
        })
        jaImportados.add(sdId)
        ok++
      } catch (e) {
        console.warn(`      ⚠  img ${sdId} (${file.name}): ${e.message}`)
        err++
      }
    }
  }

  // ── 2. DOCUMENTOS GERADOS via manifest_documentos_gerados.json ──────────
  const manifestDG = readJsonSafe(join(pacBase, 'json', 'documentos_gerados', 'manifest_documentos_gerados.json'))
  if (manifestDG?.files) {
    for (const file of manifestDG.files) {
      const sdId = String(file.id)
      if (jaImportados.has(sdId)) { skip++; continue }

      const localPath = resolvePath(file.download?.path || '')
      if (!localPath || !existsSync(localPath)) {
        console.warn(`      ⏭  doc ${sdId} (${file.name}): arquivo local não encontrado`)
        err++; continue
      }

      const ext = extname(localPath).toLowerCase()
      const contentType = ext === '.pdf' ? 'application/pdf' : 'application/octet-stream'

      // Mapear categoria → tipo IB
      const tipoIB = file.category === 'anamneses' ? 'anamnese_padrao'
                   : file.category === 'atestados'  ? 'atestado'
                   : file.category === 'receitas'   ? 'documento_externo'
                   : 'documento_externo'

      try {
        await importarArquivo({
          pacienteId,
          sdId,
          titulo: file.description || file.name,
          localPath,
          contentType,
          tipo: tipoIB,
          pasta: `docs_gerados/${file.category || 'outros'}`,
        })
        jaImportados.add(sdId)
        ok++
      } catch (e) {
        console.warn(`      ⚠  doc ${sdId} (${file.name}): ${e.message}`)
        err++
      }
    }
  }

  // ── 3. CONTRATOS HTML (sem manifest próprio) ────────────────────────────
  const contratosDir = join(pacBase, 'documentos_gerados', 'contratos')
  if (existsSync(contratosDir)) {
    for (const filename of readdirSync(contratosDir)) {
      if (!filename.toLowerCase().endsWith('.html')) continue
      // Nome: contrato_<id>_<nome>.html
      const match = filename.match(/^contrato_(\d+)_/)
      const sdId = match ? match[1] : filename.replace('.html', '')
      if (jaImportados.has(sdId)) { skip++; continue }

      const localPath = join(contratosDir, filename)
      try {
        await importarArquivo({
          pacienteId,
          sdId,
          titulo: `Contrato SD #${sdId}`,
          localPath,
          contentType: 'text/html',
          tipo: 'contrato',
          pasta: 'contratos',
        })
        jaImportados.add(sdId)
        ok++
      } catch (e) {
        console.warn(`      ⚠  contrato ${sdId}: ${e.message}`)
        err++
      }
    }
  }

  return { ok, skip, err }
}

// ---------------------------------------------------------------------------
// Importar consultas (agenda histórica) → agendamentos
// ---------------------------------------------------------------------------
const SD_STATUS_MAP = {
  '0': '1-Agendado', '1': '2-Confirmado', '2': '3-Em espera',
  '3': '5-Atendido',  '4': '4-Em atendimento', '5': '5-Atendido',
  '6': '6-Atrasado',  '7': '7-Faltou',
}

async function importarConsultas(pacienteId, pacBase) {
  const csvPath = join(pacBase, 'csv', 'consultas.csv')
  if (!existsSync(csvPath)) return { ok: 0, skip: 0, err: 0 }

  let rows
  try { rows = parseCSV(readFileSync(csvPath, 'utf8')) } catch { return { ok: 0, skip: 0, err: 0 } }
  if (!rows.length) return { ok: 0, skip: 0, err: 0 }

  // IDs já importados
  const { data: existing } = await supabase
    .from('agendamentos').select('observacoes')
    .eq('paciente_id', pacienteId).ilike('observacoes', '[SD:%]%')
  const jaIds = new Set((existing || []).map(a => {
    const m = (a.observacoes || '').match(/\[SD:(\d+)\]/); return m ? m[1] : null
  }).filter(Boolean))

  let ok = 0, skip = 0, err = 0
  for (const row of rows) {
    const sdId = row.consulta_id
    if (!sdId || jaIds.has(String(sdId))) { skip++; continue }

    const status = SD_STATUS_MAP[row.statusAsCodigo] || '1-Agendado'
    const dataIso = row.data || null
    if (!dataIso) { err++; continue }

    const obs = `[SD:${sdId}]${row.obsRetorno ? ' ' + row.obsRetorno.trim() : ''}`
    const { error } = await supabase.from('agendamentos').insert({
      user_id:               ADMIN_USER_ID,
      paciente_id:           pacienteId,
      data_agendamento:      dataIso,
      status,
      procedimento:          row.descricao?.trim() || 'Consulta SD',
      observacoes:           obs,
      confirmado:            status !== '1-Agendado',
      ...(row.profissional?.trim() && { profissional_nome_manual: row.profissional.trim() }),
    })
    if (error) { console.warn(`      ⚠  consulta ${sdId}: ${error.message}`); err++ }
    else { jaIds.add(String(sdId)); ok++ }
  }
  return { ok, skip, err }
}

// ---------------------------------------------------------------------------
// Importar evoluções clínicas → evolucoes
// ---------------------------------------------------------------------------
async function importarEvolucoes(pacienteId, pacBase) {
  const jsonPath = join(pacBase, 'json', 'evolucoes.json')
  if (!existsSync(jsonPath)) return { ok: 0, skip: 0, err: 0 }

  const data = readJsonSafe(jsonPath)
  const items = data?.content || []
  if (!items.length) return { ok: 0, skip: 0, err: 0 }

  const { data: existing } = await supabase
    .from('evolucoes').select('texto')
    .eq('paciente_id', pacienteId).ilike('texto', '[SD:%]%')
  const jaIds = new Set((existing || []).map(e => {
    const m = (e.texto || '').match(/\[SD:(\d+)\]/); return m ? m[1] : null
  }).filter(Boolean))

  let ok = 0, skip = 0, err = 0
  for (const item of items) {
    const sdId = String(item.id)
    if (jaIds.has(sdId)) { skip++; continue }

    const dataEvol = item.data ? item.data.split('T')[0] : null
    if (!dataEvol) { err++; continue }

    const prof = item.profissional?.nome?.trim() || ''
    const textoSemHtml = (item.descricao || '').replace(/<[^>]+>/g, '').trim()
    const texto = `[SD:${sdId}]${prof ? ' ' + prof + ':' : ''} ${textoSemHtml}`

    const { error } = await supabase.from('evolucoes').insert({
      user_id:         ADMIN_USER_ID,
      paciente_id:     pacienteId,
      profissional_id: null,
      data:            dataEvol,
      texto,
    })
    if (error) { console.warn(`      ⚠  evolucao ${sdId}: ${error.message}`); err++ }
    else { jaIds.add(sdId); ok++ }
  }
  return { ok, skip, err }
}

// ---------------------------------------------------------------------------
// Importar recebimentos financeiros → contas_receber
// ---------------------------------------------------------------------------
async function importarRecebimentos(pacienteId, pacBase) {
  const jsonPath = join(pacBase, 'json', 'recebimentos.json')
  if (!existsSync(jsonPath)) return { ok: 0, skip: 0, err: 0 }

  const data = readJsonSafe(jsonPath)
  const items = data?.content || []
  if (!items.length) return { ok: 0, skip: 0, err: 0 }

  const { data: existing } = await supabase
    .from('contas_receber').select('observacoes')
    .eq('paciente_id', pacienteId).ilike('observacoes', '[SD:%]%')
  const jaIds = new Set((existing || []).map(c => {
    const m = (c.observacoes || '').match(/\[SD:(\d+)\]/); return m ? m[1] : null
  }).filter(Boolean))

  const now = new Date()
  let ok = 0, skip = 0, err = 0
  for (const item of items) {
    const sdId = String(item.id)
    if (jaIds.has(sdId)) { skip++; continue }

    const valor = item.valor || 0
    const vencimento = item.dataVencimento ? item.dataVencimento.split('T')[0] : null

    // SD status 2 = pago; 1 = pendente
    let status
    if (item.status === 2) status = 'Recebida'
    else if (vencimento && new Date(vencimento) < now) status = 'Vencida'
    else status = 'Pendente'

    const parcInfo = (item.numeroDeParcelas || 0) > 1
      ? ` (${item.parcela}/${item.numeroDeParcelas})`
      : ''
    const descricao = (item.descricao || 'Tratamento SD').trim() + parcInfo

    const { error } = await supabase.from('contas_receber').insert({
      user_id:          ADMIN_USER_ID,
      paciente_id:      pacienteId,
      descricao,
      valor,
      categoria:        'Tratamento',
      data_vencimento:  vencimento,
      data_recebimento: item.status === 2 ? vencimento : null,
      status,
      observacoes:      `[SD:${sdId}]`,
    })
    if (error) { console.warn(`      ⚠  recebimento ${sdId}: ${error.message}`); err++ }
    else { jaIds.add(sdId); ok++ }
  }
  return { ok, skip, err }
}

// ---------------------------------------------------------------------------
// Processar um paciente (upsert + documentos)
// ---------------------------------------------------------------------------
async function processarPaciente(folder) {
  const pacBase    = join(BACKUP_BASE, folder)
  const csvPath    = join(pacBase, 'csv', 'paciente.csv')

  const rows = parseCSV(readFileSync(csvPath, 'utf8'))
  if (!rows.length) throw new Error('CSV vazio')
  const row = rows[0]

  const nome             = titleCase(row.nome)
  const cpf              = (row.cpf || '').replace(/\D/g, '')
  const telefone         = formatPhone(row.celular)
  const email            = row.email || ''
  const genero           = row.sexo === 'F' ? 'Feminino' : row.sexo === 'M' ? 'Masculino' : null
  const dataNascimento   = row.dtNascimento || null
  const numeroProntuario = row.numeroPaciente || null

  const etiquetas = []
  if (!telefone)       etiquetas.push('⚠️ dados incompletos: telefone')
  if (!cpf)            etiquetas.push('⚠️ dados incompletos: cpf')
  if (!email)          etiquetas.push('⚠️ dados incompletos: email')
  if (!dataNascimento) etiquetas.push('⚠️ dados incompletos: data_nascimento')
  etiquetas.push('📥 simples_dental')

  const dadosPaciente = {
    user_id:  ADMIN_USER_ID,
    nome,
    telefone: telefone || '',
    email:    email || '',
    etiquetas,
    ...(cpf             && { cpf }),
    ...(genero          && { genero }),
    ...(dataNascimento  && { data_nascimento: dataNascimento }),
    ...(row.enderecoCompleto && { endereco: row.enderecoCompleto }),
    ...(row.bairro      && { bairro: row.bairro }),
    ...(row.cidade      && { cidade: row.cidade }),
    ...(row.uf          && { estado: row.uf }),
    ...(row.responsavel && { nome_responsavel: row.responsavel }),
    ...(numeroProntuario && { numero_prontuario: numeroProntuario }),
    ...(numeroProntuario && { simples_dental_id: numeroProntuario }),
  }

  let pacienteId = null
  let action = 'criado'

  async function tryUpdate(query, label) {
    const { data: rows, error: qErr } = await query
    if (qErr || !rows || rows.length === 0) return null
    const found = rows[0]
    const novas = etiquetas.filter(t => !(found.etiquetas || []).includes(t))
    const { error } = await supabase.from('pacientes')
      .update({ ...dadosPaciente, etiquetas: [...(found.etiquetas || []), ...novas] })
      .eq('id', found.id)
    if (error) throw new Error(`UPDATE ${label}: ${error.message}`)
    return found.id
  }

  // 1) Busca por simples_dental_id (mais confiável — ID único do SD)
  if (numeroProntuario && !pacienteId) {
    pacienteId = await tryUpdate(
      supabase.from('pacientes').select('id, etiquetas').eq('simples_dental_id', numeroProntuario).limit(1),
      'simples_dental_id'
    )
    if (pacienteId) action = 'atualizado'
  }

  // 2) Busca por CPF raw (sem formatação)
  if (cpf && !pacienteId) {
    pacienteId = await tryUpdate(
      supabase.from('pacientes').select('id, etiquetas').eq('cpf', cpf).limit(1),
      'cpf'
    )
    if (pacienteId) action = 'atualizado'
  }

  // 2b) Busca por CPF formatado (xxx.xxx.xxx-xx) — caso o registro antigo tenha máscara
  if (cpf && !pacienteId && cpf.length === 11) {
    const cpfFmt = `${cpf.slice(0,3)}.${cpf.slice(3,6)}.${cpf.slice(6,9)}-${cpf.slice(9,11)}`
    pacienteId = await tryUpdate(
      supabase.from('pacientes').select('id, etiquetas').eq('cpf', cpfFmt).limit(1),
      'cpf-formatado'
    )
    if (pacienteId) action = 'atualizado'
  }

  // 3) Busca por nome exato — limit(1) evita erro com múltiplos resultados
  if (!pacienteId) {
    pacienteId = await tryUpdate(
      supabase.from('pacientes').select('id, etiquetas').ilike('nome', nome).limit(1),
      'nome'
    )
    if (pacienteId) action = 'atualizado'
  }

  // 4) Criar novo
  if (!pacienteId) {
    const { data, error } = await supabase.from('pacientes')
      .insert(dadosPaciente).select('id').single()
    if (error) throw new Error(`INSERT: ${error.message}`)
    pacienteId = data.id
  }

  const docs         = await processarDocumentos(pacienteId, pacBase)
  const consultas    = await importarConsultas(pacienteId, pacBase)
  const evolucoes    = await importarEvolucoes(pacienteId, pacBase)
  const recebimentos = await importarRecebimentos(pacienteId, pacBase)
  return { nome, action, pacienteId, docs, consultas, evolucoes, recebimentos }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`🦷 Importação Letra ${LETRA.toUpperCase()} — Instituto Belém`)
  console.log(`   Backup: ${BACKUP_BASE}`)
  console.log(`   Banco:  ${SUPABASE_URL}`)
  console.log('='.repeat(65))

  const folders = getPacienteFolders()
  console.log(`Pacientes no backup: ${folders.length}\n`)

  const totais = {
    criados: 0, atualizados: 0, erros: 0,
    docsOk: 0, docsSkip: 0, docsErr: 0,
    consultasOk: 0, consultasSkip: 0,
    evolucoesOk: 0, evolucoesSkip: 0,
    recebOk: 0, recebSkip: 0,
  }

  for (let i = 0; i < folders.length; i++) {
    const folder = folders[i]
    const prefix = `[${String(i+1).padStart(3)}/${folders.length}]`
    process.stdout.write(`${prefix} ${folder.slice(0,40).padEnd(40)} `)

    try {
      const res = await processarPaciente(folder)
      if (res.action === 'criado') totais.criados++
      else totais.atualizados++
      totais.docsOk       += res.docs.ok
      totais.docsSkip     += res.docs.skip
      totais.docsErr      += res.docs.err
      totais.consultasOk  += res.consultas.ok
      totais.consultasSkip+= res.consultas.skip
      totais.evolucoesOk  += res.evolucoes.ok
      totais.evolucoesSkip+= res.evolucoes.skip
      totais.recebOk      += res.recebimentos.ok
      totais.recebSkip    += res.recebimentos.skip

      const extras = [
        res.docs.ok > 0        ? `docs:+${res.docs.ok}`          : '',
        res.consultas.ok > 0   ? `agend:+${res.consultas.ok}`    : '',
        res.evolucoes.ok > 0   ? `evol:+${res.evolucoes.ok}`     : '',
        res.recebimentos.ok > 0? `financ:+${res.recebimentos.ok}`: '',
        res.docs.err > 0       ? `⚠doc:${res.docs.err}`          : '',
      ].filter(Boolean).join(' ')
      console.log(`✅ ${res.action}${extras ? '  ' + extras : ''}`)
    } catch (e) {
      totais.erros++
      console.log(`❌ ${e.message}`)
    }
  }

  console.log('\n' + '='.repeat(65))
  console.log('RESULTADO FINAL:')
  console.log(`  ✅ Criados:          ${totais.criados}`)
  console.log(`  🔄 Atualizados:      ${totais.atualizados}`)
  console.log(`  ❌ Erros pac.:       ${totais.erros}`)
  console.log(`  📎 Docs novos:       ${totais.docsOk}`)
  console.log(`  ⏭  Docs já exist:   ${totais.docsSkip}`)
  console.log(`  ⚠  Docs c/erro:     ${totais.docsErr}`)
  console.log(`  📅 Consultas novas:  ${totais.consultasOk} (skip:${totais.consultasSkip})`)
  console.log(`  📋 Evoluções novas:  ${totais.evolucoesOk} (skip:${totais.evolucoesSkip})`)
  console.log(`  💰 Financ. novos:    ${totais.recebOk} (skip:${totais.recebSkip})`)
}

main().catch(e => {
  console.error('\nFATAL:', e.message)
  process.exit(1)
})
