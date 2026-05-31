import { forwardRef } from 'react';
import { DocumentoVars, TipoDocumento } from '@/utils/documentoUtils';
import {
  pageStyle, DocumentoHeader, DocumentoFooter, BlocoAssinaturas,
  BRAND, InfoBar, InfoRow,
} from './DocumentoBase';

interface Props {
  vars: DocumentoVars;
  tipo: TipoDocumento;
  extras?: Record<string, string>; // campos extras como tipo de cirurgia
}

// ─── Conteúdos por tipo ────────────────────────────────────────────────────

function TcleCirurgia({ vars, extras }: { vars: DocumentoVars; extras?: Record<string, string> }) {
  const tipoCirurgia = extras?.tipo_cirurgia || '';
  return (
    <>
      <InfoBar>
        <InfoRow label="Paciente" value={vars.PACIENTE_NOME} />
        <InfoRow label="CPF" value={vars.PACIENTE_CPF} />
        <InfoRow label="Data de Nascimento" value={vars.PACIENTE_NASCIMENTO} />
        <InfoRow label="Profissional" value={vars.DENTISTA_NOME || vars.CLINICA_DENTISTA_NOME} />
        <InfoRow label="CRO" value={vars.DENTISTA_CRO || vars.CLINICA_CRO_RESPONSAVEL} />
      </InfoBar>

      <div style={{ marginBottom: 10 }}>
        <p style={{ fontWeight: 700, marginBottom: 4 }}>Tipo de procedimento:</p>
        <div style={{ display: 'flex', gap: 20, fontSize: 10.5 }}>
          {['Extração simples', 'Extração cirúrgica', 'Siso impactado', 'Semiimpactado'].map(t => (
            <span key={t}>[ {tipoCirurgia === t ? '✓' : ' '} ] {t}</span>
          ))}
        </div>
      </div>

      <Section titulo="1. DESCRIÇÃO DO PROCEDIMENTO">
        Consinto a realização de cirurgia oral/extração dentária pelo(a) profissional acima identificado(a), sob anestesia local, envolvendo remoção do(s) elemento(s) dental(is) indicado(s) por meio de técnica simples ou cirúrgica, conforme o caso clínico.
      </Section>

      <Section titulo="2. RISCOS E COMPLICAÇÕES POSSÍVEIS">
        <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.7 }}>
          <li>Dor, inchaço e sangramento nos primeiros dias</li>
          <li>Hemorragia persistente após o procedimento — pode requerer hemostasia cirúrgica especializada</li>
          <li>Edema excessivo com dificuldade temporária de alimentação e fala</li>
          <li>Infecção pós-operatória local (risco baixo com cuidados adequados)</li>
          <li>Infecções cervicofaciais extensas (celulite difusa com comprometimento dos espaços fasciais — raro)</li>
          <li>Parestesia temporária ou permanente (dormência) em lábio, língua ou mento</li>
          <li>Alveolite (inflamação do alvéolo — "dry socket" — entre o 2º e 5º dia pós-op)</li>
          <li>Comunicação bucosinusal (em extrações de molares superiores)</li>
          <li>Fratura radicular residual (raramente necessitando nova intervenção)</li>
          <li>Reação à anestesia ou a materiais utilizados (rara, tratável imediatamente)</li>
          <li>Sutura: pode ser necessária e deverá ser removida em {extras?.sutura_dias || '7'} dias</li>
        </ul>
      </Section>

      <Section titulo="2A. COMPLICAÇÕES DE EMERGÊNCIA (RARAS, MAS POSSÍVEIS)">
        <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.7 }}>
          <li><strong>Obstrução das vias aéreas</strong> — por edema severo, hematoma extenso, sangramento ou deslocamento de corpo estranho; constitui emergência médica grave</li>
          <li><strong>Reação anafilática</strong> — reação alérgica grave a medicamentos, látex ou materiais (sinais: dispneia, edema de face e língua, urticária, hipotensão)</li>
          <li><strong>Hemorragia grave</strong> — sangramento intenso não responsivo às medidas locais, com risco de choque hipovolêmico</li>
          <li><strong>Aspiração ou deglutição de instrumentos/fragmentos</strong> — brocas, fragmentos dentários ou corpos estranhos; aspiração para o trato respiratório constitui emergência imediata</li>
          <li><strong>Perfuração de estruturas anatômicas</strong> — seio maxilar, cavidade nasal ou canal mandibular (lesão do nervo alveolar inferior)</li>
          <li><strong>Emergências médicas sistêmicas no consultório</strong> — síncope, crise convulsiva, hipoglicemia, crise hipertensiva, angina ou infarto agudo do miocárdio, acidente vascular cerebral (AVC)</li>
        </ul>
        <p style={{ margin: '6px 0 0', fontSize: 10, color: '#6b7280' }}>
          Em qualquer das situações acima, o serviço médico de emergência será acionado imediatamente e o paciente encaminhado ao ambiente hospitalar quando indicado.
        </p>
      </Section>

      <Section titulo="3. BENEFÍCIOS ESPERADOS">
        Eliminação de foco infeccioso, alívio da dor, possibilidade de reabilitação com prótese ou implante e melhora da saúde bucal.
      </Section>

      <Section titulo="4. ALTERNATIVAS TERAPÊUTICAS">
        Fui informado(a) sobre possíveis alternativas ao procedimento cirúrgico (tratamento endodôntico quando aplicável, tratamento expectante) e compreendo por que a cirurgia foi indicada.
      </Section>

      <Section titulo="5. CUIDADOS PÓS-OPERATÓRIOS">
        Comprometo-me a seguir as orientações fornecidas (repouso, alimentação adequada, medicamentos prescritos, compressão local por 20 minutos após a cirurgia e retorno para avaliação). Tempo estimado de afastamento das atividades: <strong>{extras?.afastamento || '___ horas / dias'}</strong>.
      </Section>
    </>
  );
}

