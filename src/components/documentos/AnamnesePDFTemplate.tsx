import { forwardRef } from 'react';
import { DocumentoVars } from '@/utils/documentoUtils';
import { pageStyle, DocumentoHeader, DocumentoFooter, BRAND } from './DocumentoBase';

// Tipo de anamnese
export type TipoAnamnese =
  | 'anamnese_padrao'
  | 'anamnese_infantil'
  | 'anamnese_transicao'
  | 'anamnese_resumida'
  | 'anamnese_completa'
  | 'anamnese_periodontal'
  | 'anamnese_pcd';

export interface AnamneseData {
  // Campos base (migration 109)
  alergias?: string;
  medicamentos_uso?: string;
  doencas_sistemicas?: string[];
  historico_cirurgias?: string;
  gestante?: boolean;
  fumante?: boolean;
  alcool?: boolean;
  pressao_arterial?: string;
  observacoes?: string;
  // Campos extendidos (migration 117)
  queixa_principal?: string;
  habitos?: Record<string, boolean>;
  historico_dental?: Record<string, boolean>;
  aleitamento?: string;
  perfil_facial?: string;
  sobremordida?: string;
  trespasse_horizontal?: string;
  mordida_cruzada?: boolean;
  desvio_linha_media?: string;
  classe_canino_d?: string;
  classe_canino_e?: string;
  classe_paciente?: string;
  frequencia_respiratoria?: number;
  fc_bpm?: number;
  alteracao_ganglionar?: boolean;
}

interface Props {
  vars: DocumentoVars;
  tipo: TipoAnamnese;
  anamnese?: AnamneseData;
}

// ─── Helpers de renderização ───────────────────────────────────────────────

const linha = { borderBottom: '1px solid #9ca3af', display: 'inline-block', minWidth: 200, height: 14 } as const;

function V({ val, width = 200 }: { val?: string | boolean | number; width?: number }) {
  if (val === undefined || val === null || val === '') {
    return <span style={{ ...linha, minWidth: width }} />;
  }
  if (typeof val === 'boolean') return <strong>{val ? 'Sim' : 'Não'}</strong>;
  return <strong style={{ color: BRAND.preto }}>{String(val)}</strong>;
}

function Linha({ label, val, width }: { label: string; val?: string | boolean | number; width?: number }) {
  return (
    <div style={{ fontSize: 10.5, marginBottom: 5, lineHeight: 1.6 }}>
      <span style={{ color: BRAND.cinza }}>{label}: </span>
      <V val={val} width={width} />
    </div>
  );
}

function Check({ label, checked }: { label: string; checked?: boolean }) {
  return (
    <span style={{ fontSize: 10, marginRight: 14 }}>
      [{checked ? '✓' : ' '}] {label}
    </span>
  );
}

function SecTitulo({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10.5, fontWeight: 800, color: BRAND.preto,
      textTransform: 'uppercase', letterSpacing: 0.5,
      borderLeft: `3px solid ${BRAND.dourado}`, paddingLeft: 8,
      margin: '16px 0 6px',
    }}>{children}</p>
  );
}

