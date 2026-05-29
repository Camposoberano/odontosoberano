import { forwardRef } from 'react';
import { DocumentoVars } from '@/utils/documentoUtils';
import {
  pageStyle, DocumentoHeader, DocumentoFooter, BlocoAssinaturas,
  Clausula, InfoBar, InfoRow, BRAND,
} from './DocumentoBase';

interface Props { vars: DocumentoVars; }

export const ContratoTemplate = forwardRef<HTMLDivElement, Props>(({ vars }, ref) => {
  return (
    <div ref={ref} id="documento-pdf" style={{ background: '#fff' }}>
      <DocumentoHeader vars={vars} titulo="CONTRATO DE PRESTAÇÃO DE SERVIÇOS ODONTOLÓGICOS" numero={vars.DOCUMENTO_NUMERO} />

      <div style={{ ...pageStyle, paddingTop: 0 }}>
        {/* CONTRATANTE */}
        <p style={{ fontSize: 12, fontWeight: 800, color: BRAND.preto, margin: '0 0 8px', textTransform: 'uppercase', borderLeft: `3px solid ${BRAND.dourado}`, paddingLeft: 8 }}>
          CONTRATANTE (PACIENTE)
        </p>
        <InfoBar>
          <InfoRow label="Nome" value={vars.PACIENTE_NOME} />
          <InfoRow label="Data de Nascimento" value={vars.PACIENTE_NASCIMENTO} />
          <InfoRow label="CPF" value={vars.PACIENTE_CPF} />
          <InfoRow label="RG" value={vars.PACIENTE_RG} />
          <InfoRow label="Endereço" value={[vars.PACIENTE_RUA, vars.PACIENTE_NUMERO, vars.PACIENTE_BAIRRO].filter(Boolean).join(', ')} />
          <InfoRow label="Cidade/Estado" value={[vars.PACIENTE_CIDADE, vars.PACIENTE_ESTADO].filter(Boolean).join(' — ')} />
          <InfoRow label="CEP" value={vars.PACIENTE_CEP} />
          <InfoRow label="Telefone" value={vars.PACIENTE_TELEFONE} />
          <InfoRow label="E-mail" value={vars.PACIENTE_EMAIL} />
        </InfoBar>

        {/* CONTRATADA */}
        <p style={{ fontSize: 12, fontWeight: 800, color: BRAND.preto, margin: '12px 0 8px', textTransform: 'uppercase', borderLeft: `3px solid ${BRAND.dourado}`, paddingLeft: 8 }}>
          CONTRATADA (CLÍNICA)
        </p>
        <InfoBar>
          <InfoRow label="Razão Social" value={vars.CLINICA_NOME} />
          <InfoRow label="CNPJ" value={vars.CLINICA_CNPJ} />
          <InfoRow label="Endereço" value={vars.CLINICA_ENDERECO} />
          <InfoRow label="Cidade/Estado" value={[vars.CLINICA_CIDADE, vars.CLINICA_ESTADO].filter(Boolean).join(' — ')} />
          <InfoRow label="Resp. Técnico" value={vars.CLINICA_DENTISTA_NOME} />
          <InfoRow label="CRO" value={vars.CLINICA_CRO_RESPONSAVEL} />
          <InfoRow label="Telefone" value={vars.CLINICA_TELEFONE} />
        </InfoBar>

        <div style={{ borderTop: `1px dashed #d1d5db`, margin: '16px 0' }} />

        <p style={{ fontSize: 12, fontWeight: 800, color: BRAND.preto, textAlign: 'center', margin: '0 0 12px', letterSpacing: 0.5 }}>
          CLÁUSULAS DO CONTRATO
        </p>

        <Clausula num="CLÁUSULA 1ª" titulo="DO OBJETO">
          <p>O presente contrato tem por objeto a prestação de serviços odontológicos pelo(a) CONTRATADO(A) ao(à) CONTRATANTE, conforme o plano de tratamento descrito no Orçamento nº <strong>{vars.ORCAMENTO_NUMERO || '[Nº Orçamento]'}</strong>, emitido em <strong>{vars.ORCAMENTO_DATA || '[Data]'}</strong>, que passa a integrar este contrato como Anexo I. A Anamnese Clínica e os registros fotográficos do CONTRATANTE constituem o Anexo II deste instrumento.</p>
          {vars.ORCAMENTO_PROCEDIMENTOS && (
            <div style={{ marginTop: 6, padding: '8px 12px', background: BRAND.fundo, borderRadius: 6, fontSize: 10, whiteSpace: 'pre-line' }}>
              {vars.ORCAMENTO_PROCEDIMENTOS}
            </div>
          )}
        </Clausula>

        <Clausula num="CLÁUSULA 2ª" titulo="DO VALOR E FORMA DE PAGAMENTO">
          <p>O valor total dos serviços é de <strong>{vars.ORCAMENTO_VALOR_TOTAL || 'R$ [Valor]'}</strong>, a ser pago na seguinte condição: <strong>{vars.ORCAMENTO_PARCELAS || '[Condição de Pagamento]'}</strong>.</p>
          <p style={{ marginTop: 4 }}>2.1 — O não pagamento na data de vencimento acarretará multa de 2% sobre a parcela, mais juros de mora de 1% ao mês, calculados pro rata die.</p>
          <p>2.2 — Em caso de inadimplência superior a 30 dias, a CONTRATADA poderá suspender os atendimentos até a regularização do débito.</p>
        </Clausula>

        <Clausula num="CLÁUSULA 3ª" titulo="DAS OBRIGAÇÕES DA CONTRATADA">
          <p>3.1 — Executar os serviços com zelo e observância das normas técnicas do CFO e Código de Ética Odontológica vigente.</p>
          <p>3.2 — Utilizar materiais e equipamentos registrados na ANVISA.</p>
          <p>3.3 — Guardar sigilo sobre informações clínicas e pessoais do CONTRATANTE (LGPD — Lei nº 13.709/2018).</p>
          <p>3.4 — Disponibilizar informações sobre diagnóstico, prognóstico e alternativas de tratamento.</p>
          <p>3.5 — Disponibilizar canal de atendimento de urgência ao CONTRATANTE quando necessário.</p>
        </Clausula>

        <Clausula num="CLÁUSULA 4ª" titulo="DAS OBRIGAÇÕES DO CONTRATANTE">
          <p>4.1 — Comparecer às consultas com pontualidade, comunicando cancelamentos com antecedência mínima de 24 horas.</p>
          <p>4.2 — Seguir as orientações clínicas e de higiene bucal fornecidas.</p>
          <p>4.3 — Fornecer informações verídicas sobre saúde geral, medicamentos, alergias e condições preexistentes.</p>
          <p>4.4 — Efetuar os pagamentos nas datas acordadas.</p>
          <p>4.5 — O descumprimento das orientações exime a CONTRATADA de responsabilidade pelos resultados.</p>
        </Clausula>

        <Clausula num="CLÁUSULA 5ª" titulo="DA GARANTIA">
          <p>5.1 — Os serviços terão garantia conforme a natureza de cada procedimento, observadas as instruções de uso e higiene.</p>
          <p>5.2 — A garantia não se aplica em casos de trauma físico, negligência com higiene, uso indevido, não realização de consultas de acompanhamento ou interferência de terceiros.</p>
          <p>5.3 — Restaurações diretas (resina): 1 (um) ano.</p>
          <p>5.4 — Próteses fixas (coroas e pontes): 1 (um) ano.</p>
          <p>5.5 — Implantes: 1 (um) ano após osseointegração.</p>
          <p>5.6 — Tratamento periodontal: 6 (seis) meses, condicionado à realização da manutenção periódica.</p>
          <p>5.7 — Tratamento ortodôntico: sem garantia de resultado específico.</p>
        </Clausula>

        <Clausula num="CLÁUSULA 6ª" titulo="DA RESCISÃO">
          <p>6.1 — O contrato poderá ser rescindido por qualquer das partes com aviso prévio mínimo de 15 dias.</p>
          <p>6.2 — Na rescisão pelo CONTRATANTE após início do tratamento, será devida remuneração proporcional aos serviços já executados.</p>
          <p>6.3 — Na rescisão por descumprimento do CONTRATANTE, os valores pagos por procedimentos já realizados não serão reembolsados.</p>
        </Clausula>

        <Clausula num="CLÁUSULA 7ª" titulo="DA PROTEÇÃO DE DADOS (LGPD)">
          <p>7.1 — Os dados pessoais e de saúde coletados são tratados com base no legítimo interesse (execução contratual) e cumprimento de obrigação legal (art. 7º, II e V, Lei nº 13.709/2018).</p>
          <p>7.2 — Os dados serão utilizados exclusivamente para: execução do tratamento, comunicações relacionadas ao atendimento e cumprimento de obrigações legais.</p>
          <p>7.3 — O CONTRATANTE poderá, a qualquer tempo, solicitar acesso, correção ou exclusão de seus dados.</p>
          <p>7.4 — As imagens e registros clínicos podem ser utilizados para fins exclusivamente clínicos (prontuário, laudos). Uso para fins educacionais ou de marketing requer autorização expressa em TCLE específico.</p>
          <p>7.5 — A assinatura eletrônica deste contrato, quando realizada por meio de plataforma certificada, tem validade jurídica nos termos da Lei nº 14.063/2020.</p>
        </Clausula>

        <Clausula num="CLÁUSULA 8ª" titulo="DO FORO">
          <p>As partes elegem o foro da comarca de <strong>{vars.CLINICA_CIDADE || 'Belém'} — {vars.CLINICA_ESTADO || 'PA'}</strong> para dirimir quaisquer litígios decorrentes deste contrato.</p>
        </Clausula>

        <div style={{ borderTop: `1px dashed #d1d5db`, margin: '16px 0 8px' }} />

        <p style={{ fontSize: 10.5, textAlign: 'center', color: '#4b5563', fontStyle: 'italic', margin: '0 0 16px' }}>
          {vars.CLINICA_CIDADE || 'Belém'}, {vars.DATA_HOJE}
        </p>

        <BlocoAssinaturas vars={vars} linhas={[
          { nome: vars.PACIENTE_NOME ?? 'Paciente', detalhe: `CONTRATANTE — CPF: ${vars.PACIENTE_CPF ?? ''}` },
          { nome: vars.CLINICA_DENTISTA_NOME ?? 'Dentista', detalhe: `CONTRATADA — CRO: ${vars.CLINICA_CRO_RESPONSAVEL ?? ''}` },
        ]} />

        <div style={{ display: 'flex', gap: 32 }}>
          {[1, 2].map(n => (
            <div key={n} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ borderBottom: '1.5px solid #9ca3af', marginBottom: 8, height: 28 }} />
              <p style={{ fontSize: 10, color: BRAND.cinza, margin: 0 }}>TESTEMUNHA {n} — CPF: ___________________</p>
            </div>
          ))}
        </div>

        <DocumentoFooter vars={vars} />
      </div>
    </div>
  );
});

ContratoTemplate.displayName = 'ContratoTemplate';
