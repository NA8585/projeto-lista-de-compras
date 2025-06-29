# Plano de Ação para ListaVox

Este documento reúne melhorias e correções identificadas durante a análise estática e os testes manuais do aplicativo.

## Pendências

1. **README corrompido e licença ausente**
   - Remover o prompt de shell acidental do `README.md` e garantir a quebra de linha final.
   - Adicionar o arquivo `LICENSE` (MIT) referenciado no README.
2. **`useFrameworkReady` executando repetidamente**
   - Incluir array de dependências vazio no `useEffect` para rodar apenas uma vez.
3. **`VoiceService.stopListening` não cancela simulação**
   - Armazenar o `timeout` de `simulateSpeechRecognition` e cancelá-lo em `stopListening`.
4. **Constante `VOICE_USAGE` sem uso**
   - Remover ou implementar lógica relacionada ao rastreamento de uso de voz.
5. **Ausência de `.gitignore`**
   - Criar `.gitignore` apropriado para projetos React Native/Expo.
6. **Resultado da câmera não persiste**
   - Salvar o preço escaneado no item e atualizar a lista antes de voltar à tela anterior.
7. **Título da lista não é editável**
   - Adicionar `TextInput` no detalhe da lista e salvar alterações em `StorageService`.
8. **README mistura instruções de Flutter**
   - Separar ou remover a seção de migração para Flutter para evitar confusão.
9. **Excluir lista não funciona**
   - Corrigir o ícone de exclusão na tela de listas e permitir selecionar várias listas para remover de uma vez.
10. **Preço aceita apenas valores inteiros**
    - Ajustar entrada de preço para permitir centavos (ex.: `10,50`).
11. **Unidades de medida incompletas**
    - Revisar `ParserService.UNITS` e incluir unidades faltantes.
12. **Botão "Salvar Lista" não direciona à lista criada**
    - Após salvar a lista, redirecionar automaticamente para a tela inicial mostrando o total estimado da nova lista.

Essas tarefas devem ser priorizadas conforme a evolução do projeto.
