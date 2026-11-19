# Tarefas — Enquadramento das fotos e acabamento do livro 3D

- [x] Exibir um guia específico de capa, lombada e verso antes da escolha de foto (`PhotoSourceSheet` e `CreateListingStep2`).
- [x] Refinar páginas e sombra na projeção do livro (`Book3D`).
- [x] Validar o fluxo de fotos e o livro 3D nos testes automatizados (`createListingStep2`, `modalityChipsAndSheets`, `dialog`, `book3dGeometry`, `book3D` e `bookDetailInteractiveStatus`: 59 testes passando), `typecheck`, `check:architecture`, `check:design-system`, `check:numbering`, `check:docs` e visualmente no Android via ADB (WayDroid): `Book3D` (páginas, sombra, botão "Ver fotos" e virada ao toque para a contracapa) e `PhotoSourceSheet` nos 3 slots (`Foto da capa`, `Foto da lombada` e `Foto do verso`). A câmera física exige aparelho real.
