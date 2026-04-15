import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Search, Send, Download } from 'lucide-react';

interface Material {
  id: number;
  categoria: string;
  nome: string;
  codigo: string;
}

const MATERIAIS: Material[] = [
  { id: 1, categoria: 'Indumentária e EPIs', nome: 'Óculos de proteção', codigo: '18616' },
  { id: 2, categoria: 'Indumentária e EPIs', nome: 'Pacote Gorro descartável (c/100)', codigo: '11258' },
  { id: 3, categoria: 'Indumentária e EPIs', nome: 'Máscara descartável (c/50)', codigo: '18618' },
  { id: 4, categoria: 'Indumentária e EPIs', nome: 'Luva de Procedimento P (c/100)', codigo: '18614' },
  { id: 5, categoria: 'Indumentária e EPIs', nome: 'Luva de Procedimento M (c/100)', codigo: '18613' },
  { id: 6, categoria: 'Indumentária e EPIs', nome: 'Luva de Procedimento G (c/100)', codigo: '18612' },
  { id: 7, categoria: 'Prótese 1 - Moldagem', nome: 'Godiva em barra', codigo: '1098' },
  { id: 8, categoria: 'Prótese 1 - Moldagem', nome: 'Moldeira de estoque superior', codigo: '18631' },
  { id: 9, categoria: 'Prótese 1 - Moldagem', nome: 'Moldeira de estoque inferior', codigo: '18632' },
  { id: 10, categoria: 'Prótese 1 - Moldagem', nome: 'Alginato tipo 1 500g (para moldagem anatômica)', codigo: '18654' },
  { id: 11, categoria: 'Prótese 1 - Moldagem', nome: 'Pasta zinco enólica (para moldagem funcional)', codigo: '18655' },
  { id: 12, categoria: 'Prótese 1 - Moldagem', nome: 'Godiva em pasta', codigo: '18656' },
  { id: 13, categoria: 'Prótese 1 - Instrumentais', nome: 'Espátula para alginato 24cm (para manipular alginato)', codigo: '18657' },
  { id: 14, categoria: 'Prótese 1 - Instrumentais', nome: 'Graal de borracha grande (para manipular alginato)', codigo: '18658' },
  { id: 15, categoria: 'Prótese 1 - Instrumentais', nome: 'Espátula 36 (para escultura em cera)', codigo: '18659' },
  { id: 16, categoria: 'Prótese 1 - Instrumentais', nome: 'Espátula 31 (para escultura em cera)', codigo: '18660' },
  { id: 17, categoria: 'Prótese 1 - Instrumentais', nome: 'Espátula 7 (para escultura em cera)', codigo: '18661' },
  { id: 18, categoria: 'Prótese 1 - Instrumentais', nome: 'Espátula Lecron (para escultura em cera)', codigo: '18662' },
  { id: 19, categoria: 'Prótese 1 - Instrumentais', nome: 'PKT (para escultura em cera)', codigo: '18663' },
  { id: 20, categoria: 'Prótese 1 - Instrumentais', nome: 'Hollemback (para escultura em cera)', codigo: '18664' },
  { id: 21, categoria: 'Prótese 1 - Instrumentais', nome: 'Placa de vidro grossa 15x10cm (para espatular cera)', codigo: '18665' },
  { id: 22, categoria: 'Prótese 1 - Instrumentais', nome: 'Boca completa dentes artificiais (4 placas) Biotone 33º modelo 3D posteriores 30M', codigo: 'xxxxxx' },
  { id: 23, categoria: 'Prótese 1 - Instrumentais', nome: 'Lâmina de bisturi nº 15 (pacote com 100 unidades)', codigo: '18666' },
  { id: 24, categoria: 'Prótese 1 - Instrumentais', nome: 'Cabo de bisturi nº 3 (para cortar cera)', codigo: '18667' },
  { id: 25, categoria: 'Prótese 1 - Materiais de Consumo', nome: 'Resina acrílica autopolimerizável pó (JET) (para confecção de base de prova)', codigo: '18668' },
  { id: 26, categoria: 'Prótese 1 - Materiais de Consumo', nome: 'Resina acrílica autopolimerizável líquido (JET) (para confecção de base de prova)', codigo: '18669' },
  { id: 27, categoria: 'Prótese 1 - Materiais de Consumo', nome: 'Cera 7 lâminas (para confecção de plano de orientação e placa base)', codigo: '18670' },
  { id: 28, categoria: 'Prótese 1 - Materiais de Consumo', nome: 'Gesso pedra tipo III 5kg (para modelos de estudo)', codigo: '18671' },
  { id: 29, categoria: 'Prótese 1 - Materiais de Consumo', nome: 'Gesso especial tipo IV 1kg (para modelos de trabalho)', codigo: '18672' },
  { id: 30, categoria: 'Prótese 1 - Materiais de Consumo', nome: 'Isolante para resina acrílica (Cel Lac) (para isolamento do modelo)', codigo: '18673' },
  { id: 31, categoria: 'Prótese 1 - Materiais de Consumo', nome: 'Vaselina sólida (para isolamento do modelo)', codigo: '18674' },
  { id: 32, categoria: 'Prótese 1 - Materiais de Consumo', nome: 'Pedra pomes (para polimento)', codigo: '18675' },
  { id: 33, categoria: 'Endodontia 1 - Instrumentais', nome: 'Régua endodôntica metálica (para medição de instrumentos)', codigo: '18676' },
  { id: 34, categoria: 'Endodontia 1 - Instrumentais', nome: 'Espelho bucal plano nº 5 (para exame clínico)', codigo: '18677' },
  { id: 35, categoria: 'Endodontia 1 - Instrumentais', nome: 'Explorador nº 5 (para exame clínico)', codigo: '18678' },
  { id: 36, categoria: 'Endodontia 1 - Instrumentais', nome: 'Pinça clínica (para exame clínico)', codigo: '18679' },
  { id: 37, categoria: 'Endodontia 1 - Instrumentais', nome: 'Placa de vidro grossa (para espatulação)', codigo: '18680' },
  { id: 38, categoria: 'Endodontia 1 - Instrumentais', nome: 'Espátula nº 24 (para manipulação de materiais)', codigo: '18681' },
  { id: 39, categoria: 'Endodontia 1 - Instrumentais', nome: 'Espátula nº 1 (para inserção de materiais)', codigo: '18682' },
  { id: 40, categoria: 'Endodontia 1 - Instrumentais', nome: 'Seringa Carpule (para anestesia)', codigo: '18683' },
  { id: 41, categoria: 'Endodontia 1 - Instrumentais', nome: 'Pinça porta grampo Palmer (para isolamento absoluto)', codigo: '18684' },
  { id: 42, categoria: 'Endodontia 1 - Instrumentais', nome: 'Arco de Young (para isolamento absoluto)', codigo: '18685' },
  { id: 43, categoria: 'Endodontia 1 - Instrumentais', nome: 'Perfurador de lençol de borracha Ainsworth (para isolamento absoluto)', codigo: '18686' },
  { id: 44, categoria: 'Endodontia 1 - Instrumentais', nome: 'Condensador de Paiva nº 1 (para condensação de guta-percha)', codigo: '18687' },
  { id: 45, categoria: 'Endodontia 1 - Instrumentais', nome: 'Condensador de Paiva nº 2 (para condensação de guta-percha)', codigo: '18688' },
  { id: 46, categoria: 'Endodontia 1 - Instrumentais', nome: 'Espaçador digital tipo A (para condensação lateral)', codigo: '18689' },
  { id: 47, categoria: 'Endodontia 1 - Instrumentais', nome: 'Espaçador digital tipo B (para condensação lateral)', codigo: '18690' },
  { id: 48, categoria: 'Endodontia 1 - Instrumentais', nome: 'Espaçador digital tipo C (para condensação lateral)', codigo: '18691' },
  { id: 49, categoria: 'Endodontia 1 - Instrumentais', nome: 'Espaçador digital tipo D (para condensação lateral)', codigo: '18692' },
  { id: 50, categoria: 'Endodontia 1 - Instrumentais', nome: 'Lima endodôntica tipo K 21mm 1ª série (nº 15 ao 40)', codigo: '18693' },
  { id: 51, categoria: 'Endodontia 1 - Instrumentais', nome: 'Lima endodôntica tipo K 25mm 1ª série (nº 15 ao 40)', codigo: '18694' },
  { id: 52, categoria: 'Endodontia 1 - Instrumentais', nome: 'Lima tipo Hedströen 21mm (nº 15, 20, 25, 30, 35, 40)', codigo: '18695' },
  { id: 53, categoria: 'Endodontia 1 - Instrumentais', nome: 'Lima tipo Hedströen 25mm (nº 15, 20, 25, 30, 35, 40)', codigo: '18696' },
  { id: 54, categoria: 'Endodontia 1 - Materiais de Consumo', nome: 'Guta-percha principal (cone principal) sortidas', codigo: '18697' },
  { id: 55, categoria: 'Endodontia 1 - Materiais de Consumo', nome: 'Guta-percha acessória (cone acessório)', codigo: '18698' },
  { id: 56, categoria: 'Endodontia 1 - Materiais de Consumo', nome: 'Cimento endodôntico Sealer 26', codigo: '18699' },
  { id: 57, categoria: 'Endodontia 1 - Materiais de Consumo', nome: 'Hipoclorito de sódio 1% (para irrigação)', codigo: '18700' },
  { id: 58, categoria: 'Endodontia 1 - Materiais de Consumo', nome: 'EDTA (para irrigação)', codigo: '18701' },
  { id: 59, categoria: 'Endodontia 1 - Materiais de Consumo', nome: 'Soro fisiológico (para irrigação)', codigo: '18702' },
  { id: 60, categoria: 'Endodontia 1 - Materiais de Consumo', nome: 'Lençol de borracha (para isolamento absoluto)', codigo: '18703' },
  { id: 61, categoria: 'Endodontia 1 - Materiais de Consumo', nome: 'Grampos para isolamento absoluto (diversos números)', codigo: '18704' },
  { id: 62, categoria: 'Endodontia 1 - Materiais de Consumo', nome: 'Anestésico tópico (para anestesia)', codigo: '18705' },
  { id: 63, categoria: 'Endodontia 1 - Materiais de Consumo', nome: 'Tubete de anestésico (para anestesia)', codigo: '18706' },
  { id: 64, categoria: 'Endodontia 1 - Materiais de Consumo', nome: 'Agulha descartável curta (para anestesia)', codigo: '18707' },
  { id: 65, categoria: 'Endodontia 1 - Materiais de Consumo', nome: 'Algodão (para isolamento relativo)', codigo: '18708' },
  { id: 66, categoria: 'Endodontia 1 - Materiais de Consumo', nome: 'Gaze (para isolamento relativo)', codigo: '18709' },
  { id: 67, categoria: 'Endodontia 1 - Materiais de Consumo', nome: 'Papel absorvente endodôntico (para secagem de canais)', codigo: '18710' },
  { id: 68, categoria: 'Periodontia - Habilidades 3', nome: 'Cureta de Gracey 5-6 (para raspagem)', codigo: '18711' },
  { id: 69, categoria: 'Periodontia - Habilidades 3', nome: 'Cureta de Gracey 7-8 (para raspagem)', codigo: '18712' },
  { id: 70, categoria: 'Periodontia - Habilidades 3', nome: 'Cureta de Gracey 11-12 (para raspagem)', codigo: '18713' },
  { id: 71, categoria: 'Periodontia - Habilidades 3', nome: 'Cureta de Gracey 13-14 (para raspagem)', codigo: '18714' },
  { id: 72, categoria: 'Periodontia - Habilidades 3', nome: 'Pedra de afiar Arkansas (para afiação)', codigo: '18715' },
  { id: 73, categoria: 'Periodontia - Habilidades 3', nome: 'Óleo mineral (para afiação)', codigo: '18716' },
  { id: 74, categoria: 'Periodontia - Habilidades 3', nome: 'Sonda periodontal milimetrada (para sondagem)', codigo: '18717' },
  { id: 75, categoria: 'Periodontia - Habilidades 3', nome: 'Manequim odontológico com dentes (para prática)', codigo: '18718' },
  { id: 76, categoria: 'Cirurgia Odontológica', nome: 'Fórceps nº 1 (para extração)', codigo: '18719' },
  { id: 77, categoria: 'Cirurgia Odontológica', nome: 'Fórceps nº 150 (para extração)', codigo: '18720' },
  { id: 78, categoria: 'Cirurgia Odontológica', nome: 'Fórceps nº 16 (para extração)', codigo: '18721' },
  { id: 79, categoria: 'Cirurgia Odontológica', nome: 'Fórceps nº 17 (para extração)', codigo: '18722' },
  { id: 80, categoria: 'Cirurgia Odontológica', nome: 'Fórceps nº 18L (para extração)', codigo: '18723' },
  { id: 81, categoria: 'Cirurgia Odontológica', nome: 'Fórceps nº 18R (para extração)', codigo: '18724' },
  { id: 82, categoria: 'Cirurgia Odontológica', nome: 'Alavanca reta (para extração)', codigo: '18725' },
  { id: 83, categoria: 'Cirurgia Odontológica', nome: 'Cabo de bisturi nº 3 (para incisão)', codigo: '18726' },
  { id: 84, categoria: 'Cirurgia Odontológica', nome: 'Lâmina de bisturi nº 15 (para incisão)', codigo: '18727' },
  { id: 85, categoria: 'Cirurgia Odontológica', nome: 'Afastador de Minnesota (para afastamento)', codigo: '18728' },
  { id: 86, categoria: 'Cirurgia Odontológica', nome: 'Porta agulha Mayo-Hegar (para sutura)', codigo: '18729' },
  { id: 87, categoria: 'Cirurgia Odontológica', nome: 'Pinça de Adson (para sutura)', codigo: '18730' },
  { id: 88, categoria: 'Cirurgia Odontológica', nome: 'Tesoura reta (para sutura)', codigo: '18731' },
  { id: 89, categoria: 'Cirurgia Odontológica', nome: 'Fio de sutura 3-0 seda (para sutura)', codigo: '18732' },
  { id: 90, categoria: 'Cirurgia Odontológica', nome: 'Cureta de Lucas (para curetagem)', codigo: '18733' },
  { id: 91, categoria: 'Dentística 2 - Preparo Cavitário', nome: 'Broca carbide 1/4 (para preparo cavitário)', codigo: '18734' },
  { id: 92, categoria: 'Dentística 2 - Preparo Cavitário', nome: 'Broca carbide 1/2 (para preparo cavitário)', codigo: '18735' },
  { id: 93, categoria: 'Dentística 2 - Preparo Cavitário', nome: 'Broca carbide 2 (para preparo cavitário)', codigo: '18736' },
  { id: 94, categoria: 'Dentística 2 - Preparo Cavitário', nome: 'Broca carbide 4 (para preparo cavitário)', codigo: '18737' },
  { id: 95, categoria: 'Dentística 2 - Preparo Cavitário', nome: 'Broca carbide 6 (para preparo cavitário)', codigo: '18738' },
  { id: 96, categoria: 'Dentística 2 - Preparo Cavitário', nome: 'Broca carbide 245 (para preparo cavitário)', codigo: '18739' },
  { id: 97, categoria: 'Dentística 2 - Preparo Cavitário', nome: 'Broca carbide 330 (para preparo cavitário)', codigo: '18740' },
  { id: 98, categoria: 'Dentística 2 - Preparo Cavitário', nome: 'Broca diamantada 1014 (para preparo cavitário)', codigo: '18741' },
  { id: 99, categoria: 'Dentística 2 - Preparo Cavitário', nome: 'Broca diamantada 3082 (para preparo cavitário)', codigo: '18742' },
  { id: 100, categoria: 'Dentística 2 - Preparo Cavitário', nome: 'Broca diamantada esférica (para remoção de cárie)', codigo: '18743' },
  { id: 101, categoria: 'Dentística 2 - Preparo Cavitário', nome: 'Contra-ângulo (para uso com brocas)', codigo: '18744' },
  { id: 102, categoria: 'Dentística 2 - Materiais Restauradores', nome: 'Resina composta cor A2 (para restaurações)', codigo: '18745' },
  { id: 103, categoria: 'Dentística 2 - Materiais Restauradores', nome: 'Resina composta cor A3 (para restaurações)', codigo: '18746' },
  { id: 104, categoria: 'Dentística 2 - Materiais Restauradores', nome: 'Resina composta cor A3.5 (para restaurações)', codigo: '18747' },
  { id: 105, categoria: 'Dentística 2 - Materiais Restauradores', nome: 'Adesivo dentinário (para adesão)', codigo: '18748' },
  { id: 106, categoria: 'Dentística 2 - Materiais Restauradores', nome: 'Ácido fosfórico 37% (para condicionamento ácido)', codigo: '18749' },
  { id: 107, categoria: 'Dentística 2 - Materiais Restauradores', nome: 'Ionômero de vidro (para base/forramento)', codigo: '18750' },
  { id: 108, categoria: 'Dentística 2 - Materiais Restauradores', nome: 'Hidróxido de cálcio (para proteção pulpar)', codigo: '18751' },
  { id: 109, categoria: 'Dentística 2 - Instrumentais Restauradores', nome: 'Espátula para resina nº 1 (para inserção de resina)', codigo: '18752' },
  { id: 110, categoria: 'Dentística 2 - Instrumentais Restauradores', nome: 'Espátula para resina nº 2 (para inserção de resina)', codigo: '18753' },
  { id: 111, categoria: 'Dentística 2 - Instrumentais Restauradores', nome: 'Brunidor nº 28 (para brunidura)', codigo: '18754' },
  { id: 112, categoria: 'Dentística 2 - Instrumentais Restauradores', nome: 'Hollenback 3S (para escultura)', codigo: '18755' },
  { id: 113, categoria: 'Dentística 2 - Instrumentais Restauradores', nome: 'Escavador de dentina nº 5 (para remoção de cárie)', codigo: '18756' },
  { id: 114, categoria: 'Dentística 2 - Instrumentais Restauradores', nome: 'Placa de vidro (para espatulação)', codigo: '18757' },
  { id: 115, categoria: 'Dentística 2 - Instrumentais Restauradores', nome: 'Espátula nº 24 (para manipulação)', codigo: '18758' },
  { id: 116, categoria: 'Dentística 2 - Instrumentais Restauradores', nome: 'Pincel aplicador (para aplicação de adesivo)', codigo: '18759' },
  { id: 117, categoria: 'Dentística 2 - Instrumentais Restauradores', nome: 'Microbrush (para aplicação de adesivo)', codigo: '18760' },
  { id: 118, categoria: 'Dentística 2 - Instrumentais Restauradores', nome: 'Fotopolimerizador LED (para polimerização)', codigo: '18761' },
  { id: 119, categoria: 'Dentística 2 - Acabamento', nome: 'Disco de lixa Sof-Lex Pop-On (para acabamento)', codigo: '18762' },
  { id: 120, categoria: 'Dentística 2 - Acabamento', nome: 'Ponta diamantada para acabamento 2135F (para acabamento)', codigo: '18763' },
  { id: 121, categoria: 'Dentística 2 - Acabamento', nome: 'Ponta diamantada para acabamento 2135FF (para acabamento)', codigo: '18764' },
  { id: 122, categoria: 'Dentística 2 - Acabamento', nome: 'Broca multilaminada para acabamento (para acabamento)', codigo: '18765' },
  { id: 123, categoria: 'Dentística 2 - Acabamento', nome: 'Taça de borracha (para polimento)', codigo: '18766' },
  { id: 124, categoria: 'Dentística 2 - Acabamento', nome: 'Escova de Robinson (para polimento)', codigo: '18767' },
  { id: 125, categoria: 'Dentística 2 - Acabamento', nome: 'Pasta para polimento Diamond Excel (para polimento)', codigo: '18768' },
  { id: 126, categoria: 'Dentística 2 - Acabamento', nome: 'Disco de feltro (para polimento)', codigo: '18769' },
  { id: 127, categoria: 'Dentística 2 - Acabamento', nome: 'Tira de lixa metálica (para acabamento interproximal)', codigo: '18770' },
  { id: 128, categoria: 'Dentística 2 - Acabamento', nome: 'Mandril sistema POP ON', codigo: 'xxxxxx' },
  { id: 129, categoria: 'Dentística 2 - Isolamento', nome: 'Lençol de borracha (para isolamento absoluto)', codigo: '18771' },
  { id: 130, categoria: 'Dentística 2 - Isolamento', nome: 'Grampos diversos (para isolamento absoluto)', codigo: '18772' },
  { id: 131, categoria: 'Dentística 2 - Isolamento', nome: 'Arco de Young (para isolamento absoluto)', codigo: '18773' },
  { id: 132, categoria: 'Dentística 2 - Isolamento', nome: 'Pinça porta grampo (para isolamento absoluto)', codigo: '18774' },
  { id: 133, categoria: 'Dentística 2 - Isolamento', nome: 'Perfurador de lençol (para isolamento absoluto)', codigo: '18775' },
  { id: 134, categoria: 'Dentística 2 - Isolamento', nome: 'Fio dental (para afastamento)', codigo: '18776' },
  { id: 135, categoria: 'Dentística 2 - Isolamento', nome: 'Cunha de madeira (para afastamento)', codigo: '18777' },
  { id: 136, categoria: 'Dentística 2 - Matriz', nome: 'Matriz de aço (para restaurações)', codigo: '18778' },
  { id: 137, categoria: 'Dentística 2 - Matriz', nome: 'Porta matriz de Tofflemire (para restaurações)', codigo: '18779' },
  { id: 138, categoria: 'Dentística 2 - Matriz', nome: 'Porta matriz Automatrix (para restaurações)', codigo: '18780' },
  { id: 139, categoria: 'Materiais Gerais - Todos os Semestres', nome: 'Sugador descartável (para aspiração)', codigo: '18781' },
  { id: 140, categoria: 'Materiais Gerais - Todos os Semestres', nome: 'Campo descartável (para proteção)', codigo: '18782' },
  { id: 141, categoria: 'Materiais Gerais - Todos os Semestres', nome: 'Papel grau cirúrgico (para esterilização)', codigo: '18783' },
  { id: 142, categoria: 'Materiais Gerais - Todos os Semestres', nome: 'Álcool 70% (para desinfecção)', codigo: '18784' },
  { id: 143, categoria: 'Materiais Gerais - Todos os Semestres', nome: 'Detergente enzimático (para limpeza)', codigo: '18785' },
  { id: 144, categoria: 'Materiais Adicionais', nome: 'Espátula de inserção', codigo: '18786' },
  { id: 145, categoria: 'Materiais Adicionais', nome: 'Espelho bucal', codigo: '18787' },
  { id: 146, categoria: 'Materiais Adicionais', nome: 'Pinça clínica', codigo: '18788' },
  { id: 147, categoria: 'Materiais Adicionais', nome: 'Sonda exploradora', codigo: '18789' },
  { id: 148, categoria: 'Materiais Adicionais', nome: 'Bandeja clínica', codigo: '18790' },
  { id: 149, categoria: 'Materiais Adicionais', nome: 'Copo dappen', codigo: '18791' },
  { id: 150, categoria: 'Prótese 1 - Novos Itens Identificados', nome: 'Modelo anatômico superior e inferior', codigo: 'xxxxxx' },
  { id: 151, categoria: 'Prótese 1 - Novos Itens Identificados', nome: 'Papel carbono para articulação', codigo: 'xxxxxx' },
  { id: 152, categoria: 'Prótese 1 - Novos Itens Identificados', nome: 'Cera utilidade', codigo: 'xxxxxx' },
  { id: 153, categoria: 'Prótese 1 - Novos Itens Identificados', nome: 'Articulador semi-ajustável', codigo: 'xxxxxx' },
  { id: 154, categoria: 'Prótese 1 - Novos Itens Identificados', nome: 'Arco facial', codigo: 'xxxxxx' },
  { id: 155, categoria: 'Prótese 1 - Novos Itens Identificados', nome: 'Silicone de condensação pesado', codigo: 'xxxxxx' },
  { id: 156, categoria: 'Prótese 1 - Novos Itens Identificados', nome: 'Silicone de condensação leve', codigo: 'xxxxxx' },
  { id: 157, categoria: 'Prótese 1 - Novos Itens Identificados', nome: 'Resina acrílica termopolimerizável', codigo: 'xxxxxx' },
  { id: 158, categoria: 'Prótese 1 - Novos Itens Identificados', nome: 'Mufla', codigo: 'xxxxxx' },
  { id: 159, categoria: 'Prótese 1 - Novos Itens Identificados', nome: 'Prensa de bancada', codigo: 'xxxxxx' },
  { id: 160, categoria: 'Prótese 1 - Novos Itens Identificados', nome: 'Recortador de gesso', codigo: 'xxxxxx' },
  { id: 161, categoria: 'Prótese 1 - Novos Itens Identificados', nome: 'Motor de polimento (politriz)', codigo: 'xxxxxx' },
  { id: 162, categoria: 'Endodontia 1 - Novos Itens Identificados', nome: 'Localizador apical', codigo: 'xxxxxx' },
  { id: 163, categoria: 'Endodontia 1 - Novos Itens Identificados', nome: 'Motor endodôntico', codigo: 'xxxxxx' },
  { id: 164, categoria: 'Endodontia 1 - Novos Itens Identificados', nome: 'Limas rotatórias ProTaper', codigo: 'xxxxxx' },
  { id: 165, categoria: 'Endodontia 1 - Novos Itens Identificados', nome: 'Limas manuais NiTi', codigo: 'xxxxxx' },
  { id: 166, categoria: 'Endodontia 1 - Novos Itens Identificados', nome: 'Seringa para irrigação', codigo: 'xxxxxx' },
  { id: 167, categoria: 'Endodontia 1 - Novos Itens Identificados', nome: 'Agulha NaviTip para irrigação', codigo: 'xxxxxx' },
  { id: 168, categoria: 'Endodontia 1 - Novos Itens Identificados', nome: 'Clorexidina gel 2%', codigo: 'xxxxxx' },
  { id: 169, categoria: 'Endodontia 1 - Novos Itens Identificados', nome: 'Formocresol', codigo: 'xxxxxx' },
  { id: 170, categoria: 'Endodontia 1 - Novos Itens Identificados', nome: 'Hidróxido de cálcio PA', codigo: 'xxxxxx' },
  { id: 171, categoria: 'Endodontia 1 - Novos Itens Identificados', nome: 'Pasta Calen', codigo: 'xxxxxx' },
  { id: 172, categoria: 'Endodontia 1 - Novos Itens Identificados', nome: 'MTA (agregado de trióxido mineral)', codigo: 'xxxxxx' },
  { id: 173, categoria: 'Endodontia 1 - Novos Itens Identificados', nome: 'Cimento obturador AH Plus', codigo: 'xxxxxx' },
  { id: 174, categoria: 'Endodontia 1 - Novos Itens Identificados', nome: 'Cimento obturador Endofill', codigo: 'xxxxxx' },
  { id: 175, categoria: 'Endodontia 1 - Novos Itens Identificados', nome: 'Broca Gates-Glidden', codigo: 'xxxxxx' },
  { id: 176, categoria: 'Periodontia - Novos Itens Identificados', nome: 'Sonda periodontal Carolina do Norte', codigo: 'xxxxxx' },
  { id: 177, categoria: 'Periodontia - Novos Itens Identificados', nome: 'Cureta Universal (McCall 13-14)', codigo: 'xxxxxx' },
  { id: 178, categoria: 'Periodontia - Novos Itens Identificados', nome: 'Curetas de Gracey específicas completas', codigo: 'xxxxxx' },
  { id: 179, categoria: 'Periodontia - Novos Itens Identificados', nome: 'Foice periodontal', codigo: 'xxxxxx' },
  { id: 180, categoria: 'Periodontia - Novos Itens Identificados', nome: 'Enxada periodontal', codigo: 'xxxxxx' },
  { id: 181, categoria: 'Periodontia - Novos Itens Identificados', nome: 'Lima periodontal', codigo: 'xxxxxx' },
  { id: 182, categoria: 'Periodontia - Novos Itens Identificados', nome: 'Gengivótomo', codigo: 'xxxxxx' },
  { id: 183, categoria: 'Cirurgia - Novos Itens Identificados', nome: 'Sindesmótomo', codigo: 'xxxxxx' },
  { id: 184, categoria: 'Cirurgia - Novos Itens Identificados', nome: 'Descolador de Molt', codigo: 'xxxxxx' },
  { id: 185, categoria: 'Cirurgia - Novos Itens Identificados', nome: 'Lima para osso', codigo: 'xxxxxx' },
  { id: 186, categoria: 'Cirurgia - Novos Itens Identificados', nome: 'Broca cirúrgica trefina', codigo: 'xxxxxx' },
  { id: 187, categoria: 'Cirurgia - Novos Itens Identificados', nome: 'Cinzel reto', codigo: 'xxxxxx' },
  { id: 188, categoria: 'Cirurgia - Novos Itens Identificados', nome: 'Martelo cirúrgico', codigo: 'xxxxxx' },
  { id: 189, categoria: 'Dentística 2 - Novos Itens Identificados', nome: 'Kit de brocas diamantadas para acabamento', codigo: 'xxxxxx' },
  { id: 190, categoria: 'Dentística 2 - Novos Itens Identificados', nome: 'Pontas de silicone para polimento', codigo: 'xxxxxx' },
  { id: 191, categoria: 'Dentística 2 - Novos Itens Identificados', nome: 'Disco de óxido de alumínio', codigo: 'xxxxxx' },
  { id: 192, categoria: 'Dentística 2 - Novos Itens Identificados', nome: 'Sistema de matriz seccional', codigo: 'xxxxxx' },
  { id: 193, categoria: 'Dentística 2 - Novos Itens Identificados', nome: 'Anel de Palodent', codigo: 'xxxxxx' },
  { id: 194, categoria: 'Dentística 2 - Novos Itens Identificados', nome: 'Tiras de poliéster', codigo: 'xxxxxx' },
  { id: 195, categoria: 'Dentística 2 - Novos Itens Identificados', nome: 'Esmalte fotopolimerizável', codigo: 'xxxxxx' },
  { id: 196, categoria: 'Dentística 2 - Novos Itens Identificados', nome: 'Resina bulk fill', codigo: 'xxxxxx' },
  { id: 197, categoria: 'Dentística 2 - Novos Itens Identificados', nome: 'Resina flow', codigo: 'xxxxxx' },
  { id: 198, categoria: 'Dentística 2 - Novos Itens Identificados', nome: 'Top coat para resina', codigo: 'xxxxxx' },
  { id: 199, categoria: 'Dentística 2 - Novos Itens Identificados', nome: 'Bloqueador de oxigênio', codigo: 'xxxxxx' },
  { id: 221, categoria: 'Dentística 2 - Novos Itens Identificados', nome: 'Kit de pigmentos para caracterização', codigo: 'xxxxxx' },
  { id: 222, categoria: 'Dentística 2 - Novos Itens Identificados', nome: 'Escala de cores Vita', codigo: 'xxxxxx' },
  { id: 223, categoria: 'Dentística 2 - Novos Itens Identificados', nome: 'Tiras de lixa de aço', codigo: 'xxxxxx' },
  { id: 224, categoria: 'Dentística 2 - Novos Itens Identificados', nome: 'Tiras de lixa de poliéster', codigo: 'xxxxxx' },
  { id: 225, categoria: 'Dentística 2 - Novos Itens Identificados', nome: 'Espátula de titânio para resina', codigo: 'xxxxxx' },
  { id: 226, categoria: 'Outros Materiais Essenciais', nome: 'Kit de diagnóstico (espelho, pinça, sonda)', codigo: 'xxxxxx' },
  { id: 227, categoria: 'Outros Materiais Essenciais', nome: 'Radiografias periapicais', codigo: 'xxxxxx' },
  { id: 228, categoria: 'Outros Materiais Essenciais', nome: 'Posicionadores radiográficos', codigo: 'xxxxxx' },
  { id: 229, categoria: 'Outros Materiais Essenciais', nome: 'Revelador e fixador radiográfico', codigo: 'xxxxxx' },
  { id: 230, categoria: 'Outros Materiais Essenciais', nome: 'Negatoscópio', codigo: 'xxxxxx' },
  { id: 231, categoria: 'Outros Materiais Essenciais', nome: 'Jaleco branco manga longa', codigo: 'xxxxxx' },
  { id: 232, categoria: 'Outros Materiais Essenciais', nome: 'Sapato fechado branco', codigo: 'xxxxxx' },
  { id: 233, categoria: 'Outros Materiais Essenciais', nome: 'Caixa organizadora de instrumentais', codigo: 'xxxxxx' },
  { id: 234, categoria: 'Outros Materiais Essenciais', nome: 'Avental plumbífero (proteção radiológica)', codigo: 'xxxxxx' },
  { id: 235, categoria: 'Outros Materiais Essenciais', nome: 'Protetor de tireoide (proteção radiológica)', codigo: 'xxxxxx' },
  { id: 236, categoria: 'Materiais Extras Sugeridos', nome: 'Atlas de anatomia dental', codigo: 'xxxxxx' },
  { id: 237, categoria: 'Materiais Extras Sugeridos', nome: 'Caderno de anotações clínicas', codigo: 'xxxxxx' },
  { id: 238, categoria: 'Materiais Extras Sugeridos', nome: 'Caneta marca texto (cores variadas)', codigo: 'xxxxxx' },
  { id: 239, categoria: 'Materiais Extras Sugeridos', nome: 'Pasta organizadora de documentos', codigo: 'xxxxxx' },
  { id: 240, categoria: 'Materiais Extras Sugeridos', nome: 'Pen drive (backup de trabalhos)', codigo: 'xxxxxx' },
  { id: 241, categoria: 'Materiais Complementares - Prótese', nome: 'Silicone de adição (moldagem)', codigo: 'xxxxxx' },
  { id: 242, categoria: 'Materiais Complementares - Prótese', nome: 'Moldeira individual (confecção)', codigo: 'xxxxxx' },
  { id: 243, categoria: 'Materiais Complementares - Prótese', nome: 'Gesso especial tipo V', codigo: 'xxxxxx' },
  { id: 244, categoria: 'Materiais Complementares - Prótese', nome: 'Cera rosa nº 9', codigo: 'xxxxxx' },
  { id: 245, categoria: 'Materiais Complementares - Prótese', nome: 'Lamparina a álcool', codigo: 'xxxxxx' },
  { id: 246, categoria: 'Materiais Complementares - Prótese', nome: 'Espátula de cera Le Cron grande', codigo: 'xxxxxx' },
  { id: 247, categoria: 'Materiais Complementares - Endodontia', nome: 'Régua endodôntica milimetrada', codigo: 'xxxxxx' },
  { id: 248, categoria: 'Materiais Complementares - Endodontia', nome: 'Esponja hemostática', codigo: 'xxxxxx' },
  { id: 249, categoria: 'Materiais Complementares - Endodontia', nome: 'Turbina de alta rotação', codigo: 'xxxxxx' },
  { id: 250, categoria: 'Materiais Complementares - Endodontia', nome: 'Micromotor', codigo: 'xxxxxx' },
  { id: 251, categoria: 'Materiais Complementares - Periodontia', nome: 'Sonda exploradora nº 5', codigo: 'xxxxxx' },
  { id: 252, categoria: 'Materiais Complementares - Periodontia', nome: 'Ultrassom odontológico', codigo: 'xxxxxx' },
  { id: 253, categoria: 'Materiais Complementares - Periodontia', nome: 'Jato de bicarbonato', codigo: 'xxxxxx' },
  { id: 254, categoria: 'Materiais Complementares - Cirurgia', nome: 'Soro fisiológico estéril', codigo: 'xxxxxx' },
  { id: 255, categoria: 'Materiais Complementares - Cirurgia', nome: 'Gaze estéril (pacotes)', codigo: 'xxxxxx' },
  { id: 256, categoria: 'Materiais Complementares - Cirurgia', nome: 'Compressa estéril', codigo: 'xxxxxx' },
  { id: 257, categoria: 'Materiais Complementares - Cirurgia', nome: 'Agulha para sutura (diversos calibres)', codigo: 'xxxxxx' },
  { id: 258, categoria: 'Materiais Complementares - Dentística', nome: 'Isolante Bond para resina', codigo: 'xxxxxx' },
  { id: 259, categoria: 'Materiais Complementares - Dentística', nome: 'Primer para dentina', codigo: 'xxxxxx' },
  { id: 260, categoria: 'Materiais Complementares - Dentística', nome: 'Sistema adesivo universal', codigo: 'xxxxxx' },
  { id: 261, categoria: 'Materiais Complementares - Dentística', nome: 'Cimento de ionômero resinoso', codigo: 'xxxxxx' },
  { id: 262, categoria: 'Equipamentos de Proteção Individual - Complementar', nome: 'Face shield (protetor facial)', codigo: 'xxxxxx' },
  { id: 263, categoria: 'Equipamentos de Proteção Individual - Complementar', nome: 'Luva estéril cirúrgica 7.0', codigo: 'xxxxxx' },
  { id: 264, categoria: 'Equipamentos de Proteção Individual - Complementar', nome: 'Luva estéril cirúrgica 7.5', codigo: 'xxxxxx' },
  { id: 265, categoria: 'Equipamentos de Proteção Individual - Complementar', nome: 'Luva estéril cirúrgica 8.0', codigo: 'xxxxxx' },
  { id: 266, categoria: 'Equipamentos de Proteção Individual - Complementar', nome: 'Avental descartável', codigo: 'xxxxxx' },
  { id: 267, categoria: 'Equipamentos de Proteção Individual - Complementar', nome: 'Propé descartável', codigo: 'xxxxxx' },
  { id: 268, categoria: 'Materiais de Biossegurança', nome: 'Desinfetante de superfície', codigo: 'xxxxxx' },
  { id: 269, categoria: 'Materiais de Biossegurança', nome: 'Coletor de perfurocortante 13L', codigo: 'xxxxxx' },
  { id: 270, categoria: 'Materiais de Biossegurança', nome: 'Saco de lixo branco hospitalar', codigo: 'xxxxxx' },
  { id: 271, categoria: 'Materiais de Biossegurança', nome: 'Álcool gel 70%', codigo: 'xxxxxx' },
  { id: 272, categoria: 'Materiais de Biossegurança', nome: 'Sabonete antisséptico', codigo: 'xxxxxx' },
  { id: 273, categoria: 'Materiais de Biossegurança', nome: 'Papel toalha', codigo: 'xxxxxx' },
  { id: 274, categoria: 'Materiais de Biossegurança', nome: 'Indicador biológico para autoclave', codigo: 'xxxxxx' },
  { id: 275, categoria: 'Materiais de Biossegurança', nome: 'Indicador químico para autoclave', codigo: 'xxxxxx' },
  { id: 276, categoria: 'Instrumentais Adicionais', nome: 'Afastador de língua', codigo: 'xxxxxx' },
  { id: 277, categoria: 'Instrumentais Adicionais', nome: 'Afastador labial', codigo: 'xxxxxx' },
  { id: 278, categoria: 'Instrumentais Adicionais', nome: 'Espátula nº 7', codigo: 'xxxxxx' },
  { id: 279, categoria: 'Instrumentais Adicionais', nome: 'Brunidor bola pequeno', codigo: 'xxxxxx' },
  { id: 280, categoria: 'Instrumentais Adicionais', nome: 'Brunidor bola grande', codigo: 'xxxxxx' },
  { id: 281, categoria: 'Instrumentais Adicionais', nome: 'Calcador de Paiva', codigo: 'xxxxxx' },
  { id: 282, categoria: 'Instrumentais Adicionais', nome: 'Espátula Hollemback 3S/3L', codigo: 'xxxxxx' },
  { id: 283, categoria: 'Materiais para Moldagem - Complementar', nome: 'Moldeira parcial metálica superior', codigo: 'xxxxxx' },
  { id: 284, categoria: 'Materiais para Moldagem - Complementar', nome: 'Moldeira parcial metálica inferior', codigo: 'xxxxxx' },
  { id: 285, categoria: 'Materiais para Moldagem - Complementar', nome: 'Silicone de condensação catalisador', codigo: 'xxxxxx' },
  { id: 286, categoria: 'Materiais para Moldagem - Complementar', nome: 'Espátula para silicone', codigo: 'xxxxxx' },
  { id: 287, categoria: 'Materiais para Moldagem - Complementar', nome: 'Placa de vidro para silicone', codigo: 'xxxxxx' },
  { id: 288, categoria: 'Materiais de Acabamento e Polimento', nome: 'Pasta diamantada', codigo: 'xxxxxx' },
  { id: 289, categoria: 'Materiais de Acabamento e Polimento', nome: 'Pedra pomes extra-fina', codigo: 'xxxxxx' },
  { id: 290, categoria: 'Materiais de Acabamento e Polimento', nome: 'Branco de espanha', codigo: 'xxxxxx' },
  { id: 291, categoria: 'Materiais de Acabamento e Polimento', nome: 'Disco de feltro com haste', codigo: 'xxxxxx' },
  { id: 292, categoria: 'Materiais de Acabamento e Polimento', nome: 'Roda de pano para polimento', codigo: 'xxxxxx' },
  { id: 293, categoria: 'Materiais de Acabamento e Polimento', nome: 'Lixa d\'água nº 400', codigo: 'xxxxxx' },
  { id: 294, categoria: 'Materiais de Acabamento e Polimento', nome: 'Lixa d\'água nº 600', codigo: 'xxxxxx' },
  { id: 295, categoria: 'Materiais de Acabamento e Polimento', nome: 'Cone de borracha abrasivo', codigo: 'xxxxxx' },
  { id: 296, categoria: 'Materiais para Oclusão', nome: 'Papel carbono para articulação (azul)', codigo: 'xxxxxx' },
  { id: 297, categoria: 'Materiais para Oclusão', nome: 'Papel carbono para articulação (vermelho)', codigo: 'xxxxxx' },
  { id: 298, categoria: 'Materiais para Oclusão', nome: 'Pinça porta carbono', codigo: 'xxxxxx' },
  { id: 299, categoria: 'Materiais para Oclusão', nome: 'Placa de mordida', codigo: 'xxxxxx' },
  { id: 300, categoria: 'Materiais Descartáveis Clínicos', nome: 'Babador descartável', codigo: 'xxxxxx' },
  { id: 301, categoria: 'Materiais Descartáveis Clínicos', nome: 'Copo descartável 50ml', codigo: 'xxxxxx' },
  { id: 302, categoria: 'Materiais Descartáveis Clínicos', nome: 'Filme PVC para proteção', codigo: 'xxxxxx' },
  { id: 303, categoria: 'Materiais Descartáveis Clínicos', nome: 'Seringa descartável 5ml', codigo: 'xxxxxx' },
  { id: 304, categoria: 'Materiais Descartáveis Clínicos', nome: 'Seringa descartável 10ml', codigo: 'xxxxxx' },
  { id: 305, categoria: 'Materiais Descartáveis Clínicos', nome: 'Agulha 40x12', codigo: 'xxxxxx' },
  { id: 306, categoria: 'Materiais de Laboratório', nome: 'Pote dappen de vidro', codigo: 'xxxxxx' },
  { id: 307, categoria: 'Materiais de Laboratório', nome: 'Proveta 100ml', codigo: 'xxxxxx' },
  { id: 308, categoria: 'Materiais de Laboratório', nome: 'Becker 250ml', codigo: 'xxxxxx' },
  { id: 309, categoria: 'Materiais de Laboratório', nome: 'Espátula de manipulação dupla', codigo: 'xxxxxx' },
  { id: 310, categoria: 'Materiais de Laboratório', nome: 'Balança de precisão digital', codigo: 'xxxxxx' },
  { id: 311, categoria: 'Materiais de Laboratório', nome: 'Vibrador de gesso', codigo: 'xxxxxx' },
  { id: 312, categoria: 'Materiais de Laboratório', nome: 'Pincéis para isolante nº 2, 4, 6', codigo: 'xxxxxx' },
  { id: 313, categoria: 'Ceras Odontológicas', nome: 'Cera para escultura', codigo: 'xxxxxx' },
  { id: 314, categoria: 'Ceras Odontológicas', nome: 'Cera pegajosa', codigo: 'xxxxxx' },
  { id: 315, categoria: 'Ceras Odontológicas', nome: 'Cera de mordida', codigo: 'xxxxxx' },
  { id: 316, categoria: 'Ceras Odontológicas', nome: 'Cera para casquete', codigo: 'xxxxxx' },
  { id: 317, categoria: 'Ceras Odontológicas', nome: 'Lâmina de cera Wilson', codigo: 'xxxxxx' },
  { id: 318, categoria: 'Materiais para Clareamento', nome: 'Peróxido de hidrogênio 35%', codigo: 'xxxxxx' },
  { id: 319, categoria: 'Materiais para Clareamento', nome: 'Peróxido de carbamida 16%', codigo: 'xxxxxx' },
  { id: 320, categoria: 'Materiais para Clareamento', nome: 'Moldeira para clareamento', codigo: 'xxxxxx' },
  { id: 321, categoria: 'Materiais para Clareamento', nome: 'Barreira gengival fotopolimerizável', codigo: 'xxxxxx' },
  { id: 322, categoria: 'Materiais para Clareamento', nome: 'Dessensibilizante', codigo: 'xxxxxx' },
  { id: 323, categoria: 'Brocas Cirúrgicas', nome: 'Broca cirúrgica esférica nº 6', codigo: 'xxxxxx' },
  { id: 324, categoria: 'Brocas Cirúrgicas', nome: 'Broca cirúrgica esférica nº 8', codigo: 'xxxxxx' },
  { id: 325, categoria: 'Brocas Cirúrgicas', nome: 'Broca Zekrya', codigo: 'xxxxxx' },
  { id: 326, categoria: 'Brocas Cirúrgicas', nome: 'Broca Lindemann', codigo: 'xxxxxx' },
  { id: 327, categoria: 'Brocas Cirúrgicas', nome: 'Broca cirúrgica 702', codigo: 'xxxxxx' },
  { id: 328, categoria: 'Materiais para Urgência', nome: 'Medicamento Otosporin', codigo: 'xxxxxx' },
  { id: 329, categoria: 'Materiais para Urgência', nome: 'Medicamento Alodont', codigo: 'xxxxxx' },
  { id: 330, categoria: 'Materiais para Urgência', nome: 'Eugenol', codigo: 'xxxxxx' },
  { id: 331, categoria: 'Materiais para Urgência', nome: 'Óxido de zinco', codigo: 'xxxxxx' },
  { id: 332, categoria: 'Materiais para Urgência', nome: 'Cimento provisório IRM', codigo: 'xxxxxx' },
  { id: 333, categoria: 'Materiais para Urgência', nome: 'Cimento provisório Cimpat', codigo: 'xxxxxx' },
  { id: 334, categoria: 'Fios de Sutura', nome: 'Fio de sutura 4-0 seda', codigo: 'xxxxxx' },
  { id: 335, categoria: 'Fios de Sutura', nome: 'Fio de sutura 5-0 nylon', codigo: 'xxxxxx' },
  { id: 336, categoria: 'Fios de Sutura', nome: 'Fio de sutura 4-0 categute', codigo: 'xxxxxx' },
  { id: 337, categoria: 'Fios de Sutura', nome: 'Fio de sutura 3-0 vicryl', codigo: 'xxxxxx' },
  { id: 338, categoria: 'Materiais para Hemostasia', nome: 'Esponja hemostática', codigo: 'xxxxxx' },
  { id: 339, categoria: 'Materiais para Hemostasia', nome: 'Cera para hemostasia óssea', codigo: 'xxxxxx' },
  { id: 340, categoria: 'Materiais para Hemostasia', nome: 'Gaze hemostática', codigo: 'xxxxxx' },
  { id: 341, categoria: 'Materiais para Hemostasia', nome: 'Solução hemostática', codigo: 'xxxxxx' },
  { id: 342, categoria: 'Medicamentos de Uso Tópico', nome: 'Própolis spray', codigo: 'xxxxxx' },
  { id: 343, categoria: 'Medicamentos de Uso Tópico', nome: 'Omcilon orobase', codigo: 'xxxxxx' },
  { id: 344, categoria: 'Medicamentos de Uso Tópico', nome: 'Gingilone', codigo: 'xxxxxx' },
  { id: 345, categoria: 'Medicamentos de Uso Tópico', nome: 'Lidocaína gel 2%', codigo: 'xxxxxx' },
  { id: 346, categoria: 'Instrumentais de Exame', nome: 'Kit básico clínico (espelho, pinça, sonda)', codigo: 'xxxxxx' },
  { id: 347, categoria: 'Instrumentais de Exame', nome: 'Sonda periodontal milimetrada OMS', codigo: 'xxxxxx' },
  { id: 348, categoria: 'Instrumentais de Exame', nome: 'Explorador de ponta reta', codigo: 'xxxxxx' },
  { id: 349, categoria: 'Instrumentais de Exame', nome: 'Explorador de ponta curva', codigo: 'xxxxxx' },
  { id: 350, categoria: 'Acessórios para Fotopolimerizador', nome: 'Radiômetro (medidor de luz)', codigo: 'xxxxxx' },
  { id: 351, categoria: 'Acessórios para Fotopolimerizador', nome: 'Ponteira para fotopolimerizador', codigo: 'xxxxxx' },
  { id: 352, categoria: 'Acessórios para Fotopolimerizador', nome: 'Protetor ocular para fotopolimerização', codigo: 'xxxxxx' },
  { id: 353, categoria: 'Materiais para Prótese Fixa', nome: 'Fio retrator gengival nº 0', codigo: 'xxxxxx' },
  { id: 354, categoria: 'Materiais para Prótese Fixa', nome: 'Fio retrator gengival nº 00', codigo: 'xxxxxx' },
  { id: 355, categoria: 'Materiais para Prótese Fixa', nome: 'Fio retrator gengival nº 000', codigo: 'xxxxxx' },
  { id: 356, categoria: 'Materiais para Prótese Fixa', nome: 'Cimento provisório TempBond', codigo: 'xxxxxx' },
  { id: 357, categoria: 'Materiais para Prótese Fixa', nome: 'Cimento definitivo RelyX', codigo: 'xxxxxx' },
  { id: 358, categoria: 'Materiais para Prótese Fixa', nome: 'Cimento de fosfato de zinco', codigo: 'xxxxxx' },
  { id: 359, categoria: 'Instrumentais para Dentística Avançada', nome: 'Espátula de resina Anti-aderente', codigo: 'xxxxxx' },
  { id: 360, categoria: 'Instrumentais para Dentística Avançada', nome: 'Espátula opaca para resina', codigo: 'xxxxxx' },
  { id: 361, categoria: 'Instrumentais para Dentística Avançada', nome: 'Kit de acabamento cerâmico', codigo: 'xxxxxx' },
  { id: 362, categoria: 'Instrumentais para Dentística Avançada', nome: 'Macro modelo de dentes', codigo: 'xxxxxx' },
  { id: 363, categoria: 'Materiais Diversos', nome: 'Lixa de unha metálica', codigo: 'xxxxxx' },
  { id: 364, categoria: 'Materiais Diversos', nome: 'Pedra de afiar triangular', codigo: 'xxxxxx' },
  { id: 365, categoria: 'Materiais Diversos', nome: 'Teste de vitalidade pulpar (gás refrigerante)', codigo: 'xxxxxx' },
  { id: 366, categoria: 'Materiais Diversos', nome: 'Bastão de guta-percha', codigo: 'xxxxxx' },
  { id: 367, categoria: 'Materiais Diversos', nome: 'Aquecedor de guta-percha', codigo: 'xxxxxx' },
  { id: 368, categoria: 'Materiais Diversos', nome: 'Lupa de aumento 2.5x', codigo: 'xxxxxx' },
  { id: 369, categoria: 'Materiais para Esterilização', nome: 'Cassete para esterilização de instrumentais', codigo: 'xxxxxx' },
  { id: 370, categoria: 'Materiais para Esterilização', nome: 'Envelope para autoclave (diversos tamanhos)', codigo: 'xxxxxx' },
  { id: 371, categoria: 'Materiais para Esterilização', nome: 'Fita teste para autoclave', codigo: 'xxxxxx' },
  { id: 372, categoria: 'Materiais para Esterilização', nome: 'Detergente enzimático concentrado', codigo: 'xxxxxx' },
  { id: 373, categoria: 'Materiais para Esterilização', nome: 'Escova para limpeza de instrumentais', codigo: 'xxxxxx' },
  { id: 374, categoria: 'Equipamentos de Uso Pessoal', nome: 'Estetoscópio', codigo: 'xxxxxx' },
  { id: 375, categoria: 'Equipamentos de Uso Pessoal', nome: 'Esfigmomanômetro (aparelho de pressão)', codigo: 'xxxxxx' },
  { id: 376, categoria: 'Equipamentos de Uso Pessoal', nome: 'Termômetro digital', codigo: 'xxxxxx' },
  { id: 377, categoria: 'Equipamentos de Uso Pessoal', nome: 'Lanterna clínica LED', codigo: 'xxxxxx' },
  { id: 378, categoria: 'Materiais de Consumo Geral', nome: 'Caneta marcador permanente', codigo: 'xxxxxx' },
  { id: 379, categoria: 'Materiais de Consumo Geral', nome: 'Etiquetas adesivas', codigo: 'xxxxxx' },
  { id: 380, categoria: 'Materiais de Consumo Geral', nome: 'Tesoura comum', codigo: 'xxxxxx' },
  { id: 381, categoria: 'Materiais de Consumo Geral', nome: 'Fita crepe', codigo: 'xxxxxx' },
  { id: 382, categoria: 'Materiais de Consumo Geral', nome: 'Saco plástico transparente (diversos tamanhos)', codigo: 'xxxxxx' }
];