function GridDois({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' as const }}>{children}</div>;
}

function Col({ children }: { children: React.ReactNode }) {
  return <div style={{ flex: 1, minWidth: 200 }}>{children}</div>;
}

function BlocoAssinaturaAnamnese({ vars }: { vars: DocumentoVars }) {
  return (
    <div style={{ display: 'flex', gap: 32, marginTop: 28 }}>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <div style={{ borderBottom: '1.5px solid #9ca3af', height: 32, marginBottom: 6 }} />
        <p style={{ fontSize: 10.5, fontWeight: 700, margin: 0 }}>{vars.PACIENTE_NOME || '___________________________________'}</p>
        <p style={{ fontSize: 9.5, color: BRAND.cinza, margin: '2px 0 0' }}>Paciente ou Responsável — CPF: {vars.PACIENTE_CPF || '___.___.___-__'}</p>
      </div>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <div style={{ borderBottom: '1.5px solid #9ca3af', height: 32, marginBottom: 6 }} />
        <p style={{ fontSize: 10.5, fontWeight: 700, margin: 0 }}>{vars.DENTISTA_NOME || vars.CLINICA_DENTISTA_NOME || '___________________________________'}</p>
        <p style={{ fontSize: 9.5, color: BRAND.cinza, margin: '2px 0 0' }}>Cirurgião(ã)-Dentista — CRO: {vars.DENTISTA_CRO || vars.CLINICA_CRO_RESPONSAVEL || '___________'}</p>
      </div>
    </div>
  );
}

// ─── Bloco de identificação do paciente (comum a todos) ───────────────────

function IdentificacaoPaciente({ vars, incluirResponsavel }: { vars: DocumentoVars; incluirResponsavel?: boolean }) {
  return (
    <>
      <div style={{
        backgroundColor: BRAND.fundo, border: `1.5px solid ${BRAND.dourado}`,
        borderRadius: 8, padding: '10px 16px', marginBottom: 12,
      }}>
        <GridDois>
          <Col>
            <Linha label="Nome" val={vars.PACIENTE_NOME} width={220} />
            <Linha label="CPF" val={vars.PACIENTE_CPF} />
            <Linha label="Data de Nascimento" val={vars.PACIENTE_NASCIMENTO} />
            <Linha label="Telefone" val={vars.PACIENTE_TELEFONE} />
          </Col>
          <Col>
            <Linha label="E-mail" val={vars.PACIENTE_EMAIL} width={220} />
            <Linha label="Cidade/UF" val={[vars.PACIENTE_CIDADE, vars.PACIENTE_ESTADO].filter(Boolean).join(' — ') || undefined} />
            <Linha label="Nº Prontuário" val={vars.PACIENTE_PRONTUARIO} />
            <div style={{ fontSize: 10.5, lineHeight: 1.6 }}>
              <span style={{ color: BRAND.cinza }}>Sexo: </span>
              <Check label="M" /> <Check label="F" /> <Check label="Outro" />
            </div>
          </Col>
        </GridDois>
        {incluirResponsavel && (
          <div style={{ borderTop: '1px dashed #d1d5db', marginTop: 8, paddingTop: 8 }}>
            <Linha label="Responsável legal" val={vars.PACIENTE_RESPONSAVEL} width={220} />
            <Linha label="CPF do Responsável" val={vars.PACIENTE_RESPONSAVEL_CPF} />
          </div>
        )}
      </div>
    </>
  );
}

// ─── Bloco de histórico médico (reutilizado em padrão, completa, PCD) ────

function HistoricoMedico({ anamnese }: { anamnese?: AnamneseData }) {
  const doencas = [
    'Hipertensão Arterial', 'Diabetes Mellitus', 'Doenças Cardíacas', 'Marca-passo/Desfibrilador',
    'Distúrbios de coagulação', 'Uso de Anticoagulantes', 'Osteoporose / Bisfosfonatos',
    'Doença da Tireoide', 'Asma / Bronquite / DPOC', 'Doenças Renais', 'Doenças Hepáticas',
    'Doenças Neurológicas', 'Epilepsia / Convulsões', 'HIV/AIDS', 'Hepatite',
    'Tuberculose', 'Neoplasias (Câncer)', 'Radioterapia / Quimioterapia',
    'Doenças Autoimunes', 'Ronco / Apneia do sono',
  ];
  const checked = new Set(anamnese?.doencas_sistemicas ?? []);
  return (
    <>
      <Linha label="Em tratamento médico atualmente?" val={undefined} />
      <Linha label="Medicamentos em uso" val={anamnese?.medicamentos_uso} width={300} />
      <Linha label="Alergias" val={anamnese?.alergias} width={280} />
      <Linha label="Cirurgias anteriores" val={anamnese?.historico_cirurgias} width={260} />
      <div style={{ fontSize: 10.5, marginBottom: 4 }}>
        <Check label="Gestante" checked={anamnese?.gestante} />
        <Check label="Fumante" checked={anamnese?.fumante} />
        <Check label="Álcool" checked={anamnese?.alcool} />
      </div>
      <Linha label="Pressão arterial" val={anamnese?.pressao_arterial} />
      <p style={{ fontSize: 9.5, fontWeight: 700, color: BRAND.cinza, textTransform: 'uppercase', margin: '8px 0 4px' }}>Doenças Sistêmicas (marque todas que se aplicam):</p>
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '2px 0' }}>
        {doencas.map(d => <Check key={d} label={d} checked={checked.has(d)} />)}
      </div>
    </>
  );
}