function TcleImplante({ vars, extras }: { vars: DocumentoVars; extras?: Record<string, string> }) {
  return (
    <>
      <InfoBar>
        <InfoRow label="Paciente" value={vars.PACIENTE_NOME} />
        <InfoRow label="CPF" value={vars.PACIENTE_CPF} />
        <InfoRow label="Profissional" value={vars.DENTISTA_NOME || vars.CLINICA_DENTISTA_NOME} />
        <InfoRow label="CRO" value={vars.DENTISTA_CRO || vars.CLINICA_CRO_RESPONSAVEL} />
      </InfoBar>

      <div style={{ marginBottom: 10 }}>
        <p style={{ fontWeight: 700, marginBottom: 4 }}>Opções adicionais:</p>
        <div style={{ display: 'flex', gap: 20, fontSize: 10.5 }}>
          {[
            ['enxerto', 'Enxerto ósseo indicado'],
            ['seio', 'Levantamento de seio maxilar'],
            ['carga_imediata', 'Protocolo de carga imediata'],
          ].map(([k, label]) => (
            <span key={k}>[ {extras?.[k] === 'sim' ? '✓' : ' '} ] {label}</span>
          ))}
        </div>
      </div>

      <Section titulo="1. DESCRIÇÃO DO PROCEDIMENTO">
        O implante osseointegrado é um parafuso de titânio (ou zircônia) inserido cirurgicamente no osso maxilar ou mandibular para substituir a raiz de um dente perdido, sobre o qual será instalada uma prótese (coroa, prótese parcial ou total).
      </Section>

      <Section titulo="2. CONDIÇÕES PARA O SUCESSO">
        <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.7 }}>
          <li>Volume e qualidade óssea adequados (confirmados por tomografia)</li>
          <li>Ausência de doenças sistêmicas não controladas</li>
          <li>Boa higiene bucal e comparecimento às consultas de acompanhamento</li>
        </ul>
      </Section>

      <Section titulo="3. RISCOS E COMPLICAÇÕES">
        <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.7 }}>
          <li>Dor e edema pós-operatório (esperados e controláveis)</li>
          <li>Hemorragia pós-operatória persistente — pode requerer hemostasia especializada</li>
          <li>Edema excessivo com dificuldade temporária de alimentação e fala</li>
          <li>Infecção local ao redor do implante ou sítio cirúrgico</li>
          <li>Mucosite peri-implantar (inflamação reversível dos tecidos moles peri-implantares)</li>
          <li>Peri-implantite (infecção com perda óssea ao redor do implante — pode levar à remoção)</li>
          <li>Exposição de membrana ou material de enxerto — necessita avaliação para evitar contaminação</li>
          <li>Mobilidade precoce do implante — falha inicial da osseointegração, exige reavaliação do tratamento</li>
          <li>Falha definitiva na osseointegração (necessidade de remoção e nova tentativa)</li>
          <li>Parestesia temporária ou permanente em lábio, língua ou mento</li>
          <li>Lesão do nervo alveolar inferior (parestesia de lábio inferior e mento)</li>
          <li>Afrouxamento de parafusos protéticos</li>
          <li>Fratura do implante (rara)</li>
          <li>Perfuração do seio maxilar em implantes superiores posteriores</li>
          <li>Comunicação buco-sinusal</li>
          <li>Deslocamento do implante para o interior do seio maxilar (raro)</li>
        </ul>
      </Section>

      <Section titulo="3A. COMPLICAÇÕES DE EMERGÊNCIA (RARAS, MAS POSSÍVEIS)">
        <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.7 }}>
          <li><strong>Obstrução das vias aéreas</strong> — por edema severo, hematoma extenso ou sangramento; emergência médica grave</li>
          <li><strong>Reação anafilática</strong> — reação alérgica grave a medicamentos, látex, titânio ou materiais utilizados (dispneia, edema de face e língua, urticária, hipotensão)</li>
          <li><strong>Hemorragia grave</strong> — sangramento intenso não responsivo às medidas locais, com risco de choque hipovolêmico</li>
          <li><strong>Aspiração ou deglutição de componentes</strong> — parafusos, componentes protéticos ou instrumentos; aspiração constitui emergência imediata</li>
          <li><strong>Infecções cervicofaciais extensas</strong> — celulite difusa com comprometimento dos espaços fasciais; podem evoluir para comprometimento respiratório</li>
          <li><strong>Emergências médicas sistêmicas no consultório</strong> — síncope, crise convulsiva, hipoglicemia, crise hipertensiva, angina ou infarto agudo do miocárdio, acidente vascular cerebral (AVC)</li>
        </ul>
        <p style={{ margin: '6px 0 0', fontSize: 10, color: '#6b7280' }}>
          Em qualquer das situações acima, o serviço médico de emergência será acionado imediatamente e o paciente encaminhado ao ambiente hospitalar quando indicado.
        </p>
      </Section>

      <Section titulo="4. ENXERTO ÓSSEO (SE APLICÁVEL)">
        Quando o volume ósseo é insuficiente, pode ser necessário enxerto ósseo (autógeno, xenógeno ou aloplástico) antes ou durante a instalação do implante. Este é um procedimento separado com seus próprios riscos (reabsorção do enxerto, infecção, falha de integração).
      </Section>

      <Section titulo="5. CONTRAINDICAÇÕES INFORMADAS">
        Estou ciente de que as seguintes condições aumentam o risco de insucesso: diabetes não controlado, osteoporose, bisfosfonatos, radioterapia na região de cabeça e pescoço, tabagismo intenso, bruxismo severo.
      </Section>

      <Section titulo="6. FASE PROTÉTICA">
        Entendo que, após a osseointegração (3–6 meses), será necessário retornar para a fase protética (instalação da coroa/prótese), que terá custo adicional conforme orçamento à parte.
      </Section>
    </>
  );
}

