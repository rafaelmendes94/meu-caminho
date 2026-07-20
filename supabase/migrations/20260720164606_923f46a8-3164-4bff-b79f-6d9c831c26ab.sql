-- Completa capas dos conteúdos existentes que ainda estavam sem imagem
UPDATE public.content_items
SET
  cover_url = CASE
    WHEN type = 'reflection' THEN '/__l5e/assets-v1/3436e149-871e-4dcb-9360-9acb65f24e7f/reflexao.jpg'
    WHEN type = 'exercise' THEN '/__l5e/assets-v1/8ca32b64-cb11-4158-aaf6-dd9b4d34becc/exercicio.jpg'
    WHEN type = 'ritual' THEN '/__l5e/assets-v1/24a28d94-1d33-48ee-b895-a394f7731bf0/meditacao.jpg'
    WHEN type = 'message' THEN '/__l5e/assets-v1/0d982010-3846-419b-a209-ca484f5c2612/frase.jpg'
    WHEN type = 'video' THEN '/__l5e/assets-v1/c2492f46-7583-42d3-a09d-0a35df3f7546/video.jpg'
    WHEN type = 'audio' THEN '/__l5e/assets-v1/a0ddc4c3-1182-4848-9c95-1707d6f19f5e/audio.jpg'
    WHEN type = 'podcast' THEN '/__l5e/assets-v1/2b111c2c-7b44-4853-95cd-6c2608a45e2f/podcast.jpg'
    WHEN type = 'book' THEN '/__l5e/assets-v1/58eaf4b9-ee10-4f4f-87d4-8e628b933f58/livro.jpg'
    WHEN type = 'course' THEN '/__l5e/assets-v1/36d69850-3dab-4623-9947-9ddb1a21d47c/ia.jpg'
    WHEN type = 'track' THEN '/__l5e/assets-v1/36d69850-3dab-4623-9947-9ddb1a21d47c/ia.jpg'
    ELSE '/__l5e/assets-v1/3436e149-871e-4dcb-9360-9acb65f24e7f/reflexao.jpg'
  END,
  banner_url = COALESCE(banner_url, CASE
    WHEN type = 'reflection' THEN '/__l5e/assets-v1/3436e149-871e-4dcb-9360-9acb65f24e7f/reflexao.jpg'
    WHEN type = 'exercise' THEN '/__l5e/assets-v1/8ca32b64-cb11-4158-aaf6-dd9b4d34becc/exercicio.jpg'
    WHEN type = 'ritual' THEN '/__l5e/assets-v1/24a28d94-1d33-48ee-b895-a394f7731bf0/meditacao.jpg'
    WHEN type = 'message' THEN '/__l5e/assets-v1/0d982010-3846-419b-a209-ca484f5c2612/frase.jpg'
    ELSE '/__l5e/assets-v1/3436e149-871e-4dcb-9360-9acb65f24e7f/reflexao.jpg'
  END),
  updated_at = now()
WHERE status = 'published'
  AND (cover_url IS NULL OR cover_url = '' OR cover_url LIKE 'https://images.unsplash.com/%' OR cover_url LIKE 'https://example.com/%');

