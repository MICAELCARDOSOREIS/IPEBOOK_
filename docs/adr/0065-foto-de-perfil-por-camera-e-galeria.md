# ADR 0065 — Foto de perfil pela câmera ou galeria, guardada no bucket `book-photos`

- **Status:** Aceito
- **Data:** 26 de outubro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Contexto técnico:** Spec 080 (Editar perfil profissional com foto e Instagram).
- **Relacionado a:** substitui a alternativa rejeitada "escolher da galeria" do ADR 0061; usa o bucket do
  ADR 0017 e a validação de upload do ADR 0026.

## Contexto

O ADR 0061 manteve a foto de perfil como **link colado**, rejeitando a galeria porque exigiria
`expo-image-picker` e uma decisão de armazenamento (só existia o bucket `book-photos`). Na prática, quase
ninguém tem um link público da própria foto: o campo ficava vazio e a tela parecia amadora. O usuário pediu
explicitamente escolher da galeria ou tirar a foto na hora.

## Decisão

1. **Adotar `expo-image-picker`** (versão compatível com o SDK 58, incluída no Expo Go) para abrir a câmera
   ou a galeria com recorte quadrado (1:1) e compressão (`quality` 0,7).
2. **Guardar a foto no bucket `book-photos`**, no caminho `<id do usuário>/perfil/<arquivo>`. As políticas
   atuais do bucket já restringem envio e exclusão à pasta do próprio usuário e a leitura é pública, como
   precisa ser para o avatar. Assim **não há migração nova de Storage** nem nova política a aplicar no remoto.
3. **Validar pelo conteúdo, não pelo nome**: o caso de uso `ProfilePhotoUseCases` confere os *magic bytes*
   (JPEG, PNG, WebP) e o limite de 5 MB antes de enviar, e só então grava a URL pública no perfil.
4. O link colado deixa de existir na interface; perfis que já têm `photo_url` continuam funcionando.

## Alternativas consideradas

- **Bucket novo `avatars`**: nome mais claro, mas exige migração de Storage e políticas novas no remoto sem
  ganho de segurança sobre o isolamento por pasta já existente. Pode ser revisto se as fotos de perfil
  precisarem de regras próprias (por exemplo, moderação).
- **Manter o link**: rejeitado pelo uso real descrito acima.

## Consequências

- Dependência nova `expo-image-picker`; permissões de câmera e fotos com textos em português no `app.json`.
- O texto da permissão de câmera deixa de dizer "apenas para o ISBN".
- Fotos de perfil antigas ficam órfãs no bucket ao trocar de foto (sem limpeza automática nesta entrega).