// ─── Bloco de histórico odontológico ─────────────────────────────────────

function HistoricoOdontologico({ anamnese }: { anamnese?: AnamneseData }) {
  const h = anamnese?.historico_dental ?? {};
  return (
    <>
      <Linha label="Última visita ao dentista" val={undefined} />
      <div style={{ fontSize: 10.5, marginBottom: 4 }}>
        <span style={{ color: BRAND.cinza, marginRight: 6 }}>Já realizou:</span>
        {['Extração', 'Restauração', 'Prótese', 'Canal', 'Ortodontia', 'Implante'].map(t => (
          <Check key={t} label={t} checked={h[t.toLowerCase()]} />
        ))}
      </div>
      <Linha label="Reação adversa à anestesia?" val={undefined} />
      <div style={{ fontSize: 10.5, marginBottom: 4 }}>
        <span style={{ color: BRAND.cinza, marginRight: 6 }}>Queixa principal:</span>
        <V val={anamnese?.queixa_principal} width={280} />
      </div>
      <div style={{ fontSize: 10.5, marginBottom: 4 }}>
        <span style={{ color: BRAND.cinza }}>Sangra gengiva: </span>
        <Check label="Não" /> <Check label="Sim" /> <Check label="Às vezes" />
        <span style={{ marginLeft: 12, color: BRAND.cinza }}>Sensibilidade: </span>
        <Check label="Não" /> <Check label="Sim" />
      </div>
      <div style={{ fontSize: 10.5 }}>
        <span style={{ color: BRAND.cinza }}>Range/aperta dentes: </span>
        <Check label="Não" checked={!anamnese?.habitos?.['bruxismo']} />
        <Check label="Sim" checked={anamnese?.habitos?.['bruxismo']} />
        <span style={{ marginLeft: 12, color: BRAND.cinza }}>Dor na ATM: </span>
        <Check label="Não" /> <Check label="Sim" />
      </div>
    </>
  );
}

// ─── Exame clínico (dentista preenche) ───────────────────────────────────

function ExameClinico({ anamnese }: { anamnese?: AnamneseData }) {
  return (
    <>
      <p style={{ fontSize: 9.5, fontStyle: 'italic', color: BRAND.cinza, margin: '0 0 6px' }}>Preenchido pelo Cirurgião-Dentista</p>
      <GridDois>
        <Col>
          <div style={{ fontSize: 10.5, marginBottom: 4 }}>
            <span style={{ color: BRAND.cinza }}>Perfil facial: </span>
            {['Reto', 'Convexo', 'Côncavo'].map(p => <Check key={p} label={p} checked={anamnese?.perfil_facial === p.toLowerCase()} />)}
          </div>
          <div style={{ fontSize: 10.5, marginBottom: 4 }}>
            <span style={{ color: BRAND.cinza }}>Classe: </span>
            <Check label="I" checked={anamnese?.classe_paciente === 'I'} />
            <Check label="II" checked={anamnese?.classe_paciente === 'II'} />
            <Check label="III" checked={anamnese?.classe_paciente === 'III'} />
          </div>
          <div style={{ fontSize: 10.5, marginBottom: 4 }}>
            <span style={{ color: BRAND.cinza }}>Mordida cruzada: </span>
            <Check label="Não" checked={!anamnese?.mordida_cruzada} />
            <Check label="Sim" checked={anamnese?.mordida_cruzada} />
          </div>
          <Linha label="Desvio linha média" val={anamnese?.desvio_linha_media} />
        </Col>
        <Col>
          <Linha label="Sobremordida" val={anamnese?.sobremordida} />
          <Linha label="Trespasse horizontal" val={anamnese?.trespasse_horizontal} />
          <Linha label="FR (rpm)" val={anamnese?.frequencia_respiratoria} />
          <Linha label="FC (bpm)" val={anamnese?.fc_bpm} />
          <div style={{ fontSize: 10.5 }}>
            <span style={{ color: BRAND.cinza }}>Alt. ganglionar: </span>
            <Check label="Não" checked={!anamnese?.alteracao_ganglionar} />
            <Check label="Sim" checked={anamnese?.alteracao_ganglionar} />
          </div>
        </Col>
      </GridDois>
    </>
  );
}

// ─── Modelos específicos ───────────────────────────────────────────────────