function TcleOrtodontia({ vars, extras }: { vars: DocumentoVars; extras?: Record<string, string> }) {
  const aparelho = extras?.aparelho || '';
  return (
    <>
      <InfoBar>
        <InfoRow label="Paciente" value={vars.PACIENTE_NOME} />
        <InfoRow label="CPF" value={vars.PACIENTE_CPF} />
        <InfoRow label="Profissional" value={vars.DENTISTA_NOME || vars.CLINICA_DENTISTA_NOME} />
        <InfoRow label="CRO" value={vars.DENTISTA_CRO || vars.CLINICA_CRO_RESPONSAVEL} />
      </InfoBar>

      <div style={{ marginBottom: 10 }}>
        <p style={{ fontWeight: 700, marginBottom: 4 }}>Tipo de aparelho:</p>
        <div style={{ display: 'flex', gap: 16, fontSize: 10.5 }}>
          {['Braquete metálico', 'Braquete estético', 'Lingual', 'Alinhador'].map(t => (
            <span key={t}>[ {aparelho === t ? '✓' : ' '} ] {t}</span>
          ))}
        </div>
      </div>

      <Section titulo="1. NATUREZA DO TRATAMENTO">
        O tratamento ortodôntico visa corrigir a posição dos dentes e/ou maxilares por meio do aparelho selecionado acima. A duração estimada é de <strong>{extras?.duracao || '___ meses'}</strong>, podendo variar conforme a colaboração do paciente e a complexidade do caso.
      </Section>

      <Section titulo="2. RESPONSABILIDADES DO PACIENTE">
        <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.7 }}>
          <li>Comparecer às consultas de ajuste (frequência indicada pelo profissional)</li>
          <li>Manter higiene bucal rigorosa (escovação após cada refeição, uso de fio dental e escovas interproximais)</li>
          <li>Evitar alimentos duros, pegajosos ou açucarados em excesso</li>
          <li>Usar elásticos e aparelhos auxiliares conforme orientação</li>
          <li>Em caso de emergência (braquete solto, fio rompido), entrar em contato pela clínica</li>
          <li>Usar contenção (retentores) pós-tratamento por período mínimo de <strong>{extras?.contencao || '___ anos / indefinidamente'}</strong></li>
        </ul>
      </Section>

      <Section titulo="3. RISCOS">
        <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.7 }}>
          <li>Descalcificação e cárie por higiene inadequada</li>
          <li>Reabsorção radicular (monitorada por radiografias periódicas)</li>
          <li>Recidiva se não usar contenção adequadamente</li>
          <li>Dor e desconforto nos primeiros dias após cada ajuste</li>
        </ul>
      </Section>

      <Section titulo="4. LIMITAÇÕES DO RESULTADO">
        Entendo que o resultado depende significativamente da minha colaboração e que o profissional não garante resultado específico, mas se compromete a empreender todos os esforços técnicos para atingir o melhor resultado possível.
      </Section>
    </>
  );
}