const ChecklistMateriais = () => {
  const [cpf, setCpf] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const { toast } = useToast();

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(MATERIAIS.map(item => item.categoria));
    return ['Todas', ...Array.from(cats).sort()];
  }, []);

  // Filter materials
  const filteredMaterials = useMemo(() => {
    return MATERIAIS.filter(item => {
      const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.codigo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todas' || item.categoria === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Format CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  // Validate CPF
  const validateCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11) return false;

    // Check if all digits are the same
    if (/^(\d)\1+$/.test(numbers)) return false;

    // Validate check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers.charAt(i)) * (10 - i);
    }
    let checkDigit = 11 - (sum % 11);
    if (checkDigit >= 10) checkDigit = 0;
    if (checkDigit !== parseInt(numbers.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers.charAt(i)) * (11 - i);
    }
    checkDigit = 11 - (sum % 11);
    if (checkDigit >= 10) checkDigit = 0;
    if (checkDigit !== parseInt(numbers.charAt(10))) return false;

    return true;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const toggleItem = useCallback((id: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSendList = async () => {
    if (!validateCPF(cpf)) {
      toast({
        title: 'CPF Inválido',
        description: 'Por favor, insira um CPF válido.',
        variant: 'destructive'
      });
      return;
    }

    if (selectedItems.size === 0) {
      toast({
        title: 'Nenhum item selecionado',
        description: 'Selecione pelo menos um material.',
        variant: 'destructive'
      });
      return;
    }

    const selectedMaterials = MATERIAIS.filter(item => selectedItems.has(item.id));

    try {
      const response = await fetch('https://webhook.dentaljua.com/webhook/fb392d36-19c9-4fc2-8aa7-e98cc0600911', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf: cpf,
          materiais: selectedMaterials,
          total: selectedItems.size,
          data: new Date().toISOString()
        })
      });

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: `Lista enviada com ${selectedItems.size} itens.`
        });
        setSelectedItems(new Set());
        setCpf('');
      } else {
        throw new Error('Erro ao enviar');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a lista. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  const handleDownloadList = () => {
    const selectedMaterials = MATERIAIS.filter(item => selectedItems.has(item.id));
    const text = `LISTA DE MATERIAIS - 5º SEMESTRE ODONTOLOGIA\nCPF: ${cpf}\nData: ${new Date().toLocaleDateString()}\n\n${selectedMaterials.map(item => `- ${item.nome} (${item.codigo})`).join('\n')}`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `materiais-odontologia-${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Checklist de Materiais - 5º Semestre Odontologia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* CPF Input */}
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Digite seu CPF"
              value={cpf}
              onChange={handleCPFChange}
              maxLength={14}
              className="max-w-xs"
            />
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar material..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Selected Count */}
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium">
              Selecionados: <span className="text-primary">{selectedItems.size}</span> de {MATERIAIS.length} itens
            </p>
          </div>

          {/* Materials List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto border rounded-lg p-4">
            {filteredMaterials.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-md transition-colors"
              >
                <Checkbox
                  checked={selectedItems.has(item.id)}
                  onCheckedChange={() => toggleItem(item.id)}
                  id={`item-${item.id}`}
                />
                <label
                  htmlFor={`item-${item.id}`}
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.nome}</p>
                      <p className="text-sm text-muted-foreground">{item.categoria}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{item.codigo}</span>
                  </div>
                </label>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleSendList}
              disabled={selectedItems.size === 0 || !cpf}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Enviar Lista
            </Button>
            <Button
              onClick={handleDownloadList}
              disabled={selectedItems.size === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Baixar Lista
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChecklistMateriais;
