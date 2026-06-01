# Progresso do Projeto

## Rotina de encerramento

Ao encerrar uma rodada de trabalho, registrar neste arquivo:

- o que foi feito;
- decisoes importantes;
- pendencias ou riscos;
- proximos passos sugeridos;
- status de sincronizacao e publicacao, quando houver.

## 2026-06-01

### Feito

- Ajustamos o visual geral do simulador para um mood mais escuro, esportivo e sofisticado.
- Melhoramos a responsividade e reorganizamos o mata-mata para evitar colunas estreitas e desbalanceadas.
- Mantivemos dias, horarios e locais dos jogos como premissa central do simulador.
- Inserimos o logo no topo esquerdo e usamos o mesmo elemento como favicon.
- Ajustamos o texto do card `32 classificados` para nao encostar na borda.
- Corrigimos as bandeiras de Escocia e Inglaterra.
- Incluimos a posicao das selecoes no ranking FIFA na lista inicial e na tabela ao vivo.
- Refinamos o ranking FIFA para ficar mais discreto, em parenteses, com fonte menor e cor mais suave.
- Confirmamos que o site esta publicado no GitHub Pages.
- Sincronizamos a copia local com `origin/main` e confirmamos `working tree clean`.

### Decisoes

- O repositorio precisa continuar publico enquanto o plano GitHub Free for usado para GitHub Pages.
- A branch de publicacao do Pages fica em `gh-pages`.
- O ranking FIFA deve ser informacao secundaria: o nome da selecao continua sendo a informacao principal.
- Ao encerrar futuras sessoes, atualizar este arquivo automaticamente como parte da rotina.

### Pendencias

- Revisar em outro momento se vale mover a logica de ranking FIFA para dentro do React, em vez de manter o ajuste no `index.html`.
- Fazer uma revisao visual final em mobile quando houver tempo.

### Proximos passos sugeridos

- Revisar o fluxo do mata-mata com cenarios reais de simulacao.
- Testar a experiencia completa em celular.
- Avaliar se a area de horarios pode ganhar filtros por cidade, selecao ou data.
