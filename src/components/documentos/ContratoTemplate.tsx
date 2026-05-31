import { forwardRef } from 'react';
import { DocumentoVars } from '@/utils/documentoUtils';
import {
  pageStyle, DocumentoHeader, DocumentoFooter, BRAND, InfoBar, InfoRow,
} from './DocumentoBase';

interface Props { vars: DocumentoVars; }

function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ fontSize: 10.5, lineHeight: 1.7, margin: '0 0 6px', color: '#374151', ...style }}>{children}</p>;
}

function SecTitulo({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 800, color: BRAND.preto,
      textTransform: 'uppercase', letterSpacing: 0.4,
      borderLeft: `3px solid ${BRAND.dourado}`, paddingLeft: 8,
      margin: '14px 0 6px',
    }}>{children}</p>
  );
}

function Cl({ num, titulo, children }: { num: string; titulo?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <p style={{ fontSize: 10.5, fontWeight: 700, color: BRAND.preto, margin: '10px 0 4px' }}>
        {num}{titulo ? `: ${titulo}` : ':'}
      </p>
      <div style={{ fontSize: 10.5, color: '#374151', lineHeight: 1.7, paddingLeft: 0 }}>
        {children}
      </div>
    </div>
  );
}

export const ContratoTemplate = forwardRef<HTMLDivElement, Props>(({ vars }, ref) => {
  const pacEndereco = [vars.PACIENTE_RUA, vars.PACIENTE_NUMERO].filter(Boolean).join(', ');

  return (
    <div ref={ref} id="documento-pdf" style={{ background: '#fff' }}>
      <DocumentoHeader vars={vars} titulo="CONTRATO DE PRESTAÇÃO DE SERVIÇOS ODONTOLÓGICOS" numero={vars.DOCUMENTO_NUMERO} />

      <div style={{ ...pageStyle, paddingTop: 0 }}>

        {/* Resumo rápido das partes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, color: BRAND.preto, textTransform: 'uppercase', margin: '0 0 4px', letterSpacing: 0.4, borderLeft: `3px solid ${BRAND.dourado}`, paddingLeft: 6 }}>CONTRATANTE</p>
            <InfoBar>
              <InfoRow label="Nome" value={vars.PACIENTE_NOME} />
              <InfoRow label="CPF" value={vars.PACIENTE_CPF} />
              <InfoRow label="Nascimento" value={vars.PACIENTE_NASCIMENTO} />
              <InfoRow label="Endereço" value={[pacEndereco, vars.PACIENTE_BAIRRO].filter(Boolean).join(' — ')} />
              <InfoRow label="Cidade/UF" value={[vars.PACIENTE_CIDADE, vars.PACIENTE_ESTADO].filter(Boolean).join('/')} />
              <InfoRow label="CEP" value={vars.PACIENTE_CEP} />
            </InfoBar>
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, color: BRAND.preto, textTransform: 'uppercase', margin: '0 0 4px', letterSpacing: 0.4, borderLeft: `3px solid ${BRAND.dourado}`, paddingLeft: 6 }}>CONTRATADA</p>
            <InfoBar>
              <InfoRow label="Razão Social" value={vars.CLINICA_NOME} />
              <InfoRow label="CNPJ" value={vars.CLINICA_CNPJ} />
              <InfoRow label="Endereço" value={vars.CLINICA_ENDERECO} />
              <InfoRow label="Cidade/UF" value={[vars.CLINICA_CIDADE, vars.CLINICA_ESTADO].filter(Boolean).join('/')} />
              <InfoRow label="Resp. Técnico" value={vars.CLINICA_DENTISTA_NOME} />
              <InfoRow label="CRO" value={vars.CLINICA_CRO_RESPONSAVEL} />
            </InfoBar>
          </div>
        </div>

        {/* Narrativa das partes */}
        <P>
          São partes do presente instrumento: <strong>{vars.PACIENTE_NOME || '[Nome do Paciente]'}</strong>, portador do documento{' '}
          <strong>{vars.PACIENTE_CPF || '[CPF]'}</strong> residente e domiciliado em <strong>{vars.PACIENTE_CIDADE || '[Cidade]'}</strong>,
          à rua <strong>{vars.PACIENTE_RUA || '[Rua]'}</strong>, bairro <strong>{vars.PACIENTE_BAIRRO || '[Bairro]'}</strong>,
          CEP <strong>{vars.PACIENTE_CEP || '[CEP]'}</strong>, doravante denominado <strong>CONTRATANTE</strong>{' '}
          e de outro lado <strong>{vars.CLINICA_NOME || 'Instituto Belém de Odontologia'}</strong>,
          CPF/CNPJ nº <strong>{vars.CLINICA_CNPJ || '[CNPJ]'}</strong> doravante denominada <strong>CONTRATADA</strong>,
          resolvem de comum acordo celebrar o presente Contrato para Prestação de Serviços Odontológicos, com fulcro no
          Código Civil, Código de Defesa do Consumidor e no Código de Ética Odontológico, o qual se regerá pelas seguintes
          cláusulas e condições:
        </P>

        <SecTitulo>Do Objeto do Contrato</SecTitulo>

        <Cl num="CLÁUSULA 1ª">
          <P>O presente instrumento tem por objeto a prestação de serviços pela CONTRATADA apta e habilitada à realização plena e segura do(s) procedimento(s) abaixo discriminado(s) no(a) paciente <strong>{vars.PACIENTE_NOME || '[Nome do Paciente]'}</strong>:</P>
          <div style={{
            border: `1px solid ${BRAND.dourado}`, borderRadius: 6,
            padding: '8px 12px', margin: '6px 0 8px',
            fontSize: 10.5, minHeight: 32, background: BRAND.fundo,
            whiteSpace: 'pre-line',
          }}>
            {vars.CONTRATO_TRATAMENTO || vars.ORCAMENTO_PROCEDIMENTOS || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>[Descrição do tratamento]</span>}
          </div>
          <P><strong>Parágrafo Primeiro:</strong> Os serviços odontológicos contratados compreendem a realização dos procedimentos contratados nas datas e horários de acordo com agendamento prévio.</P>
          <P><strong>Parágrafo Segundo:</strong> A CONTRATADA resta também autorizada a realizar procedimentos não referidos na Cláusula Primeira, desde que no decorrer do ato odontológico verifique-se a sua viabilidade, desde que haja anuência do(a) CONTRATANTE.</P>
          <P><strong>Parágrafo Terceiro:</strong> A CONTRATANTE declara-se ciente dos produtos e materiais utilizados, bem como tem plena consciência de que a durabilidade pode sofrer oscilações em razão de vetores imponderáveis, especialmente a conduta do(a) CONTRATANTE frente aos serviços prestados.</P>
        </Cl>

        <Cl num="CLÁUSULA 2ª">
          <P>O paciente declara, a partir deste contrato travado de boa fé e plena autonomia, que a CONTRATADA foi clara, didática e transparente no que se refere ao procedimento a ser realizado, informando a sua necessidade, conceito, riscos, desconfortos, efeitos colaterais possíveis, alternativas e expectativas em relação ao potencial resultado.</P>
          <P><strong>Parágrafo Único.</strong> Declara, ademais, que tem consciência de que não há garantia de satisfação com o procedimento e sim o dever do profissional da saúde de seguir o roteiro técnico mais adequado e fazer o melhor possível dentro das condições e circunstâncias presentes.</P>
        </Cl>

        <SecTitulo>Dos Custos</SecTitulo>

        <Cl num="CLÁUSULA 3ª">
          <P>As partes ajustam que o valor cobrado corresponde aos custos dos materiais utilizados, materiais descartáveis e mão de obra, totalizando o valor de{' '}
            <strong>{vars.CONTRATO_VALOR_TOTAL || vars.ORCAMENTO_VALOR_TOTAL || 'R$ [Valor Total]'}</strong>.
            {vars.CONTRATO_VALOR_SERVICOS ? (
              <> O valor por serviço é de <strong>{vars.CONTRATO_VALOR_SERVICOS}</strong>.</>
            ) : null}
          </P>
        </Cl>

        <SecTitulo>Obrigações do(a) Paciente Contratante</SecTitulo>

        <Cl num="CLÁUSULA 4ª">
          <P>São obrigações do(a) PACIENTE:</P>
          <ul style={{ margin: '4px 0', paddingLeft: 16, fontSize: 10.5, lineHeight: 1.7, color: '#374151' }}>
            <li>Compreender sua posição de corresponsável no tratamento e seguir rigorosamente todas as orientações do profissional;</li>
            <li>Manter atualizado o cadastro junto à CONTRATADA, para máxima eficiência na comunicação e agendamentos;</li>
            <li>Honrar com o pagamento dos honorários profissionais, de acordo com as condições pactuadas, sob pena de suspensão do tratamento;</li>
            <li>Informar ao(à) CONTRATADO(A) sobre histórico de sensibilidade, alergias a medicamentos e anestésicos, problemas de sangramento, infecções recentes e anteriores tratamentos;</li>
            <li>Comparecer pontualmente às consultas agendadas, desmarcando apenas em casos justificados e com antecedência;</li>
            <li>Em caso de abandono do tratamento, o(a) CONTRATADO(A) exime-se de qualquer responsabilidade pelos resultados, sendo devidos os valores contratados em sua integralidade como compensação por perdas e danos;</li>
            <li>Acatar todas as recomendações e prescrições efetuadas, seja em relação a medicamentos, controles e cuidados antes, durante e após o tratamento;</li>
            <li>Realizar todos os exames solicitados pelo(a) CONTRATADO(A);</li>
            <li>Comparecer às consultas de continuidade de tratamento já iniciado ou urgente;</li>
            <li>Arcar com os custos remanescentes dos procedimentos realizados e não adimplidos;</li>
            <li>Avisar imediatamente qualquer reação adversa, intercorrência ou complicação ao(à) profissional responsável.</li>
          </ul>
        </Cl>

        <SecTitulo>Obrigações do(a) Contratado(a)</SecTitulo>

        <Cl num="CLÁUSULA 5ª">
          <P>São obrigações do(a) CONTRATADO(A):</P>
          <ul style={{ margin: '4px 0', paddingLeft: 16, fontSize: 10.5, lineHeight: 1.7, color: '#374151' }}>
            <li>Executar o tratamento em ambiente seguro, observando os padrões de higiene e sanitários aplicáveis;</li>
            <li>Realizar os procedimentos de acordo com a melhor técnica, observando o estado atual da ciência, o zelo, a prudência e a honestidade;</li>
            <li>Esclarecer previamente o CONTRATANTE sobre vantagens, riscos, consequências e valores de cada procedimento;</li>
            <li>Informar o CONTRATANTE a cada procedimento sobre o plano de tratamento e sua evolução;</li>
            <li>Observar todos os preceitos éticos do Código de Ética Odontológica e demais legislações pertinentes;</li>
            <li>Resguardar a privacidade do CONTRATANTE durante e após o tratamento, especialmente prontuário e dados sensíveis (LGPD);</li>
            <li>Acompanhar o CONTRATANTE durante todo o tratamento;</li>
            <li>Dar assistência necessária durante o período pós-procedimental, até sua completa recuperação;</li>
            <li>Fornecer o prontuário odontológico quando solicitado pelo titular, mediante marcação prévia de agenda.</li>
          </ul>
          <P><strong>Parágrafo Único:</strong> O acompanhamento ficará vinculado ao comprometimento do(a) paciente frente ao procedimento, não sendo responsáveis o profissional e a empresa por eventual abandono ou interrupção precoce dos procedimentos.</P>
        </Cl>

        <SecTitulo>Da Responsabilidade</SecTitulo>

        <Cl num="CLÁUSULA 6ª">
          <P>A responsabilidade assumida pelo(a) CONTRATADO(A) é de meio, ou seja, incumbe ao profissional agir dentro da melhor técnica, despendendo todos os esforços para alcance do objetivo possível no tratamento, sem responsabilizar-se pelo resultado, uma vez que este é sempre permeado pelo imponderável da vida humana.</P>
          <P><strong>Parágrafo Primeiro:</strong> O(A) CONTRATADO(A) não se responsabilizará por consequências ao tratamento geradas pela não cooperação do CONTRATANTE no antes, durante e após o tratamento, ou pela omissão de informações relevantes para o diagnóstico.</P>
          <P><strong>Parágrafo Segundo:</strong> Considera-se não cooperação do paciente o não comparecimento às consultas, atrasos injustificados, abandono do tratamento e não observação das recomendações prescritas.</P>
          <P><strong>Parágrafo Terceiro:</strong> O(A) CONTRATADO(A) não se responsabilizará por efeitos imprevisíveis ou de baixíssima previsibilidade, desde que observadas a boa técnica e as diretrizes do §1° do art. 14 da Lei n.° 8.078/90, Código de Ética Odontológico e causas excludentes de responsabilidade.</P>
          <P><strong>Parágrafo Quarto:</strong> O(A) CONTRATADO(A) não se responsabiliza, salvo nos casos de manejo inadequado, por qualquer defeito proveniente de máquina, equipamento, material ou substância, sendo responsável o fornecedor do produto.</P>
        </Cl>

        <SecTitulo>Da Proteção de Dados</SecTitulo>

        <Cl num="CLÁUSULA 7ª">
          <P>Em cumprimento à Lei Geral de Proteção de Dados — LGPD (Lei 13.709/2018), a CONTRATADA informa que os dados pessoais coletados serão utilizados para viabilizar a execução do presente Contrato e armazenados durante sua vigência ou por período superior nos casos em que a manutenção se justificar em outra hipótese legal.</P>
          <P><strong>Parágrafo Único:</strong> As partes declaram-se cientes dos direitos, obrigações e penalidades aplicáveis constantes da LGPD e obrigam-se a adotar todas as medidas razoáveis para garantir a proteção dos dados, por si e por seu pessoal, colaboradores e subcontratados.</P>
        </Cl>

        <SecTitulo>Da Rescisão Contratual</SecTitulo>

        <Cl num="CLÁUSULA 8ª">
          <P>Além das hipóteses legais, o presente instrumento poderá ser rescindido pelas partes uma vez verificada a ocorrência do descumprimento de qualquer cláusula ou condição pactuada, bem como pela falência do relacionamento profissional-paciente.</P>
          <P><strong>Parágrafo Primeiro:</strong> A parte que der causa à rescisão permanecerá responsável por todas as perdas e danos ocasionados e provados à parte inocente.</P>
        </Cl>

        <SecTitulo>Do Equilíbrio Contratual</SecTitulo>

        <Cl num="CLÁUSULA 9ª">
          <P>Ajustam as partes, nos termos dos arts. 317, 478 e 479 do Código Civil, que na hipótese de desproporção manifesta entre o custo do serviço estipulado no momento da contratação e aquele do momento de sua execução, por motivos imprevisíveis, será realizado o reequilíbrio econômico-financeiro da avença.</P>
        </Cl>

        <SecTitulo>Da Assinatura Digital</SecTitulo>

        <Cl num="CLÁUSULA 10ª">
          <P>As partes reconhecem como válida e se comprometem a não impugnar a assinatura digital ou eletrônica do presente instrumento, conforme permitido pela legislação vigente, dispensada a assinatura física para a contratação das obrigações aqui previstas.</P>
        </Cl>

        <SecTitulo>Da Autorização de Imagem</SecTitulo>

        <Cl num="CLÁUSULA 11ª">
          <P>Eu autorizo a disponibilidade dos registros do meu tratamento para estudos com fins científicos, ainda que em rede social on-line, estando sempre preservada minha identidade.</P>
        </Cl>

        <SecTitulo>Título Extrajudicial</SecTitulo>

        <Cl num="CLÁUSULA 12ª">
          <P>As partes reconhecem o presente contrato como título executivo extrajudicial, nos termos do artigo 585, II, do Código de Processo Civil.</P>
        </Cl>

        <SecTitulo>Do Foro</SecTitulo>

        <Cl num="CLÁUSULA 13ª">
          <P>As partes elegem o foro da Comarca sede da clínica ou o foro mais próximo dentro da circunscrição para dirimir quaisquer dúvidas a respeito do presente contrato.</P>
        </Cl>

        <P style={{ marginTop: 12, fontStyle: 'italic', color: '#6b7280', fontSize: 10 }}>
          E, por estarem justos e contratados, firmam o presente Contrato em 02 (duas) vias de igual teor e forma.
        </P>

        <div style={{ borderTop: `1px dashed #d1d5db`, margin: '16px 0 8px' }} />

        <p style={{ fontSize: 10.5, textAlign: 'center', color: '#4b5563', fontStyle: 'italic', margin: '0 0 24px' }}>
          {vars.CLINICA_NOME || 'Instituto Belém de Odontologia'}, {vars.DATA_HOJE_EXTENSO || vars.DATA_HOJE}
        </p>

        {/* Assinaturas */}
        <div style={{ display: 'flex', gap: 32, marginBottom: 24 }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ borderBottom: `1.5px solid #9ca3af`, marginBottom: 8, height: 36 }} />
            <p style={{ fontSize: 11, fontWeight: 700, color: BRAND.preto, margin: '0 0 2px' }}>{vars.PACIENTE_NOME || '________________________________'}</p>
            <p style={{ fontSize: 9.5, color: BRAND.cinza, margin: 0 }}>CONTRATANTE — CPF: {vars.PACIENTE_CPF || '___.___.___-__'}</p>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ borderBottom: `1.5px solid #9ca3af`, marginBottom: 8, height: 36 }} />
            <p style={{ fontSize: 11, fontWeight: 700, color: BRAND.preto, margin: '0 0 2px' }}>{vars.CLINICA_DENTISTA_NOME || vars.DENTISTA_NOME || '________________________________'}</p>
            <p style={{ fontSize: 9.5, color: BRAND.cinza, margin: 0 }}>CONTRATADA — CRO: {vars.CLINICA_CRO_RESPONSAVEL || vars.DENTISTA_CRO || '_______________'}</p>
          </div>
        </div>

        {/* Testemunhas */}
        <div style={{ display: 'flex', gap: 32 }}>
          {[1, 2].map(n => (
            <div key={n} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ borderBottom: `1.5px solid #9ca3af`, marginBottom: 8, height: 28 }} />
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