function Padrao({ vars, anamnese }: { vars: DocumentoVars; anamnese?: AnamneseData }) {
  return (
    <>
      <IdentificacaoPaciente vars={vars} />
      <SecTitulo>Queixa Principal e Motivo da Consulta</SecTitulo>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 12px', minHeight: 36, fontSize: 10.5 }}>
        {anamnese?.queixa_principal || ' '}
      </div>
      <SecTitulo>Histórico Médico Geral</SecTitulo>
      <HistoricoMedico anamnese={anamnese} />
      <SecTitulo>Histórico Odontológico</SecTitulo>
      <HistoricoOdontologico anamnese={anamnese} />
      <SecTitulo>Hábitos e Estilo de Vida</SecTitulo>
      <div style={{ fontSize: 10.5 }}>
        <Linha label="Atividade física" val={undefined} />
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: BRAND.cinza }}>Hábitos parafuncionais: </span>
          {['Onicofagia', 'Bruxismo', 'Morder objetos', 'Morder lábios'].map(h => (
            <Check key={h} label={h} checked={anamnese?.habitos?.[h.toLowerCase().replace(' ', '_')]} />
          ))}
        </div>
        <Linha label="Ronco / Apneia do sono diagnosticada" val={undefined} />
        <Linha label="Xerostomia (boca seca)" val={undefined} />
        <Linha label="Halitose auto-percebida" val={undefined} />
        <Linha label="Última radiografia panorâmica (data)" val={undefined} />
        <Linha label="Frequência de escovação" val={undefined} />
      </div>
      <SecTitulo>Dor Orofacial</SecTitulo>
      <div style={{ fontSize: 10.5 }}>
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: BRAND.cinza }}>Dor orofacial: </span><Check label="Não" /><Check label="Sim" />
        </div>
        <Linha label="Localização / Irradiação" val={undefined} />
        <div>
          <span style={{ color: BRAND.cinza }}>Intensidade (VAS 0–10): </span>
          {[0,1,2,3,4,5,6,7,8,9,10].map(n => <Check key={n} label={String(n)} />)}
        </div>
      </div>
      <SecTitulo>Exame Clínico (Dentista)</SecTitulo>
      <ExameClinico anamnese={anamnese} />
      <Linha label="Observações" val={anamnese?.observacoes} width={400} />
    </>
  );
}