function TcleClareamento({ vars, extras }: { vars: DocumentoVars; extras?: Record<string, string> }) {
  const tecnica = extras?.tecnica || '';
  return (
    <>
      <InfoBar>
        <InfoRow label="Paciente" value={vars.PACIENTE_NOME} />
        <InfoRow label="CPF" value={vars.PACIENTE_CPF} />
        <InfoRow label="Profissional" value={vars.DENTISTA_NOME || vars.CLINICA_DENTISTA_NOME} />
        <InfoRow label="CRO" value={vars.DENTISTA_CRO || vars.CLINICA_CRO_RESPONSAVEL} />
      </InfoBar>

      <div style={{ marginBottom: 10 }}>
        <p style={{ fontWeight: 700, marginBottom: 4 }}>Técnica utilizada:</p>
        <div style={{ display: 'flex', gap: 16, fontSize: 10.5 }}>
          {['Consultório (H₂O₂ 35–38%)', 'Caseiro (carbamida 10–16%)', 'Técnica combinada'].map(t => (
            <span key={t}>[ {tecnica === t ? '✓' : ' '} ] {t}</span>
          ))}
        </div>
        <p style={{ marginTop: 6, fontSize: 10.5 }}>Número de sessões previstas: <strong>{extras?.sessoes || '___'}</strong></p>
      </div>

      <Section titulo="1. EFEITOS ESPERADOS E RISCOS">
        <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.7 }}>
          <li>Sensibilidade dentária temporária (muito comum, cede em 24–72h)</li>
          <li>Irritação gengival se houver contato do gel com a gengiva</li>
          <li>Resultado variável conforme a cor original e tipo de mancha</li>
          <li>Dentes com restaurações não clareiam (podem necessitar troca futura)</li>
        </ul>
      </Section>

      <Section titulo="2. CUIDADOS">
        Evitar alimentos e bebidas pigmentadas por 15 dias após as sessões; não fumar; usar dentifrício dessensibilizante se necessário.
      </Section>

      <Section titulo="3. CONTRAINDICAÇÕES VERIFICADAS">
        Confirmo não apresentar: gestação ou amamentação, hipersensibilidade dentinária grave, restaurações extensas nos dentes anteriores, exposição radicular severa, alergia ao peróxido.
      </Section>
    </>
  );
}