-- Cadastra mais conteúdos no Feed, incluindo Stories/Cortes completos
INSERT INTO public.content_items (
  type, status, title, subtitle, slug, short_description, long_description,
  cover_url, banner_url, language, level, duration_minutes, file_url, media_url,
  is_premium, is_featured, published_at, metadata, recommendation_weights,
  audience_tags, difficulty_level, expected_outcomes
)
VALUES
  ('video','published','Corte: respire antes de reagir','Corte rápido','corte-respire-antes-de-reagir','Um corte curto para pausar antes de responder sob pressão.','Técnica breve inspirada na gestão da emoção para reduzir impulsividade e recuperar clareza em momentos de tensão.','/__l5e/assets-v1/416ce155-8c01-49b3-8818-0a0377e73c4d/corte.jpg','/__l5e/assets-v1/416ce155-8c01-49b3-8818-0a0377e73c4d/corte.jpg','pt-BR','iniciante',1,NULL,'https://www.youtube.com/embed/dQw4w9WgXcQ',false,true,now() - interval '1 hour','{"feed_format":"story","feed_variant":"story","source":"cury","topic":"gestao_emocional","vturb_ready":true}'::jsonb,'{"ansiedade":0.9,"lideranca":0.5,"foco":0.7}'::jsonb,ARRAY['ansiedade','gestao-emocional','pausa'],1,ARRAY['Pausar antes de reagir','Reduzir resposta impulsiva']),
  ('video','published','Corte: proteja sua energia mental','Corte rápido','corte-proteja-sua-energia-mental','Uma mensagem curta para filtrar preocupações e preservar energia.','Conteúdo em formato vertical, pronto para cortes ou VTurb, sobre higiene mental no ambiente de trabalho.','/__l5e/assets-v1/416ce155-8c01-49b3-8818-0a0377e73c4d/corte.jpg','/__l5e/assets-v1/416ce155-8c01-49b3-8818-0a0377e73c4d/corte.jpg','pt-BR','iniciante',1,NULL,'https://www.youtube.com/embed/ysz5S6PUM-U',false,true,now() - interval '2 hours','{"feed_format":"story","feed_variant":"story","source":"cury","topic":"energia_mental","vturb_ready":true}'::jsonb,'{"ansiedade":0.8,"bem_estar":0.9,"foco":0.6}'::jsonb,ARRAY['bem-estar','energia-mental','autocuidado'],1,ARRAY['Reconhecer excesso mental','Criar micro pausa']),
  ('video','published','Corte: não compre conflitos','Corte rápido','corte-nao-compre-conflitos','Um lembrete prático para não absorver tensões que não são suas.','Corte de desenvolvimento emocional para colaboradores lidarem melhor com ruídos, pressão e conversas difíceis.','/__l5e/assets-v1/416ce155-8c01-49b3-8818-0a0377e73c4d/corte.jpg','/__l5e/assets-v1/416ce155-8c01-49b3-8818-0a0377e73c4d/corte.jpg','pt-BR','intermediario',2,NULL,'https://www.youtube.com/embed/jNQXAC9IVRw',false,false,now() - interval '3 hours','{"feed_format":"story","feed_variant":"story","source":"cury","topic":"conflitos","vturb_ready":true}'::jsonb,'{"relacionamento":0.9,"lideranca":0.8,"ansiedade":0.4}'::jsonb,ARRAY['conflitos','comunicacao','lideranca'],2,ARRAY['Separar fatos de emoções','Evitar absorção de conflito']),
  ('video','published','Corte: lidere a própria mente','Corte rápido','corte-lidere-propria-mente','Um insight rápido sobre assumir o comando dos pensamentos.','Conteúdo curto para fortalecer protagonismo emocional e reduzir automatismos mentais durante o expediente.','/__l5e/assets-v1/416ce155-8c01-49b3-8818-0a0377e73c4d/corte.jpg','/__l5e/assets-v1/416ce155-8c01-49b3-8818-0a0377e73c4d/corte.jpg','pt-BR','intermediario',2,NULL,'https://www.youtube.com/embed/aqz-KE-bpKQ',false,true,now() - interval '4 hours','{"feed_format":"story","feed_variant":"story","source":"cury","topic":"protagonismo","vturb_ready":true}'::jsonb,'{"lideranca":0.9,"foco":0.8,"resiliencia":0.9}'::jsonb,ARRAY['protagonismo','lideranca','mente'],2,ARRAY['Praticar autoconsciência','Assumir postura ativa']),

  ('audio','published','Áudio: pausa de 3 minutos para ansiedade','Prática guiada','audio-pausa-3min-ansiedade','Respiração guiada curta para reduzir tensão no meio do dia.','Áudio breve para ser ouvido entre reuniões, com foco em respiração, aterramento e retomada de presença.','/__l5e/assets-v1/a0ddc4c3-1182-4848-9c95-1707d6f19f5e/audio.jpg','/__l5e/assets-v1/a0ddc4c3-1182-4848-9c95-1707d6f19f5e/audio.jpg','pt-BR','iniciante',3,NULL,'https://example.com/audio/pausa-ansiedade-3min.mp3',false,true,now() - interval '5 hours','{"audio_kind":"guided","source":"cury","topic":"ansiedade"}'::jsonb,'{"ansiedade":1,"bem_estar":0.8}'::jsonb,ARRAY['ansiedade','respiracao','pausa'],1,ARRAY['Reduzir tensão','Retomar presença']),
  ('audio','published','Áudio: foco sem autocobrança','Prática guiada','audio-foco-sem-autocobranca','Exercício em áudio para organizar prioridades com leveza.','Um áudio para colaboradores que estão sobrecarregados e precisam recuperar foco sem entrar em autocrítica.','/__l5e/assets-v1/a0ddc4c3-1182-4848-9c95-1707d6f19f5e/audio.jpg','/__l5e/assets-v1/a0ddc4c3-1182-4848-9c95-1707d6f19f5e/audio.jpg','pt-BR','iniciante',4,NULL,'https://example.com/audio/foco-sem-autocobranca.mp3',false,false,now() - interval '6 hours','{"audio_kind":"guided","source":"cury","topic":"foco"}'::jsonb,'{"foco":1,"produtividade":0.8,"ansiedade":0.5}'::jsonb,ARRAY['foco','produtividade','autocuidado'],1,ARRAY['Organizar prioridades','Diminuir autocobrança']),

  ('podcast','published','Podcast: conversas difíceis com serenidade','Meu Caminho Cast','podcast-conversas-dificeis-serenidade','Episódio sobre comunicação emocionalmente segura.','Discussão prática sobre como preparar conversas delicadas, sustentar limites e preservar vínculos profissionais.','/__l5e/assets-v1/2b111c2c-7b44-4853-95cd-6c2608a45e2f/podcast.jpg','/__l5e/assets-v1/2b111c2c-7b44-4853-95cd-6c2608a45e2f/podcast.jpg','pt-BR','intermediario',18,NULL,'https://open.spotify.com/embed/episode/meu-caminho-conversas-dificeis',false,true,now() - interval '7 hours','{"podcast_series":"Meu Caminho Cast","source":"cury","topic":"comunicacao"}'::jsonb,'{"comunicacao":1,"lideranca":0.8,"relacionamento":0.7}'::jsonb,ARRAY['comunicacao','conflitos','lideranca'],2,ARRAY['Preparar conversas difíceis','Comunicar limites']),
  ('podcast','published','Podcast: ansiedade no trabalho moderno','Meu Caminho Cast','podcast-ansiedade-trabalho-moderno','Reflexão sobre pressa, cobrança e saúde emocional.','Episódio com linguagem acessível para entender gatilhos de ansiedade e criar rituais de proteção emocional.','/__l5e/assets-v1/2b111c2c-7b44-4853-95cd-6c2608a45e2f/podcast.jpg','/__l5e/assets-v1/2b111c2c-7b44-4853-95cd-6c2608a45e2f/podcast.jpg','pt-BR','iniciante',21,NULL,'https://open.spotify.com/embed/episode/meu-caminho-ansiedade-trabalho',false,false,now() - interval '8 hours','{"podcast_series":"Meu Caminho Cast","source":"cury","topic":"ansiedade"}'::jsonb,'{"ansiedade":1,"bem_estar":0.9,"cultura":0.5}'::jsonb,ARRAY['ansiedade','bem-estar','trabalho'],1,ARRAY['Identificar gatilhos','Criar ritual de proteção']),

  ('reflection','published','Reflexão: a mente também precisa de pausa','Reflexão guiada','reflexao-mente-tambem-precisa-pausa','Um texto curto para reconhecer sinais de saturação mental.','Reflexão para ler em poucos minutos, conectar emoções e escolher uma pausa consciente antes da exaustão.','/__l5e/assets-v1/3436e149-871e-4dcb-9360-9acb65f24e7f/reflexao.jpg','/__l5e/assets-v1/3436e149-871e-4dcb-9360-9acb65f24e7f/reflexao.jpg','pt-BR','iniciante',5,NULL,NULL,false,true,now() - interval '9 hours','{"reading_time":"5 min","source":"cury","topic":"pausa"}'::jsonb,'{"bem_estar":0.9,"ansiedade":0.7}'::jsonb,ARRAY['pausa','bem-estar','autocuidado'],1,ARRAY['Reconhecer saturação','Praticar pausa consciente']),
  ('reflection','published','Reflexão: coragem para recomeçar','Reflexão guiada','reflexao-coragem-para-recomecar','Uma leitura sobre erro, aprendizado e recomeço.','Conteúdo inspirado na ideia de reescrever rotas internas sem transformar falhas em identidade.','/__l5e/assets-v1/3436e149-871e-4dcb-9360-9acb65f24e7f/reflexao.jpg','/__l5e/assets-v1/3436e149-871e-4dcb-9360-9acb65f24e7f/reflexao.jpg','pt-BR','iniciante',6,NULL,NULL,false,false,now() - interval '10 hours','{"reading_time":"6 min","source":"cury","topic":"resiliencia"}'::jsonb,'{"resiliencia":1,"protagonismo":0.8}'::jsonb,ARRAY['resiliencia','recomeco','protagonismo'],1,ARRAY['Ressignificar erros','Fortalecer recomeços']),

  ('exercise','published','Exercício: mapa de gatilhos emocionais','Prática individual','exercicio-mapa-gatilhos-emocionais','Identifique situações que disparam ansiedade ou irritação.','Atividade simples para registrar gatilhos, sensações, pensamentos automáticos e uma resposta alternativa mais saudável.','/__l5e/assets-v1/8ca32b64-cb11-4158-aaf6-dd9b4d34becc/exercicio.jpg','/__l5e/assets-v1/8ca32b64-cb11-4158-aaf6-dd9b4d34becc/exercicio.jpg','pt-BR','intermediario',12,NULL,NULL,false,true,now() - interval '11 hours','{"exercise_type":"worksheet","source":"cury","topic":"autoconhecimento"}'::jsonb,'{"autoconhecimento":1,"ansiedade":0.8,"relacionamento":0.6}'::jsonb,ARRAY['autoconhecimento','gatilhos','ansiedade'],2,ARRAY['Mapear gatilhos','Criar resposta alternativa']),
  ('exercise','published','Exercício: diário de vitórias silenciosas','Prática individual','exercicio-diario-vitorias-silenciosas','Registre pequenos avanços que normalmente passam despercebidos.','Exercício para reforçar autoestima, percepção de progresso e gratidão realista na rotina profissional.','/__l5e/assets-v1/8ca32b64-cb11-4158-aaf6-dd9b4d34becc/exercicio.jpg','/__l5e/assets-v1/8ca32b64-cb11-4158-aaf6-dd9b4d34becc/exercicio.jpg','pt-BR','iniciante',8,NULL,NULL,false,false,now() - interval '12 hours','{"exercise_type":"journaling","source":"cury","topic":"autoestima"}'::jsonb,'{"autoestima":1,"bem_estar":0.8,"resiliencia":0.6}'::jsonb,ARRAY['autoestima','gratidao','progresso'],1,ARRAY['Reconhecer avanços','Fortalecer autoestima']),

  ('ritual','published','Ritual: abertura emocional da semana','Ritual de equipe','ritual-abertura-emocional-semana','Ritual curto para alinhar presença e intenção antes da semana.','Prática para equipes iniciarem a semana com escuta, clareza emocional e compromissos simples de cuidado.','/__l5e/assets-v1/24a28d94-1d33-48ee-b895-a394f7731bf0/meditacao.jpg','/__l5e/assets-v1/24a28d94-1d33-48ee-b895-a394f7731bf0/meditacao.jpg','pt-BR','iniciante',10,NULL,NULL,false,true,now() - interval '13 hours','{"ritual_type":"team","source":"cury","topic":"cultura"}'::jsonb,'{"cultura":1,"lideranca":0.7,"pertencimento":0.9}'::jsonb,ARRAY['cultura','equipe','pertencimento'],1,ARRAY['Alinhar intenção semanal','Estimular escuta']),
  ('ritual','published','Ritual: fechamento sem levar peso para casa','Ritual individual','ritual-fechamento-sem-peso','Rotina breve para encerrar o expediente com menos carga mental.','Ritual de transição entre trabalho e vida pessoal para nomear pendências e soltar o que não precisa seguir com você.','/__l5e/assets-v1/24a28d94-1d33-48ee-b895-a394f7731bf0/meditacao.jpg','/__l5e/assets-v1/24a28d94-1d33-48ee-b895-a394f7731bf0/meditacao.jpg','pt-BR','iniciante',7,NULL,NULL,false,false,now() - interval '14 hours','{"ritual_type":"individual","source":"cury","topic":"descompressao"}'::jsonb,'{"bem_estar":1,"ansiedade":0.7,"sono":0.6}'::jsonb,ARRAY['descompressao','bem-estar','sono'],1,ARRAY['Encerrar expediente','Reduzir ruminação']),

  ('message','published','Frase: você não é a sua ansiedade','Mensagem curta','frase-voce-nao-e-sua-ansiedade','Uma frase de acolhimento para momentos de pressão.','Mensagem curta para reforçar que emoções são sinais, não sentenças definitivas sobre quem somos.','/__l5e/assets-v1/0d982010-3846-419b-a209-ca484f5c2612/frase.jpg','/__l5e/assets-v1/0d982010-3846-419b-a209-ca484f5c2612/frase.jpg','pt-BR','iniciante',1,NULL,NULL,false,true,now() - interval '15 hours','{"message_type":"daily_quote","source":"cury","topic":"ansiedade"}'::jsonb,'{"ansiedade":1,"autoestima":0.6}'::jsonb,ARRAY['ansiedade','acolhimento','autoestima'],1,ARRAY['Acolher emoções','Separar identidade de sintomas']),
  ('message','published','Frase: desacelerar também é avançar','Mensagem curta','frase-desacelerar-tambem-e-avancar','Um lembrete simples para cultivar presença.','Mensagem curta para ambientes de alta demanda, lembrando que clareza nasce de pausas intencionais.','/__l5e/assets-v1/0d982010-3846-419b-a209-ca484f5c2612/frase.jpg','/__l5e/assets-v1/0d982010-3846-419b-a209-ca484f5c2612/frase.jpg','pt-BR','iniciante',1,NULL,NULL,false,false,now() - interval '16 hours','{"message_type":"daily_quote","source":"cury","topic":"presenca"}'::jsonb,'{"bem_estar":0.9,"foco":0.7}'::jsonb,ARRAY['presenca','pausa','bem-estar'],1,ARRAY['Valorizar pausas','Retomar clareza'])
ON CONFLICT (slug) DO UPDATE SET
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  short_description = EXCLUDED.short_description,
  long_description = EXCLUDED.long_description,
  cover_url = EXCLUDED.cover_url,
  banner_url = EXCLUDED.banner_url,
  language = EXCLUDED.language,
  level = EXCLUDED.level,
  duration_minutes = EXCLUDED.duration_minutes,
  file_url = EXCLUDED.file_url,
  media_url = EXCLUDED.media_url,
  is_premium = EXCLUDED.is_premium,
  is_featured = EXCLUDED.is_featured,
  published_at = EXCLUDED.published_at,
  metadata = EXCLUDED.metadata,
  recommendation_weights = EXCLUDED.recommendation_weights,
  audience_tags = EXCLUDED.audience_tags,
  difficulty_level = EXCLUDED.difficulty_level,
  expected_outcomes = EXCLUDED.expected_outcomes,
  updated_at = now();