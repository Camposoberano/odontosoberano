import{r as m,j as e}from"./react-core-CNvHvvCs.js";import{D as U,k as I,m as O,d as z,l as G,g as W,w as Y}from"./DashboardLayout-CFyCqjqE.js";import{C as g,c as j,a as y,d as N}from"./card-C6-3Lp1W.js";import{C as J,w as q,A as T,B as L}from"./index-Cvt7sHlZ.js";import{M as K}from"./mobile-table-D7DeR5LK.js";import{f as R,p as v,B as X}from"./pt-BR-EcWlziyK.js";import{a as F}from"./skeleton-CNGF6Yl4.js";import{C as Q}from"./calendar-CBTgBIPr.js";import{D as Z}from"./download-C862uzGo.js";import{ao as ee}from"./ui-B4oQSVTJ.js";import{A as te}from"./activity-Bgk1mn4m.js";import"./react-vendor-C0ECSF8P.js";import"./motion-2wAMjNwt.js";import"./useMutation-DdCVkelN.js";import"./circle-alert-6B2WOWBn.js";import"./check-DsnVQMvg.js";import"./useQuery-DLrQx5iB.js";import"./search-BsDU6L20.js";import"./loader-circle-DlANaXXY.js";import"./pdf-CeYrcm0l.js";import"./charts-BYbH1yqU.js";import"./supabase-wrNIwYyz.js";import"./scroll-area-CUzXQjWi.js";import"./addDays-DPhgG9WW.js";import"./startOfMonth-Blb0s77W.js";import"./chevron-left-JTK068ue.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const oe=ee("Award",[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]]),se=(r,p)=>{const{user:i}=J(),[M,_]=m.useState(!0),[D,k]=m.useState([]),[P,n]=m.useState([]),f=async()=>{if(i)try{_(!0);const{data:d,error:C}=await q.from("dentistas").select("id, nome").eq("user_id",i.id).eq("status","Ativo");if(C)throw C;let l=q.from("agendamentos").select("dentista_id, valor, procedimento, status").eq("user_id",i.id).in("status",["Concluído","Realizado"]);r&&(l=l.gte("data_agendamento",r.toISOString())),p&&(l=l.lte("data_agendamento",p.toISOString()));const{data:b,error:w}=await l;if(w)throw w;let c=q.from("comissoes").select("dentista_id, valor_comissao").eq("user_id",i.id).eq("status","Paga");r&&(c=c.gte("data_inicio",r.toISOString().split("T")[0])),p&&(c=c.lte("data_fim",p.toISOString().split("T")[0]));const{data:B,error:S}=await c;if(S)throw S;const t=(d||[]).map(o=>{const x=(b||[]).filter(h=>h.dentista_id===o.id),$=(B||[]).filter(h=>h.dentista_id===o.id),u=x.length,A=x.reduce((h,E)=>h+Number(E.valor||0),0),V=$.reduce((h,E)=>h+Number(E.valor_comissao||0),0),H=A/1e5*100;return{dentista_id:o.id,dentista_nome:o.nome,total_procedimentos:u,faturamento_total:A,total_comissao:V,crescimento:"+0%",percentual_performance:Math.min(H,100)}}),a=new Map;(b||[]).forEach(o=>{const x=`${o.dentista_id}-${o.procedimento}`,$=(d||[]).find(u=>u.id===o.dentista_id);if($){const u=a.get(x);u?(u.quantidade+=1,u.valor_total+=Number(o.valor||0)):a.set(x,{dentista_id:o.dentista_id,dentista_nome:$.nome,procedimento:o.procedimento,quantidade:1,valor_total:Number(o.valor||0)})}});const s=Array.from(a.values()).sort((o,x)=>x.valor_total-o.valor_total).slice(0,10);k(t),n(s)}catch(d){console.error("Erro ao buscar relatório:",d),T.error("Erro ao carregar relatório de ganho por dentista")}finally{_(!1)}};return m.useEffect(()=>{f()},[i,r,p]),{performanceDentistas:D,topProcedimentos:P,loading:M,refetch:f}};function Fe(){const[r,p]=m.useState(new Date(new Date().setDate(1))),[i,M]=m.useState(new Date),[_,D]=m.useState(!1),[k,P]=m.useState(!1),{performanceDentistas:n,topProcedimentos:f,loading:d}=se(r,i),C=()=>{try{const t=window.open("","_blank");if(!t){T.error("Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-ups.");return}const a=`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Relatório de Ganho por Dentista</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #666; padding-bottom: 10px; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
            .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .summary-card h3 { margin: 0 0 10px 0; font-size: 14px; color: #666; }
            .summary-card .value { font-size: 24px; font-weight: bold; color: #333; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .section-title { margin-top: 30px; font-size: 18px; font-weight: bold; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Relatório de Ganho por Dentista</h1>
          <p>Período: ${R(r,"dd/MM/yyyy",{locale:v})} - ${R(i,"dd/MM/yyyy",{locale:v})}</p>
          
          <div class="summary">
            <div class="summary-card">
              <h3>Faturamento Total</h3>
              <div class="value">R$ ${l.toLocaleString("pt-BR",{minimumFractionDigits:2})}</div>
            </div>
            <div class="summary-card">
              <h3>Comissão Total</h3>
              <div class="value">R$ ${b.toLocaleString("pt-BR",{minimumFractionDigits:2})}</div>
            </div>
            <div class="summary-card">
              <h3>Melhor Performance</h3>
              <div class="value">${w.toFixed(1)}%</div>
            </div>
            <div class="summary-card">
              <h3>Total de Procedimentos</h3>
              <div class="value">${c}</div>
            </div>
          </div>

          <h2 class="section-title">Performance por Dentista</h2>
          <table>
            <thead>
              <tr>
                <th>Dentista</th>
                <th>Procedimentos</th>
                <th>Faturamento</th>
                <th>Comissão</th>
                <th>Performance</th>
                <th>Crescimento</th>
              </tr>
            </thead>
            <tbody>
              ${n.map(s=>`
                <tr>
                  <td>${s.dentista_nome}</td>
                  <td>${s.total_procedimentos}</td>
                  <td>R$ ${(s.faturamento_total||0).toLocaleString("pt-BR",{minimumFractionDigits:2})}</td>
                  <td>R$ ${(s.total_comissao||0).toLocaleString("pt-BR",{minimumFractionDigits:2})}</td>
                  <td>${(s.percentual_performance||0).toFixed(1)}%</td>
                  <td>${s.crescimento}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <h2 class="section-title">Top Procedimentos por Dentista</h2>
          <table>
            <thead>
              <tr>
                <th>Dentista</th>
                <th>Procedimento</th>
                <th>Quantidade</th>
                <th>Valor Total</th>
              </tr>
            </thead>
            <tbody>
              ${f.map(s=>`
                <tr>
                  <td>${s.dentista_nome}</td>
                  <td>${s.procedimento}</td>
                  <td>${s.quantidade}</td>
                  <td>R$ ${(s.valor_total||0).toLocaleString("pt-BR",{minimumFractionDigits:2})}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="no-print" style="margin-top: 30px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Imprimir / Salvar como PDF
            </button>
            <button onclick="window.close()" style="margin-left: 10px; padding: 10px 20px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Fechar
            </button>
          </div>
        </body>
        </html>
      `;t.document.write(a),t.document.close(),T.success("Documento preparado para impressão/exportação!")}catch(t){console.error("Erro ao exportar PDF:",t),T.error("Erro ao exportar relatório")}},l=n.reduce((t,a)=>t+a.faturamento_total,0),b=n.reduce((t,a)=>t+a.total_comissao,0),w=n.length>0?Math.max(...n.map(t=>t.percentual_performance)):0,c=n.reduce((t,a)=>t+a.total_procedimentos,0),B=[{key:"dentista_nome",header:"Dentista"},{key:"procedimento",header:"Procedimento"},{key:"quantidade",header:"Quantidade"},{key:"valor_total",header:"Valor Total",render:t=>`R$ ${(t.valor_total||0).toLocaleString("pt-BR",{minimumFractionDigits:2})}`}],S=t=>e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"font-semibold text-foreground",children:t.procedimento}),e.jsxs(X,{variant:"secondary",children:[t.quantidade||0,"x"]})]}),e.jsxs("div",{className:"text-sm space-y-1",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-muted-foreground",children:"Dentista:"}),e.jsx("span",{className:"font-medium text-foreground",children:t.dentista_nome})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-muted-foreground",children:"Valor Total:"}),e.jsxs("span",{className:"font-medium text-foreground",children:["R$ ",(t.valor_total||0).toLocaleString("pt-BR",{minimumFractionDigits:2})]})]})]})]});return e.jsx(U,{children:e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-4",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl sm:text-3xl font-bold text-foreground",children:"Ganho por Dentista"}),e.jsx("p",{className:"text-muted-foreground",children:"Relatório de performance e faturamento dos dentistas"})]}),e.jsxs("div",{className:"flex flex-col sm:flex-row gap-2",children:[e.jsxs(I,{open:_,onOpenChange:D,children:[e.jsx(O,{asChild:!0,children:e.jsxs(L,{variant:"outline",className:"gap-2 w-full sm:w-auto",children:[e.jsx(z,{className:"w-4 h-4"}),"Início: ",R(r,"dd/MM/yyyy",{locale:v})]})}),e.jsx(G,{className:"w-auto p-0",align:"start",children:e.jsx(Q,{mode:"single",selected:r,onSelect:t=>{t&&(p(t),D(!1))},locale:v,initialFocus:!0})})]}),e.jsxs(I,{open:k,onOpenChange:P,children:[e.jsx(O,{asChild:!0,children:e.jsxs(L,{variant:"outline",className:"gap-2 w-full sm:w-auto",children:[e.jsx(z,{className:"w-4 h-4"}),"Fim: ",R(i,"dd/MM/yyyy",{locale:v})]})}),e.jsx(G,{className:"w-auto p-0",align:"start",children:e.jsx(Q,{mode:"single",selected:i,onSelect:t=>{t&&(M(t),P(!1))},locale:v,initialFocus:!0})})]}),e.jsxs(L,{className:"gap-2 w-full sm:w-auto",onClick:C,disabled:d||n.length===0,children:[e.jsx(Z,{className:"w-4 h-4"}),"Exportar PDF"]})]})]}),d?e.jsx("div",{className:"grid gap-4 md:grid-cols-2 lg:grid-cols-4",children:[1,2,3,4].map(t=>e.jsxs(g,{children:[e.jsx(j,{className:"space-y-0 pb-2",children:e.jsx(F,{className:"h-4 w-32"})}),e.jsxs(y,{children:[e.jsx(F,{className:"h-8 w-24 mb-2"}),e.jsx(F,{className:"h-3 w-20"})]})]},t))}):e.jsxs("div",{className:"grid gap-4 md:grid-cols-2 lg:grid-cols-4",children:[e.jsxs(g,{children:[e.jsxs(j,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(N,{className:"text-sm font-medium",children:"Faturamento Total"}),e.jsx(W,{className:"h-4 w-4 text-muted-foreground"})]}),e.jsxs(y,{children:[e.jsxs("div",{className:"text-2xl font-bold",children:["R$ ",l.toLocaleString("pt-BR",{minimumFractionDigits:2})]}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Período selecionado"})]})]}),e.jsxs(g,{children:[e.jsxs(j,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(N,{className:"text-sm font-medium",children:"Comissão Total"}),e.jsx(Y,{className:"h-4 w-4 text-muted-foreground"})]}),e.jsxs(y,{children:[e.jsxs("div",{className:"text-2xl font-bold",children:["R$ ",b.toLocaleString("pt-BR",{minimumFractionDigits:2})]}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Pagas no período"})]})]}),e.jsxs(g,{children:[e.jsxs(j,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(N,{className:"text-sm font-medium",children:"Melhor Performance"}),e.jsx(oe,{className:"h-4 w-4 text-muted-foreground"})]}),e.jsxs(y,{children:[e.jsxs("div",{className:"text-2xl font-bold",children:[w.toFixed(1),"%"]}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Taxa de sucesso"})]})]}),e.jsxs(g,{children:[e.jsxs(j,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(N,{className:"text-sm font-medium",children:"Total de Procedimentos"}),e.jsx(te,{className:"h-4 w-4 text-muted-foreground"})]}),e.jsxs(y,{children:[e.jsx("div",{className:"text-2xl font-bold",children:c}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Realizados no período"})]})]})]}),e.jsxs(g,{children:[e.jsx(j,{children:e.jsx(N,{children:"Top Procedimentos por Dentista"})}),e.jsx(y,{children:d?e.jsx("div",{className:"space-y-3",children:[1,2,3].map(t=>e.jsx(F,{className:"h-20 w-full"},t))}):f.length===0?e.jsx("p",{className:"text-center text-muted-foreground py-8",children:"Nenhum procedimento encontrado para o período selecionado"}):e.jsx(K,{data:f,columns:B,mobileCardRender:S})})]})]})})}export{Fe as default};
