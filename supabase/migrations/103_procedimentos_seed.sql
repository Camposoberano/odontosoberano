-- ============================================================
-- Migration 103: Seed — Catálogo TUSS/VRPO de Procedimentos
-- ~80 procedimentos odontológicos nas 8 categorias principais
-- ============================================================

INSERT INTO procedimentos_catalogo (codigo_tuss, codigo_vrpo, nome, categoria, preco_sugerido) VALUES

-- ============================================================
-- PREVENÇÃO E CLÍNICO GERAL
-- ============================================================
('81000022', 'CFO-001', 'Consulta/avaliação odontológica inicial', 'Prevenção e Clínico Geral', 150.00),
('81000030', 'CFO-002', 'Profilaxia dental (limpeza)', 'Prevenção e Clínico Geral', 180.00),
('81000049', 'CFO-003', 'Aplicação de flúor tópico', 'Prevenção e Clínico Geral', 80.00),
('81000057', 'CFO-004', 'Restauração com resina composta - 1 face', 'Prevenção e Clínico Geral', 250.00),
('81000065', 'CFO-005', 'Restauração com resina composta - 2 faces', 'Prevenção e Clínico Geral', 350.00),
('81000073', 'CFO-006', 'Restauração com resina composta - 3 faces ou mais', 'Prevenção e Clínico Geral', 450.00),
('81000081', 'CFO-007', 'Selante de fissura (por dente)', 'Prevenção e Clínico Geral', 120.00),
('81000090', 'CFO-008', 'Radiografia periapical (por dente)', 'Prevenção e Clínico Geral', 60.00),
('81000103', 'CFO-009', 'Radiografia panorâmica', 'Prevenção e Clínico Geral', 200.00),
('81000111', 'CFO-010', 'Cimentação de coroa/prótese provisória', 'Prevenção e Clínico Geral', 150.00),

-- ============================================================
-- CIRURGIA
-- ============================================================
('82000011', 'CFO-101', 'Extração de dente decíduo', 'Cirurgia', 150.00),
('82000020', 'CFO-102', 'Extração de dente permanente', 'Cirurgia', 250.00),
('82000038', 'CFO-103', 'Extração de terceiro molar (siso) - erupcionado', 'Cirurgia', 450.00),
('82000046', 'CFO-104', 'Extração de terceiro molar incluso/semi-incluso', 'Cirurgia', 900.00),
('82000054', 'CFO-105', 'Alveolotomia (por sextante)', 'Cirurgia', 600.00),
('82000062', 'CFO-106', 'Frenectomia labial', 'Cirurgia', 700.00),
('82000070', 'CFO-107', 'Frenectomia lingual', 'Cirurgia', 700.00),
('82000089', 'CFO-108', 'Apicectomia', 'Cirurgia', 1200.00),
('82000097', 'CFO-109', 'Enxerto ósseo (por área)', 'Cirurgia', 2500.00),
('82000100', 'CFO-110', 'Biópsia de tecido mole', 'Cirurgia', 800.00),

-- ============================================================
-- ENDODONTIA
-- ============================================================
('83000010', 'CFO-201', 'Tratamento de canal - dente anterior (1 canal)', 'Endodontia', 800.00),
('83000029', 'CFO-202', 'Tratamento de canal - pré-molar (2 canais)', 'Endodontia', 1000.00),
('83000037', 'CFO-203', 'Tratamento de canal - molar (3-4 canais)', 'Endodontia', 1400.00),
('83000045', 'CFO-204', 'Retratamento endodôntico - anterior', 'Endodontia', 1200.00),
('83000053', 'CFO-205', 'Retratamento endodôntico - molar', 'Endodontia', 1800.00),
('83000061', 'CFO-206', 'Pulpotomia (dente decíduo)', 'Endodontia', 350.00),
('83000070', 'CFO-207', 'Capeamento pulpar direto', 'Endodontia', 400.00),
('83000088', 'CFO-208', 'Núcleo de preenchimento (por dente)', 'Endodontia', 450.00),

-- ============================================================
-- PERIODONTIA
-- ============================================================
('84000019', 'CFO-301', 'Raspagem e alisamento radicular - 1 sextante', 'Periodontia', 400.00),
('84000027', 'CFO-302', 'Raspagem supragengival (boca toda)', 'Periodontia', 600.00),
('84000035', 'CFO-303', 'Cirurgia periodontal a retalho (por sextante)', 'Periodontia', 1500.00),
('84000043', 'CFO-304', 'Gengivoplastia (por sextante)', 'Periodontia', 800.00),
('84000051', 'CFO-305', 'Enxerto gengival livre', 'Periodontia', 2000.00),
('84000060', 'CFO-306', 'Enxerto de tecido conjuntivo subepitelial', 'Periodontia', 2200.00),
('84000078', 'CFO-307', 'Cunha distal', 'Periodontia', 700.00),
('84000086', 'CFO-308', 'Bioestimulação com laser terapêutico', 'Periodontia', 200.00),