function Infantil({ vars, anamnese }: { vars: DocumentoVars; anamnese?: AnamneseData }) {
  return (
    <>
      <p style={{ fontSize: 10, color: BRAND.cinza, fontStyle: 'italic', marginBottom: 8 }}>Pacientes de 0 a 6 anos — Respondida pelo Responsável Legal</p>
      <IdentificacaoPaciente vars={vars} incluirResponsavel />
      <SecTitulo>Motivo da Consulta</SecTitulo>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 12px', minHeight: 32, fontSize: 10.5 }}>
        {anamnese?.queixa_principal || ' '}
      </div>
      <SecTitulo>Histórico Gestacional e Neonatal</SecTitulo>
      <div style={{ fontSize: 10.5 }}>
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: BRAND.cinza }}>Gestação: </span>
          <Check label="Normal" /> <Check label="Com intercorrências" />
          <span style={{ marginLeft: 12, color: BRAND.cinza }}>Parto: </span>
          <Check label="Normal" /> <Check label="Cesáreo" />
        </div>
        <Linha label="Semanas de gestação" val={undefined} />
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: BRAND.cinza }}>UTI Neonatal: </span><Check label="Não" /><Check label="Sim" />
          <span style={{ marginLeft: 12, color: BRAND.cinza }}>Usou O₂ (sonda/intubação): </span><Check label="Não" /><Check label="Sim" />
        </div>
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: BRAND.cinza }}>Aleitamento: </span>
          <Check label="Materno" checked={anamnese?.aleitamento === 'materno'} />
          <Check label="Mamadeira" checked={anamnese?.aleitamento === 'mamadeira'} />
          <Check label="Misto" checked={anamnese?.aleitamento === 'misto'} />
          <Linha label="Até" val={undefined} />
        </div>
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: BRAND.cinza }}>Chupeta: </span><Check label="Não" /><Check label="Sim" />
          <span style={{ marginLeft: 8, color: BRAND.cinza }}>Sucção digital: </span><Check label="Não" /><Check label="Sim" />
        </div>
        <Linha label="1º dente nasceu com" val={undefined} />
        <Linha label="Água fluoretada na cidade" val={undefined} />
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: BRAND.cinza }}>Suplemento de flúor: </span><Check label="Não" /><Check label="Sim — qual: " />
          <span style={{ ...linha, minWidth: 120 }} />
        </div>
        <Linha label="Traumatismo dental anterior" val={undefined} />
      </div>
      <SecTitulo>Saúde Geral da Criança</SecTitulo>
      <Linha label="Medicamentos em uso" val={anamnese?.medicamentos_uso} width={280} />
      <Linha label="Alergias" val={anamnese?.alergias} width={280} />
      <div style={{ fontSize: 10.5 }}>
        {['Asma / Rinite', 'Cardiopatia Congênita', 'Diabetes', 'Epilepsia', 'TEA / TDAH', 'Hemofilia'].map(d => (
          <Check key={d} label={d} checked={anamnese?.doencas_sistemicas?.includes(d)} />
        ))}
      </div>
      <SecTitulo>Hábitos, Sono e Escola</SecTitulo>
      <div style={{ fontSize: 10.5 }}>
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: BRAND.cinza }}>Escovação: </span>
          <Check label="A própria criança" /><Check label="Com ajuda" /><Check label="Responsável faz" />
        </div>
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: BRAND.cinza }}>Ronco / apneia infantil: </span><Check label="Não" /><Check label="Sim" />
          <span style={{ marginLeft: 10, color: BRAND.cinza }}>Respiração ao dormir: </span><Check label="Nasal" /><Check label="Bucal" />
        </div>
        <Linha label="Escola / Série" val={undefined} />
      </div>
      <SecTitulo>Comportamento</SecTitulo>
      <div style={{ fontSize: 10.5 }}>
        <div>
          <span style={{ color: BRAND.cinza }}>Reação ao dentista: </span>
          <Check label="1ª consulta" /><Check label="Calma" /><Check label="Ansiosa" /><Check label="Assustada" />
        </div>
      </div>
      <SecTitulo>Exame Clínico (Dentista)</SecTitulo>
      <div style={{ fontSize: 10.5 }}>
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: BRAND.cinza }}>Respiração: </span>
          <Check label="Nasal" /><Check label="Bucal" /><Check label="Mista" />
        </div>
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: BRAND.cinza }}>Freio lingual: </span><Check label="Normal" /><Check label="Anquiloglossia" />
          <span style={{ marginLeft: 10, color: BRAND.cinza }}>Freio labial: </span><Check label="Normal" /><Check label="Inserção baixa" />
        </div>
        <Linha label="Observações" val={anamnese?.observacoes} width={380} />
      </div>
    </>
  );
}

function Transicao({ vars, anamnese }: { vars: DocumentoVars; anamnese?: AnamneseData }) {
  return (
    <>
      <p style={{ fontSize: 10, color: BRAND.cinza, fontStyle: 'italic', marginBottom: 8 }}>Pacientes de 7 a 12 anos — Dados fornecidos pelo responsável, complementados pelo paciente</p>
      <IdentificacaoPaciente vars={vars} incluirResponsavel />
      <SecTitulo>Motivo da Consulta</SecTitulo>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 12px', minHeight: 32, fontSize: 10.5 }}>
        {anamnese?.queixa_principal || ' '}
      </div>
      <SecTitulo>Saúde Geral (respondido pelo responsável)</SecTitulo>
      <Linha label="Medicamentos em uso" val={anamnese?.medicamentos_uso} width={280} />
      <Linha label="Alergias" val={anamnese?.alergias} width={280} />
      <div style={{ fontSize: 10.5, marginBottom: 4 }}>
        {['Asma / Rinite', 'Cardiopatia', 'Diabetes', 'Epilepsia', 'TEA / TDAH', 'Uso de bisfosfonatos'].map(d => (
          <Check key={d} label={d} checked={anamnese?.doencas_sistemicas?.includes(d)} />
        ))}
      </div>
      <Linha label="Cirurgias anteriores" val={anamnese?.historico_cirurgias} width={260} />
      <SecTitulo>Histórico Odontológico</SecTitulo>
      <HistoricoOdontologico anamnese={anamnese} />
      <SecTitulo>Hábitos Parafuncionais e Sono</SecTitulo>
      <div style={{ fontSize: 10.5 }}>
        <div style={{ marginBottom: 4 }}>
          {['Onicofagia', 'Bruxismo', 'Morder objetos', 'Chupeta (histórico)', 'Sucção digital (histórico)'].map(h => (
            <Check key={h} label={h} />
          ))}
        </div>
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: BRAND.cinza }}>Ronco / apneia: </span><Check label="Não" /><Check label="Sim" />
          <span style={{ marginLeft: 10, color: BRAND.cinza }}>Respiração: </span><Check label="Nasal" /><Check label="Bucal" /><Check label="Mista" />
        </div>
        <Linha label="Escola / Série" val={undefined} />
      </div>
      <SecTitulo>Exame Clínico (Dentista)</SecTitulo>
      <ExameClinico anamnese={anamnese} />
      <Linha label="Observações" val={anamnese?.observacoes} width={400} />
    </>
  );
}

