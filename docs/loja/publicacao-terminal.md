# Publicação na Google Play pelo terminal

Envia o `.aab` gerado localmente para a Google Play com `eas submit`, sem abrir o Play Console.

## Configuração única

1. **Google Cloud** (https://console.cloud.google.com): crie ou escolha um projeto, ative a
   *Google Play Android Developer API* e crie a conta de serviço `eas-submit` (sem papéis).
   Em *Chaves → Adicionar chave → JSON*, baixe a chave.
2. **Play Console → Usuários e permissões**: convide o e-mail da conta de serviço
   (`...@...iam.gserviceaccount.com`) com acesso ao IpêBook e a permissão
   *Lançar para faixas de teste* (e *Lançar para produção*, quando for a hora).
   A liberação pode levar algumas horas.
3. Salve a chave fora do repositório:
   ```
   mkdir -p ~/.config/ipebook
   mv ~/Downloads/<arquivo>.json ~/.config/ipebook/play-service-account.json
   chmod 600 ~/.config/ipebook/play-service-account.json
   ```
   Outro caminho pode ser usado com a variável `PLAY_SERVICE_ACCOUNT`.

## Uso

```
npm run aab:local     # gera o .aab assinado (versionCode incrementado pelo EAS)
npm run play:submit   # envia o .aab mais recente de android/build-logs/
```

Para enviar um arquivo específico: `bash scripts/enviar-play.sh caminho/do/arquivo.aab`.

## Faixa e status

Definidos em `eas.json`, perfil `submit.production.android`:
- `track`: `alpha` (teste fechado, faixa "Teste fechado - Alpha"). Outras opções: `internal`, `beta` (aberto), `production`.
- `releaseStatus`: `completed` (publicada para os testadores assim que o Google aprovar). Use `draft` para revisar antes no Console.

## Segurança

O script cria `credenciais/play-service-account.json` como link para a chave; a pasta
`credenciais/` está no `.gitignore`. Nunca copie o JSON para dentro do repositório.