function TcleEndodontia({ vars }: { vars: DocumentoVars }) {
  return (
    <>
      <InfoBar>
        <InfoRow label="Paciente" value={vars.PACIENTE_NOME} />
        <InfoRow label="CPF" value={vars.PACIENTE_CPF} />
        <InfoRow label="Profissional" value={vars.DENTISTA_NOME || vars.CLINICA_DENTISTA_NOME} />
        <InfoRow label="CRO" value={vars.DENTISTA_CRO || vars.CLINICA_CRO_RESPONSAVEL} />
      </InfoBar>

      <Section titulo="1. DESCRIÇÃO DO PROCEDIMENTO">
        O tratamento endodôntico (tratamento de canal) consiste na remoção da polpa dentária inflamada ou necrosada, limpeza, modelagem e obturação dos canais radiculares, visando preservar o dente. Pode ser realizado em uma ou mais sessões.
      </Section>

      <Section titulo="2. RISCOS E COMPLICAÇÕES">
        <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.7 }}>
          <li>Dor e sensibilidade por alguns dias após cada sessão</li>
          <li>Fratura de instrumento no canal (rara; pode necessitar reintervenção)</li>
          <li>Perfuração radicular (rara)</li>
          <li>Reinfecção ou falha do tratamento (necessitando retratamento ou extração)</li>
          <li>Reação à anestesia</li>
          <li>Escurecimento do dente tratado ao longo do tempo</li>
        </ul>
      </Section>

      <Section titulo="3. NECESSIDADE DE PROTEÇÃO PÓS-TRATAMENTO">
        Após a conclusão do canal, o dente estará enfraquecido e necessitará de proteção com coroa ou restauração extensa. Estou ciente de que este procedimento adicional terá custo separado.
      </Section>

      <Section titulo="4. ALTERNATIVAS">
        A alternativa ao tratamento endodôntico é a extração do dente, com posterior reabilitação por prótese ou implante.
      </Section>
    </>
  );
}

function TcleProtese({ vars, extras }: { vars: DocumentoVars; extras?: Record<string, string> }) {
  const tipo = extras?.tipo_protese || '';
  return (
    <>
      <InfoBar>
        <InfoRow label="Paciente" value={vars.PACIENTE_NOME} />
        <InfoRow label="CPF" value={vars.PACIENTE_CPF} />
        <InfoRow label="Profissional" value={vars.DENTISTA_NOME || vars.CLINICA_DENTISTA_NOME} />
        <InfoRow label="CRO" value={vars.DENTISTA_CRO || vars.CLINICA_CRO_RESPONSAVEL} />
      </InfoBar>

      <div style={{ marginBottom: 10 }}>
        <p style={{ fontWeight: 700, marginBottom: 4 }}>Tipo de prótese:</p>
        <div style={{ display: 'flex', gap: 16, fontSize: 10.5 }}>
          {['Parcial removível (grampo)', 'Total superior', 'Total inferior', 'Flexível'].map(t => (
            <span key={t}>[ {tipo === t ? '✓' : ' '} ] {t}</span>
          ))}
        </div>
      </div>

      <Section titulo="1. DESCRIÇÃO">
        A prótese removível substitui dentes ausentes e pode ser inserida e removida pelo próprio paciente. Demanda consultas de moldagem, ajuste e acompanhamento.
      </Section>

      <Section titulo="2. RISCOS E LIMITAÇÕES">
        <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.7 }}>
          <li>Período de adaptação de 2–4 semanas (desconforto, dificuldade de fala e mastigação)</li>
          <li>Reabsorção óssea progressiva na região edêntula</li>
          <li>Necessidade de reembasamento ou reconfecção ao longo do tempo</li>
          <li>Dentes grampeadores podem sofrer maior estresse (risco de fratura ou cárie)</li>
        </ul>
      </Section>

      <Section titulo="3. MANUTENÇÃO">
        A prótese deve ser removida à noite, higienizada com escova própria e solução efervescente. Consultas de acompanhamento anuais são recomendadas para avaliação do encaixe e saúde dos tecidos.
      </Section>
    </>
  );
}