function Resumida({ vars, anamnese }: { vars: DocumentoVars; anamnese?: AnamneseData }) {
  return (
    <>
      <p style={{ fontSize: 10, color: BRAND.cinza, fontStyle: 'italic', marginBottom: 8 }}>Para retornos e consultas de controle — confirmar ou atualizar dados</p>
      <IdentificacaoPaciente vars={vars} />
      <SecTitulo>Atualização de Saúde</SecTitulo>
      <div style={{ fontSize: 10.5 }}>
        <div style={{ marginBottom: 5 }}>
          <span style={{ color: BRAND.cinza }}>Desde a última consulta, houve mudança no estado de saúde? </span>
          <Check label="Não" /><Check label="Sim" />
        </div>
        <Linha label="Se sim, qual?" val={undefined} width={300} />
        <Linha label="Medicamentos novos ou alterados" val={anamnese?.medicamentos_uso} width={280} />
        <Linha label="Alergias novas" val={anamnese?.alergias} width={240} />
        <div style={{ marginBottom: 4 }}>
          <Check label="Gestante" checked={anamnese?.gestante} />
          <Check label="Fumante" checked={anamnese?.fumante} />
          <Linha label="Pressão arterial" val={anamnese?.pressao_arterial} />
        </div>
      </div>
      <SecTitulo>Motivo do Retorno</SecTitulo>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 12px', minHeight: 32, fontSize: 10.5 }}>
        {anamnese?.queixa_principal || ' '}
      </div>
      <SecTitulo>Observações do Profissional</SecTitulo>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 12px', minHeight: 40, fontSize: 10.5 }}>
        {anamnese?.observacoes || ' '}
      </div>
    </>
  );
}

function Completa({ vars, anamnese }: { vars: DocumentoVars; anamnese?: AnamneseData }) {
  return (
    <>
      <p style={{ fontSize: 10, color: BRAND.cinza, fontStyle: 'italic', marginBottom: 8 }}>Modelo completo — baseado no protocolo C-CAP/CFO</p>
      <IdentificacaoPaciente vars={vars} />
      <SecTitulo>Queixa Principal</SecTitulo>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 12px', minHeight: 36, fontSize: 10.5 }}>
        {anamnese?.queixa_principal || ' '}
      </div>
      <SecTitulo>Histórico Médico Completo</SecTitulo>
      <HistoricoMedico anamnese={anamnese} />
      <SecTitulo>Histórico Odontológico</SecTitulo>
      <HistoricoOdontologico anamnese={anamnese} />
      <SecTitulo>Dor Orofacial</SecTitulo>
      <div style={{ fontSize: 10.5 }}>
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: BRAND.cinza }}>Dor orofacial: </span><Check label="Não" /><Check label="Sim" />
        </div>
        <Linha label="Localização" val={undefined} />
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: BRAND.cinza }}>Intensidade (VAS 0–10): </span>
          {[0,1,2,3,4,5,6,7,8,9,10].map(n => <Check key={n} label={String(n)} />)}
        </div>
      </div>
      <SecTitulo>Índices Clínicos (Dentista)</SecTitulo>
      <GridDois>
        <Col>
          <Linha label="Índice de placa (IPV %)" val={undefined} />
          <Linha label="Índice de sangramento (ISG %)" val={undefined} />
          <Linha label="PSR (sextantes)" val={undefined} />
        </Col>
        <Col>
          <Linha label="Profundidade de sondagem máx." val={undefined} />
          <Linha label="Nível de inserção clínica" val={undefined} />
          <Linha label="Recessão gengival" val={undefined} />
        </Col>
      </GridDois>
      <SecTitulo>Exame Clínico</SecTitulo>
      <ExameClinico anamnese={anamnese} />
      <Linha label="Observações" val={anamnese?.observacoes} width={400} />
    </>
  );
}