-- ============================================================
-- IMPLANTODONTIA
-- ============================================================
('85000018', 'CFO-401', 'Instalação de implante osseointegrado', 'Implantodontia', 3500.00),
('85000026', 'CFO-402', 'Reabertura de implante (2º estágio cirúrgico)', 'Implantodontia', 600.00),
('85000034', 'CFO-403', 'Coroa sobre implante - metalocerâmica', 'Implantodontia', 2500.00),
('85000042', 'CFO-404', 'Coroa sobre implante - zircônia', 'Implantodontia', 3500.00),
('85000050', 'CFO-405', 'Overdenture sobre implante (2 implantes)', 'Implantodontia', 8000.00),
('85000069', 'CFO-406', 'Protocolo all-on-4 (por arcada)', 'Implantodontia', 22000.00),
('85000077', 'CFO-407', 'Protocolo all-on-6 (por arcada)', 'Implantodontia', 28000.00),
('85000085', 'CFO-408', 'Levantamento de seio maxilar', 'Implantodontia', 3500.00),
('85000093', 'CFO-409', 'Distração alveolar', 'Implantodontia', 4000.00),
('85000107', 'CFO-410', 'Implante zigomático', 'Implantodontia', 8000.00),

-- ============================================================
-- ORTODONTIA
-- ============================================================
('86000017', 'CFO-501', 'Documentação ortodôntica completa', 'Ortodontia', 600.00),
('86000025', 'CFO-502', 'Instalação de aparelho metálico (fixo)', 'Ortodontia', 2500.00),
('86000033', 'CFO-503', 'Instalação de aparelho estético (cerâmico)', 'Ortodontia', 3500.00),
('86000041', 'CFO-504', 'Manutenção mensal de aparelho fixo', 'Ortodontia', 250.00),
('86000050', 'CFO-505', 'Alinhadores invisíveis (tratamento completo)', 'Ortodontia', 8000.00),
('86000068', 'CFO-506', 'Aparelho móvel (placa removível)', 'Ortodontia', 1200.00),
('86000076', 'CFO-507', 'Aparelho expansor palatino', 'Ortodontia', 1800.00),
('86000084', 'CFO-508', 'Contenção orthodôntica (por arcada)', 'Ortodontia', 400.00),

-- ============================================================
-- HOF (HARMONIZAÇÃO OROFACIAL)
-- ============================================================
('89000010', 'CFO-601', 'Toxina botulínica - rugas de expressão (por área)', 'HOF', 1200.00),
('89000029', 'CFO-602', 'Preenchimento labial com ácido hialurônico', 'HOF', 1500.00),
('89000037', 'CFO-603', 'Preenchimento de sulco nasogeniano', 'HOF', 1400.00),
('89000045', 'CFO-604', 'Fio de sustentação (por fio)', 'HOF', 800.00),
('89000053', 'CFO-605', 'Bioestimulador de colágeno', 'HOF', 2000.00),
('89000061', 'CFO-606', 'Lipo de papada com enzima', 'HOF', 2500.00),
('89000070', 'CFO-607', 'Toxina botulínica - bruxismo (masseter)', 'HOF', 1600.00),
('89000088', 'CFO-608', 'Peeling químico orofacial', 'HOF', 900.00),

-- ============================================================
-- PRÓTESE
-- ============================================================
('87000016', 'CFO-701', 'Prótese total superior (dentadura)', 'Prótese', 2800.00),
('87000024', 'CFO-702', 'Prótese total inferior (dentadura)', 'Prótese', 2800.00),
('87000032', 'CFO-703', 'Prótese parcial removível (PPR) - metálica', 'Prótese', 2500.00),
('87000040', 'CFO-704', 'Prótese parcial removível (PPR) - acrílica', 'Prótese', 1500.00),
('87000059', 'CFO-705', 'Coroa metalocerâmica (por unidade)', 'Prótese', 1800.00),
('87000067', 'CFO-706', 'Coroa de zircônia (por unidade)', 'Prótese', 2800.00),
('87000075', 'CFO-707', 'Coroa de cerâmica pura (e.max)', 'Prótese', 2500.00),
('87000083', 'CFO-708', 'Faceta de porcelana (por dente)', 'Prótese', 2200.00),
('87000091', 'CFO-709', 'Lente de contato dental (por dente)', 'Prótese', 2500.00),
('87000105', 'CFO-710', 'Prótese fixa - ponte de 3 elementos', 'Prótese', 5400.00),
('87000113', 'CFO-711', 'Inlay/Onlay de resina ou cerâmica', 'Prótese', 1800.00),
('87000121', 'CFO-712', 'Clareamento dental a laser (sessão)', 'Prótese', 500.00)

ON CONFLICT DO NOTHING;
