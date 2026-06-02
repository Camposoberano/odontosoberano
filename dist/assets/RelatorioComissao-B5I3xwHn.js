import{r as m,j as e}from"./react-core-CNvHvvCs.js";import{D as I,k as M,m as P,d as B,l as L,e as A,g as O,y as V}from"./DashboardLayout-itu0HZSR.js";import{C as h,c as q,a as g,d as G}from"./card-BSsXytcC.js";import{C as H,w as T,A as D,B as k}from"./index-DKyzeVOt.js";import{f as l,p as c,B as E}from"./pt-BR-DGVSylIp.js";import{M as Q}from"./mobile-table-uoQ1zWUw.js";import{a as C}from"./skeleton-D4Sic3bK.js";import{C as z}from"./calendar-CH8lj43G.js";import{D as U}from"./download-C862uzGo.js";import{C as W}from"./clock-BstS4zQr.js";import{ao as Y}from"./ui-B4oQSVTJ.js";import"./react-vendor-C0ECSF8P.js";import"./motion-2wAMjNwt.js";import"./useMutation-e-l31voH.js";import"./circle-alert-6B2WOWBn.js";import"./check-DsnVQMvg.js";import"./useQuery-CUH1e-oi.js";import"./search-BsDU6L20.js";import"./loader-circle-DlANaXXY.js";import"./pdf-CeYrcm0l.js";import"./charts-BYbH1yqU.js";import"./supabase-wrNIwYyz.js";import"./scroll-area-CGnCghRh.js";import"./addDays-CYN4CagL.js";import"./startOfMonth-TB8cA6hL.js";import"./chevron-left-JTK068ue.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J=Y("ChartPie",[["path",{d:"M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z",key:"pzmjnu"}],["path",{d:"M21.21 15.89A10 10 0 1 1 8 2.83",key:"k2fpak"}]]),K=(i,f)=>{const{user:r}=H(),[R,j]=m.useState(!0),[v,$]=m.useState([]),[y,n]=m.useState({total_pago:0,total_pendente:0,total_geral:0,quantidade_paga:0,quantidade_pendente:0}),t=async()=>{if(r)try{j(!0);const{data:p,error:N}=await T.from("dentistas").select("id, nome").eq("user_id",r.id);if(N)throw N;let d=T.from("comissoes").select("*").eq("user_id",r.id).order("data_inicio",{ascending:!1});i&&(d=d.gte("data_inicio",i.toISOString().split("T")[0])),f&&(d=d.lte("data_fim",f.toISOString().split("T")[0]));const{data:_,error:b}=await d;if(b)throw b;const x=(_||[]).map(a=>{const o=(p||[]).find(F=>F.id===a.dentista_id);return{id:a.id,dentista_id:a.dentista_id,dentista_nome:o?.nome||"Dentista não encontrado",referencia:a.referencia,data_inicio:a.data_inicio,data_fim:a.data_fim,valor_total_procedimentos:Number(a.valor_total_procedimentos||0),percentual_comissao:Number(a.percentual_comissao||0),valor_comissao:Number(a.valor_comissao||0),status:a.status,data_pagamento:a.data_pagamento,forma_pagamento:a.forma_pagamento}}),w=x.filter(a=>a.status==="Paga").reduce((a,o)=>a+o.valor_comissao,0),s=x.filter(a=>a.status==="Pendente").reduce((a,o)=>a+o.valor_comissao,0),u=x.filter(a=>a.status==="Paga").length,S=x.filter(a=>a.status==="Pendente").length;$(x),n({total_pago:w,total_pendente:s,total_geral:w+s,quantidade_paga:u,quantidade_pendente:S})}catch(p){console.error("Erro ao buscar relatório de comissões:",p),D.error("Erro ao carregar relatório de comissões")}finally{j(!1)}};return m.useEffect(()=>{t()},[r,i,f]),{comissoes:v,resumo:y,loading:R,refetch:t}};function we(){const[i,f]=m.useState(new Date(new Date().setDate(1))),[r,R]=m.useState(new Date),[j,v]=m.useState(!1),[$,y]=m.useState(!1),{comissoes:n,resumo:t,loading:p}=K(i,r),N=()=>{try{const s=window.open("","_blank");if(!s){D.error("Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-ups.");return}const u=n.reduce((o,F)=>o+(F.valor_total_procedimentos||0),0),S=t.total_geral>0&&u>0?(t.total_geral/u*100).toFixed(1):"0.0",a=`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Relatório de Comissões</title>
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
            .badge-paga { background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .badge-pendente { background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Relatório de Comissões</h1>
          <p>Período: ${l(i,"dd/MM/yyyy",{locale:c})} - ${l(r,"dd/MM/yyyy",{locale:c})}</p>
          
          <div class="summary">
            <div class="summary-card">
              <h3>Total Pago</h3>
              <div class="value">R$ ${t.total_pago.toLocaleString("pt-BR",{minimumFractionDigits:2})}</div>
              <p style="font-size: 12px; color: #10b981;">${t.quantidade_paga} comissões</p>
            </div>
            <div class="summary-card">
              <h3>Total Pendente</h3>
              <div class="value">R$ ${t.total_pendente.toLocaleString("pt-BR",{minimumFractionDigits:2})}</div>
              <p style="font-size: 12px; color: #f59e0b;">${t.quantidade_pendente} comissões</p>
            </div>
            <div class="summary-card">
              <h3>Total Geral</h3>
              <div class="value">R$ ${t.total_geral.toLocaleString("pt-BR",{minimumFractionDigits:2})}</div>
            </div>
            <div class="summary-card">
              <h3>% Médio</h3>
              <div class="value">${S}%</div>
            </div>
          </div>

          <h2 class="section-title">Comissões Detalhadas</h2>
          <table>
            <thead>
              <tr>
                <th>Dentista</th>
                <th>Referência</th>
                <th>Período</th>
                <th>Faturamento</th>
                <th>% Comissão</th>
                <th>Valor Comissão</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${n.map(o=>`
                <tr>
                  <td>${o.dentista_nome}</td>
                  <td>${o.referencia}</td>
                  <td>${l(new Date(o.data_inicio),"dd/MM/yyyy")} - ${l(new Date(o.data_fim),"dd/MM/yyyy")}</td>
                  <td>R$ ${o.valor_total_procedimentos.toLocaleString("pt-BR",{minimumFractionDigits:2})}</td>
                  <td>${o.percentual_comissao}%</td>
                  <td>R$ ${o.valor_comissao.toLocaleString("pt-BR",{minimumFractionDigits:2})}</td>
                  <td><span class="badge-${o.status.toLowerCase()}">${o.status}</span></td>
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
      `;s.document.write(a),s.document.close(),D.success("Documento preparado para impressão/exportação!")}catch(s){console.error("Erro ao exportar PDF:",s),D.error("Erro ao exportar relatório")}},d=s=>s==="Paga"?"default":"secondary",_=n.reduce((s,u)=>s+(u.valor_total_procedimentos||0),0),b=t.total_geral>0&&_>0?(t.total_geral/_*100).toFixed(1):"0.0",x=[{key:"dentista_nome",header:"Dentista"},{key:"referencia",header:"Referência"},{key:"valor_total_procedimentos",header:"Faturamento",render:s=>`R$ ${(Number(s)||0).toLocaleString("pt-BR",{minimumFractionDigits:2})}`},{key:"percentual_comissao",header:"% Comissão",render:s=>`${Number(s)||0}%`},{key:"valor_comissao",header:"Valor",render:s=>`R$ ${(Number(s)||0).toLocaleString("pt-BR",{minimumFractionDigits:2})}`},{key:"status",header:"Status",render:s=>e.jsx(E,{variant:d(s),children:s})}],w=s=>e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex justify-between items-start",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold",children:s.dentista_nome}),e.jsx("p",{className:"text-sm text-muted-foreground",children:s.referencia})]}),e.jsx(E,{variant:d(s.status),children:s.status})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-2 text-sm",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-muted-foreground block",children:"Faturamento"}),e.jsxs("span",{className:"font-medium",children:["R$ ",(s.valor_total_procedimentos||0).toLocaleString("pt-BR",{minimumFractionDigits:2})]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-muted-foreground block",children:"% Comissão"}),e.jsxs("span",{className:"font-medium",children:[s.percentual_comissao,"%"]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-muted-foreground block",children:"Valor Comissão"}),e.jsxs("span",{className:"font-medium text-primary",children:["R$ ",(s.valor_comissao||0).toLocaleString("pt-BR",{minimumFractionDigits:2})]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-muted-foreground block",children:"Período"}),e.jsxs("span",{className:"font-medium text-sm",children:[l(new Date(s.data_inicio),"dd/MM",{locale:c})," - ",l(new Date(s.data_fim),"dd/MM",{locale:c})]})]})]})]});return e.jsx(I,{children:e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-4",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl sm:text-3xl font-bold text-foreground",children:"Relatório de Comissões"}),e.jsx("p",{className:"text-muted-foreground",children:"Análise detalhada das comissões dos profissionais"})]}),e.jsxs("div",{className:"flex flex-col sm:flex-row gap-2",children:[e.jsxs(M,{open:j,onOpenChange:v,children:[e.jsx(P,{asChild:!0,children:e.jsxs(k,{variant:"outline",className:"gap-2 w-full sm:w-auto",children:[e.jsx(B,{className:"w-4 h-4"}),"Início: ",l(i,"dd/MM/yyyy",{locale:c})]})}),e.jsx(L,{className:"w-auto p-0",align:"start",children:e.jsx(z,{mode:"single",selected:i,onSelect:s=>{s&&(f(s),v(!1))},locale:c,initialFocus:!0})})]}),e.jsxs(M,{open:$,onOpenChange:y,children:[e.jsx(P,{asChild:!0,children:e.jsxs(k,{variant:"outline",className:"gap-2 w-full sm:w-auto",children:[e.jsx(B,{className:"w-4 h-4"}),"Fim: ",l(r,"dd/MM/yyyy",{locale:c})]})}),e.jsx(L,{className:"w-auto p-0",align:"start",children:e.jsx(z,{mode:"single",selected:r,onSelect:s=>{s&&(R(s),y(!1))},locale:c,initialFocus:!0})})]}),e.jsxs(k,{className:"gap-2 w-full sm:w-auto",onClick:N,disabled:p||n.length===0,children:[e.jsx(U,{className:"w-4 h-4"}),"Exportar PDF"]})]})]}),p?e.jsx("div",{className:"grid gap-4 md:grid-cols-2 lg:grid-cols-4",children:[1,2,3,4].map(s=>e.jsxs(h,{children:[e.jsx(q,{className:"space-y-0 pb-2",children:e.jsx(C,{className:"h-4 w-32"})}),e.jsxs(g,{children:[e.jsx(C,{className:"h-8 w-24 mb-2"}),e.jsx(C,{className:"h-3 w-20"})]})]},s))}):e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-4",children:[e.jsx(h,{children:e.jsxs(g,{className:"p-6",children:[e.jsx("div",{className:"flex items-center justify-between",children:e.jsxs("div",{className:"flex items-center",children:[e.jsx(A,{className:"h-4 w-4 text-green-500"}),e.jsx("span",{className:"ml-2 text-sm font-medium",children:"Total Pago"})]})}),e.jsxs("div",{className:"mt-2",children:[e.jsxs("div",{className:"text-2xl font-bold text-green-600",children:["R$ ",t.total_pago.toLocaleString("pt-BR",{minimumFractionDigits:2})]}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:[t.quantidade_paga," comissões pagas"]})]})]})}),e.jsx(h,{children:e.jsxs(g,{className:"p-6",children:[e.jsx("div",{className:"flex items-center justify-between",children:e.jsxs("div",{className:"flex items-center",children:[e.jsx(W,{className:"h-4 w-4 text-orange-500"}),e.jsx("span",{className:"ml-2 text-sm font-medium",children:"Total Pendente"})]})}),e.jsxs("div",{className:"mt-2",children:[e.jsxs("div",{className:"text-2xl font-bold text-orange-600",children:["R$ ",t.total_pendente.toLocaleString("pt-BR",{minimumFractionDigits:2})]}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:[t.quantidade_pendente," comissões pendentes"]})]})]})}),e.jsx(h,{children:e.jsxs(g,{className:"p-6",children:[e.jsxs("div",{className:"flex items-center",children:[e.jsx(O,{className:"h-4 w-4 text-primary"}),e.jsx("span",{className:"ml-2 text-sm font-medium",children:"Total Geral"})]}),e.jsxs("div",{className:"mt-2",children:[e.jsxs("div",{className:"text-2xl font-bold text-primary",children:["R$ ",t.total_geral.toLocaleString("pt-BR",{minimumFractionDigits:2})]}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Todas as comissões"})]})]})}),e.jsx(h,{children:e.jsxs(g,{className:"p-6",children:[e.jsxs("div",{className:"flex items-center",children:[e.jsx(J,{className:"h-4 w-4 text-purple-500"}),e.jsx("span",{className:"ml-2 text-sm font-medium",children:"% Médio"})]}),e.jsxs("div",{className:"mt-2",children:[e.jsxs("div",{className:"text-2xl font-bold text-purple-600",children:[b,"%"]}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Média ponderada"})]})]})})]}),e.jsxs(h,{children:[e.jsx(q,{children:e.jsxs(G,{className:"flex items-center gap-2",children:[e.jsx(V,{className:"w-5 h-5"}),"Comissões Detalhadas"]})}),e.jsx(g,{children:p?e.jsx("div",{className:"space-y-3",children:[1,2,3].map(s=>e.jsx(C,{className:"h-32 w-full"},s))}):n.length===0?e.jsx("p",{className:"text-center text-muted-foreground py-8",children:"Nenhuma comissão encontrada no período selecionado"}):e.jsx(Q,{data:n,columns:x,mobileCardRender:w})})]})]})})}export{we as default};