function Periodontal({ vars, anamnese }: { vars: DocumentoVars; anamnese?: AnamneseData }) {
  return (
    <>
      <p style={{ fontSize: 10, color: BRAND.cinza, fontStyle: 'italic', marginBottom: 8 }}>Foco em saúde periodontal — para triagem e acompanhamento</p>
      <IdentificacaoPaciente vars={vars} />
      <SecTitulo>Queixa Periodontal</SecTitulo>
      <div style={{ fontSize: 10.5 }}>
        <div style={{ marginBottom: 4 }}>
          {['Sangramento gengival', 'Mobilidade dentária', 'Recessão gengival', 'Mau hálito', 'Abscesso periodontal'].map(q => (
            <Check key={q} label={q} />
          ))}
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 12px', minHeight: 28, fontSize: 10.5, marginTop: 4 }}>
          {anamnese?.queixa_principal || ' '}
        </div>
      </div>
      <SecTitulo>Fatores de Risco Periodontal</SecTitulo>
      <div style={{ fontSize: 10.5 }}>
        <div style={{ marginBottom: 4 }}>
          <Check label="Tabagismo" checked={anamnese?.fumante} />
          <Check label="Diabetes" checked={anamnese?.doencas_sistemicas?.includes('Diabetes Mellitus')} />
          <Check label="Estresse" /><Check label="Gravidez" checked={anamnese?.gestante} />
          <Check label="Uso de anticoagulantes" /><Check label="Imunossuprimido" />
        </div>
        <Linha label="Medicamentos em uso" val={anamnese?.medicamentos_uso} width={300} />
        <Linha label="Alergias" val={anamnese?.alergias} width={280} />
      </div>
      <SecTitulo>Índices Periodontais (Dentista)</SecTitulo>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {['S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map(s => (
          <div key={s} style={{ fontSize: 10.5 }}>
            <span style={{ fontWeight: 700 }}>{s}:</span> <span style={{ ...linha, minWidth: 60 }} />
          </div>
        ))}
      </div>
      <div style={{ fontSize: 9.5, color: BRAND.cinza, margin: '4px 0 8px', fontStyle: 'italic' }}>
        PSR: 0 = saudável | 1 = sangramento | 2 = cálculo | 3 = bolsa 3,5–5,5mm | 4 = bolsa ≥6mm | * = furca/recessão
      </div>
      <GridDois>
        <Col>
          <Linha label="Índice de Placa (IPV %)" val={undefined} />
          <Linha label="Índice de Sangramento (ISG %)" val={undefined} />
          <Linha label="Prof. de sondagem máx." val={undefined} />
        </Col>
        <Col>
          <Linha label="Nível de inserção clínica" val={undefined} />
          <Linha label="Recessão gengival" val={undefined} />
          <Linha label="Mobilidade (grau)" val={undefined} />
        </Col>
      </GridDois>
      <Linha label="Diagnóstico periodontal" val={undefined} width={380} />
      <Linha label="Observações" val={anamnese?.observacoes} width={400} />
    </>
  );
}