function TcleFaceta({ vars }: { vars: DocumentoVars }) {
  return (
    <>
      <InfoBar>
        <InfoRow label="Paciente" value={vars.PACIENTE_NOME} />
        <InfoRow label="CPF" value={vars.PACIENTE_CPF} />
        <InfoRow label="Profissional" value={vars.DENTISTA_NOME || vars.CLINICA_DENTISTA_NOME} />
        <InfoRow label="CRO" value={vars.DENTISTA_CRO || vars.CLINICA_CRO_RESPONSAVEL} />
      </InfoBar>

      <Section titulo="1. DESCRIÇÃO">
        Facetas e laminados são lâminas ultrafinas de porcelana ou resina composta coladas sobre a face vestibular dos dentes para melhorar estética (cor, forma, tamanho). Podem exigir desgaste mínimo a moderado do esmalte.
      </Section>

      <Section titulo="2. CARÁTER IRREVERSÍVEL">
        O desgaste do esmalte necessário à instalação é <strong>irreversível</strong>. Estou ciente de que, caso as facetas sejam removidas futuramente, os dentes necessitarão de nova restauração.
      </Section>

      <Section titulo="3. RISCOS">
        <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.7 }}>
          <li>Sensibilidade temporária após o preparo e durante o período de provisórios</li>
          <li>Descolamento (necessitando cimentação nova)</li>
          <li>Fratura (risco maior em pacientes com bruxismo)</li>
          <li>Alteração de cor ao longo dos anos</li>
        </ul>
      </Section>

      <Section titulo="4. LIMITAÇÕES">
        O resultado estético final pode variar conforme a cor original dos dentes, a estrutura de esmalte disponível e a colaboração do paciente. Bruxismo severo é contraindicação relativa.
      </Section>
    </>
  );
}

function TcleEnxerto({ vars }: { vars: DocumentoVars }) {
  return (
    <>
      <InfoBar>
        <InfoRow label="Paciente" value={vars.PACIENTE_NOME} />
        <InfoRow label="CPF" value={vars.PACIENTE_CPF} />
        <InfoRow label="Profissional" value={vars.DENTISTA_NOME || vars.CLINICA_DENTISTA_NOME} />
        <InfoRow label="CRO" value={vars.DENTISTA_CRO || vars.CLINICA_CRO_RESPONSAVEL} />
      </InfoBar>

      <Section titulo="1. DESCRIÇÃO">
        O enxerto ósseo visa aumentar o volume ósseo para viabilizar a instalação de implante(s). Pode ser autógeno (do próprio paciente), xenógeno (origem bovina/suína) ou aloplástico (biomaterial sintético).
      </Section>

      <Section titulo="2. RISCOS E COMPLICAÇÕES">
        <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.7 }}>
          <li>Dor, inchaço e hematoma pós-operatório</li>
          <li>Infecção do sítio receptor</li>
          <li>Reabsorção parcial ou total do enxerto</li>
          <li>Exposição da membrana de colágeno (quando utilizada)</li>
          <li>Necessidade de nova intervenção se o resultado for insuficiente</li>
        </ul>
      </Section>

      <Section titulo="3. TEMPO DE CONSOLIDAÇÃO">
        O período de cicatrização/integração do enxerto varia de 4 a 9 meses antes da instalação do implante, conforme avaliação por tomografia computadorizada.
      </Section>
    </>
  );
}

function TclePeriodontal({ vars }: { vars: DocumentoVars }) {
  return (
    <>
      <InfoBar>
        <InfoRow label="Paciente" value={vars.PACIENTE_NOME} />
        <InfoRow label="CPF" value={vars.PACIENTE_CPF} />
        <InfoRow label="Profissional" value={vars.DENTISTA_NOME || vars.CLINICA_DENTISTA_NOME} />
        <InfoRow label="CRO" value={vars.DENTISTA_CRO || vars.CLINICA_CRO_RESPONSAVEL} />
      </InfoBar>

      <Section titulo="1. DESCRIÇÃO">
        O tratamento periodontal visa controlar a doença periodontal (periodontite/gengivite) por meio de raspagem e alisamento radicular (RAR), podendo incluir cirurgia periodontal com retalho (acesso subgengival para limpeza mais profunda).
      </Section>

      <Section titulo="2. RISCOS">
        <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.7 }}>
          <li>Sensibilidade dentinária temporária após raspagem</li>
          <li>Sangramento e desconforto nos primeiros dias</li>
          <li>Recessão gengival (exposição de raiz — pode ocorrer com a resolução da inflamação)</li>
          <li>Infecção pós-operatória (cirurgia)</li>
          <li>Recidiva da doença periodontal se não houver manutenção</li>
        </ul>
      </Section>

      <Section titulo="3. MANUTENÇÃO INDISPENSÁVEL">
        O tratamento periodontal requer manutenção periódica (a cada 3–6 meses) para evitar recidiva. A ausência de manutenção exime o profissional de responsabilidade pela regressão dos resultados.
      </Section>
    </>
  );
}

