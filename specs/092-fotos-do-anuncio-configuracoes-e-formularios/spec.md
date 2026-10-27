# Spec 092 — Fotos do anúncio, Configurações e formulários

## Objetivo
Fechar lacunas de usabilidade encontradas na revisão das telas restantes.

## Comportamento
1. **Fotos do anúncio (etapa 2)**: os três espaços de foto agora abrem "Tirar foto" / "Escolher da galeria" (`PhotoSourceSheet`), com recorte de capa 5:8, redução para 1080 px (Spec 087), validação por conteúdo e envio ao bucket `book-photos` em `<pessoa>/anuncio/foto-<único>.<ext>`. Antes só era possível colar o link de uma imagem; o link virou alternativa ("Prefiro colar o link de uma imagem"). Mostra envio em andamento e erros (permissão negada, formato, 5 MB).
2. **Configurações**: cartão da conta (foto, nome, e-mail, "Editar"); atalhos de segurança e notificações; "Bairro padrão"; "Limpar histórico de buscas"; "Falar com a equipe" (e-mail de suporte `ipebook738@gmail.com`, com assunto e versão); "Sair da conta" com confirmação.
3. **Formulários** (`TextField`): campos de senha ganham o olho de mostrar/ocultar; `autoComplete`, `textContentType`, `returnKeyType` e `onSubmitEditing` (Entrar, Criar conta, Esqueci a senha e Redefinir senha usam os valores certos; a senha final envia o formulário pelo teclado).
4. **Modais** (`Dialog`, leitor de código de barras, avaliação, ordenação): barras do sistema translúcidas, sem faixas cinza.
5. **Encontro**: opção selecionada usa o ícone de check, não o caractere "✓".

## Validação
`npm run validate`: cobertura de ramos 80,03 % (limite 80 %). Testes novos: caso de uso e viewmodel de foto do anúncio, etapa 2, `TextField`, Configurações, tela "Denunciar pessoa", folha de segurança, `pushOnce`. Conferido no Galaxy A16: galeria → recorte 5:8 → envio (JPEG de ~100 KB em `<pessoa>/anuncio/`) → pré-visualização no espaço da capa. A leitura do arquivo no nativo passou a usar `require("expo-file-system")` síncrono (o `import()` dinâmico quebrava no Expo Go com "Requiring unknown module"). Câmera e demais fluxos desta spec confirmados como funcionais pelo usuário em 2026-10-27.