function PacienteNecessidadesEspeciais({ vars, anamnese }: { vars: DocumentoVars; anamnese?: AnamneseData }) {
  return (
    <>
      <p style={{ fontSize: 10, color: BRAND.cinza, fontStyle: 'italic', marginBottom: 8 }}>Paciente com Necessidades Especiais — dados fornecidos pelo responsável</p>
      <IdentificacaoPaciente vars={vars} incluirResponsavel />
      <SecTitulo>Necessidade Especial</SecTitulo>
      <div style={{ fontSize: 10.5 }}>
        <div style={{ marginBottom: 4 }}>
          {['TEA', 'Síndrome de Down', 'PC (Paralisia Cerebral)', 'Deficiência intelectual', 'Deficiência física', 'Deficiência auditiva', 'Deficiência visual', 'TDAH', 'Outro'].map(n => (
            <Check key={n} label={n} />
          ))}
        </div>
        <Linha label="Laudo / CID" val={undefined} width={280} />
        <Linha label="Grau de comprometimento" val={undefined} width={240} />
      </div>
      <SecTitulo>Comunicação e Comportamento</SecTitulo>
      <div style={{ fontSize: 10.5 }}>
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: BRAND.cinza }}>Comunicação: </span>
          <Check label="Verbal" /><Check label="Gestos" /><Check label="Prancha" /><Check label="PECS" /><Check label="Não verbal" />
        </div>
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: BRAND.cinza }}>Acompanhante necessário durante atendimento: </span>
          <Check label="Não" /><Check label="Sim" />
        </div>
        <Linha label="Adaptações necessárias" val={undefined} width={320} />
        <Linha label="Reações anteriores no dentista" val={undefined} width={320} />
      </div>
      <SecTitulo>Saúde Geral</SecTitulo>
      <Linha label="Medicamentos em uso" val={anamnese?.medicamentos_uso} width={300} />
      <Linha label="Alergias" val={anamnese?.alergias} width={280} />
      <div style={{ fontSize: 10.5, marginBottom: 4 }}>
        {['Epilepsia / Convulsões', 'Cardiopatia', 'Refluxo gastroesofágico', 'Bruxismo', 'Automutilação'].map(d => (
          <Check key={d} label={d} checked={anamnese?.doencas_sistemicas?.includes(d)} />
        ))}
      </div>
      <Linha label="Observações importantes" val={anamnese?.observacoes} width={380} />
    </>
  );
}

// ─── Títulos por tipo ──────────────────────────────────────────────────────

const TITULOS: Record<TipoAnamnese, string> = {
  anamnese_padrao: 'ANAMNESE ODONTOLÓGICA PADRÃO',
  anamnese_infantil: 'ANAMNESE ODONTOLÓGICA INFANTIL (0–6 anos)',
  anamnese_transicao: 'ANAMNESE INFANTIL-ADULTA (7–12 anos)',
  anamnese_resumida: 'ANAMNESE RESUMIDA — RETORNO',
  anamnese_completa: 'ANAMNESE ADULTA COMPLETA (C-CAP/CFO)',
  anamnese_periodontal: 'ANAMNESE PERIODONTAL',
  anamnese_pcd: 'ANAMNESE — PACIENTE COM NECESSIDADES ESPECIAIS',
};

// ─── Template principal ────────────────────────────────────────────────────

export const AnamnesePDFTemplate = forwardRef<HTMLDivElement, Props>(({ vars, tipo, anamnese }, ref) => {
  const titulo = TITULOS[tipo] ?? 'ANAMNESE ODONTOLÓGICA';

  const conteudo: Record<TipoAnamnese, React.ReactNode> = {
    anamnese_padrao: <Padrao vars={vars} anamnese={anamnese} />,
    anamnese_infantil: <Infantil vars={vars} anamnese={anamnese} />,
    anamnese_transicao: <Transicao vars={vars} anamnese={anamnese} />,
    anamnese_resumida: <Resumida vars={vars} anamnese={anamnese} />,
    anamnese_completa: <Completa vars={vars} anamnese={anamnese} />,
    anamnese_periodontal: <Periodontal vars={vars} anamnese={anamnese} />,
    anamnese_pcd: <PacienteNecessidadesEspeciais vars={vars} anamnese={anamnese} />,
  };

  return (
    <div ref={ref} id="documento-pdf" style={{ background: '#fff' }}>
      <DocumentoHeader vars={vars} titulo={titulo} numero={vars.DOCUMENTO_NUMERO} />
      <div style={{ ...pageStyle, paddingTop: 0 }}>
        {conteudo[tipo]}
        <div style={{ borderTop: '1px dashed #d1d5db', margin: '20px 0 12px' }} />
        <p style={{ fontSize: 10, textAlign: 'center', color: '#4b5563', fontStyle: 'italic', marginBottom: 12 }}>
          Declaro que as informações acima são verdadeiras. {vars.CLINICA_CIDADE || 'Belém'}, {vars.DATA_HOJE}
        </p>
        <BlocoAssinaturaAnamnese vars={vars} />
        <DocumentoFooter vars={vars} />
      </div>
    </div>
  );
});

AnamnesePDFTemplate.displayName = 'AnamnesePDFTemplate';