function TcleSedacao({ vars }: { vars: DocumentoVars }) {
  return (
    <>
      <InfoBar>
        <InfoRow label="Paciente" value={vars.PACIENTE_NOME} />
        <InfoRow label="CPF" value={vars.PACIENTE_CPF} />
        <InfoRow label="Data de Nascimento" value={vars.PACIENTE_NASCIMENTO} />
        <InfoRow label="Profissional" value={vars.DENTISTA_NOME || vars.CLINICA_DENTISTA_NOME} />
        <InfoRow label="CRO" value={vars.DENTISTA_CRO || vars.CLINICA_CRO_RESPONSAVEL} />
      </InfoBar>

      <Section titulo="1. DESCRIÇÃO">
        A sedação consciente é uma técnica farmacológica que reduz a ansiedade e o desconforto durante o atendimento odontológico, mantendo o paciente responsivo a comandos verbais. Pode ser realizada por via oral (ansiolíticos), inalatória (óxido nitroso/O₂) ou endovenosa, conforme indicação clínica.
      </Section>

      <Section titulo="2. INDICAÇÕES">
        <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.7 }}>
          <li>Ansiedade e fobia dental intensa</li>
          <li>Procedimentos de longa duração</li>
          <li>Reflexo de vômito exacerbado</li>
          <li>Pacientes com dificuldade de cooperação (TEA, TDAH, PCD)</li>
        </ul>
      </Section>

      <Section titulo="3. RISCOS E COMPLICAÇÕES">
        <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.7 }}>
          <li>Sonolência residual após o procedimento</li>
          <li>Náuseas e vômitos (mais frequentes com sedação oral)</li>
          <li>Reação paradoxal (agitação — rara)</li>
          <li>Depressão respiratória leve (monitorada continuamente)</li>
          <li>Reação alérgica ao agente sedativo (rara)</li>
        </ul>
      </Section>

      <Section titulo="4. CUIDADOS PRÉ E PÓS-SEDAÇÃO">
        <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.7 }}>
          <li>Jejum mínimo de 4 horas para líquidos claros e 6 horas para sólidos (sedação profunda)</li>
          <li>Não dirigir veículos nas 12 horas seguintes ao procedimento</li>
          <li>Acompanhante adulto responsável obrigatório</li>
          <li>Informar uso de medicamentos, álcool ou substâncias psicoativas</li>
        </ul>
      </Section>

      <Section titulo="5. CONTRAINDICAÇÕES VERIFICADAS">
        Confirmo não apresentar: gravidez, glaucoma, hipersensibilidade a benzodiazepínicos (se via oral), insuficiência respiratória grave, alergia ao óxido nitroso (se inalatório).
      </Section>
    </>
  );
}

function TcleImagem({ vars }: { vars: DocumentoVars }) {
  return (
    <>
      <InfoBar>
        <InfoRow label="Paciente" value={vars.PACIENTE_NOME} />
        <InfoRow label="CPF" value={vars.PACIENTE_CPF} />
        <InfoRow label="Data" value={vars.DATA_HOJE} />
        <InfoRow label="Profissional" value={vars.DENTISTA_NOME || vars.CLINICA_DENTISTA_NOME} />
      </InfoBar>

      <Section titulo="1. AUTORIZAÇÃO">
        Autorizo o uso das minhas imagens clínicas (fotografias intraorais e extraorais, radiografias, vídeos e demais registros) para os fins abaixo selecionados:
        <div style={{ marginTop: 8 }}>
          {[
            'Prontuário clínico (uso exclusivo interno — OBRIGATÓRIO)',
            'Apresentações e estudos de caso em contexto educacional (sem identificação)',
            'Publicação em redes sociais e marketing digital da clínica',
            'Publicação científica (artigos, congressos)',
          ].map(item => (
            <div key={item} style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'flex-start' }}>
              <span>[ ]</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section titulo="2. LGPD">
        Esta autorização é voluntária e não condiciona o atendimento odontológico. Posso revogar esta autorização a qualquer tempo mediante solicitação por escrito, nos termos da Lei nº 13.709/2018 (LGPD).
      </Section>

      <Section titulo="3. LIMITAÇÕES">
        Imagens destinadas a redes sociais e marketing poderão ter meu rosto identificado. Para publicações científicas, minha identidade será preservada (sem nome ou elementos identificadores), salvo autorização expressa adicional.
      </Section>
    </>
  );
}

// ─── Mapa de tipos ─────────────────────────────────────────────────────────

const TITULOS: Partial<Record<TipoDocumento, string>> = {
  tcle_cirurgia: 'TCLE — CIRURGIA ORAL / EXTRAÇÃO DENTÁRIA',
  tcle_implante: 'TCLE — IMPLANTE OSSEOINTEGRADO',
  tcle_ortodontia: 'TCLE — TRATAMENTO ORTODÔNTICO',
  tcle_clareamento: 'TCLE — CLAREAMENTO DENTAL',
  tcle_endodontia: 'TCLE — ENDODONTIA (TRATAMENTO DE CANAL)',
  tcle_protese: 'TCLE — PRÓTESE REMOVÍVEL',
  tcle_faceta: 'TCLE — FACETAS / LAMINADOS',
  tcle_enxerto: 'TCLE — ENXERTO ÓSSEO',
  tcle_periodontal: 'TCLE — CIRURGIA PERIODONTAL',
  tcle_sedacao: 'TCLE — SEDAÇÃO CONSCIENTE',
  tcle_imagem: 'AUTORIZAÇÃO DE USO DE IMAGEM (LGPD)',
};

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <p style={{ fontSize: 10.5, fontWeight: 700, color: BRAND.preto, margin: '10px 0 4px', textTransform: 'uppercase', letterSpacing: 0.3 }}>{titulo}</p>
      <div style={{ fontSize: 10.5, color: '#374151', paddingLeft: 8, lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  );
}

// ─── Template principal ────────────────────────────────────────────────────

export const TCLETemplate = forwardRef<HTMLDivElement, Props>(({ vars, tipo, extras }, ref) => {
  const titulo = TITULOS[tipo] ?? 'TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO';

  const conteudo: Record<string, React.ReactNode> = {
    tcle_cirurgia: <TcleCirurgia vars={vars} extras={extras} />,
    tcle_implante: <TcleImplante vars={vars} extras={extras} />,
    tcle_ortodontia: <TcleOrtodontia vars={vars} extras={extras} />,
    tcle_clareamento: <TcleClareamento vars={vars} extras={extras} />,
    tcle_endodontia: <TcleEndodontia vars={vars} />,
    tcle_protese: <TcleProtese vars={vars} extras={extras} />,
    tcle_faceta: <TcleFaceta vars={vars} />,
    tcle_enxerto: <TcleEnxerto vars={vars} />,
    tcle_periodontal: <TclePeriodontal vars={vars} />,
    tcle_sedacao: <TcleSedacao vars={vars} />,
    tcle_imagem: <TcleImagem vars={vars} />,
  };

  return (
    <div ref={ref} id="documento-pdf" style={{ background: '#fff' }}>
      <DocumentoHeader vars={vars} titulo="TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO" subtitulo={titulo} numero={vars.DOCUMENTO_NUMERO} />

      <div style={{ ...pageStyle, paddingTop: 0 }}>
        {conteudo[tipo] ?? <p>Tipo de TCLE não suportado: {tipo}</p>}

        <div style={{ borderTop: `1px dashed #d1d5db`, margin: '16px 0 8px' }} />

        <div style={{
          backgroundColor: BRAND.fundo, border: `1.5px solid ${BRAND.dourado}`,
          borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 10.5,
        }}>
          <p style={{ fontWeight: 700, margin: '0 0 4px' }}>DECLARAÇÃO DE CONSENTIMENTO</p>
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            Declaro que li e compreendi todas as informações acima, tive oportunidade de esclarecer minhas dúvidas e, livremente, consinto com a realização do procedimento descrito.
          </p>
        </div>

        <p style={{ fontSize: 10.5, textAlign: 'center', color: '#4b5563', fontStyle: 'italic', margin: '0 0 12px' }}>
          {vars.CLINICA_NOME || 'Instituto Belém de Odontologia'}, {vars.DATA_HOJE} às {vars.HORA_ATUAL}
        </p>

        <BlocoAssinaturas vars={vars} />

        <DocumentoFooter vars={vars} />
      </div>
    </div>
  );
});

TCLETemplate.displayName = 'TCLETemplate';
