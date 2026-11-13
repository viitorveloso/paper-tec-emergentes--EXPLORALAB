# Interior do Multicenter

As cenas Assets/Scenes/Sebrae.unity e MostruarioSebrae.unity agora contêm Interior Multicenter - Pavilhao de eventos.

A adaptação usa as seis fotos enviadas pelo usuário: pé-direito alto, telhas onduladas aparentes, pilares/treliças azuis, luminárias industriais suspensas, piso de pedra, faixas escuras de circulação, janelas altas, portal de treliça, stands brancos e azuis, palco e cadeiras brancas. As referências foram preservadas em Docs/PavilionReferences.

## Montagem

- Oito stands em dois conjuntos de quatro, abertos para o corredor central, com balcões, mesas e 16 cadeiras de reunião.
- Plateia com 240 cadeiras em dois blocos de 120, corredor central e palco com púlpito, fundo e duas telas laterais.
- Nove pilares, treliças aparentes e 12 luminárias industriais. As luzes não projetam sombras adicionais em tempo real.
- Forro baixo provisório retirado do modelo principal, deixando a cobertura visível por dentro.
- Entrada de 3 m aberta no antigo painel de vidro. Foram mantidas as demais partes da fachada.
- Seis destinos de teleporte integrados ao mesmo XR Interaction Manager e Teleportation Provider do projeto. A navegação mantém a camada Teleport existente.
- A exposição tech no prédio verde, as salas menores e o pavilhão externo anterior foram preservados.

As fotos mostram montagens diferentes de eventos. A cena combina feira e apresentações em dois setores; dimensões, lotação e disposição são adaptações cenográficas, não uma reprodução dimensional ou um projeto executivo. Os equipamentos e os painéis são cenografia estática.

## Abrir no Unity

Use SebraeLab > Multicenter > Mostrar stands internos ou Mostrar plateia e palco. O comando Capturar interior no Unity gera multicenter-stands-unity.png e multicenter-plateia-unity.png em Docs/Previews.

As imagens multicenter-interior-stands.png e multicenter-interior-plateia.png foram renderizadas por software, com iluminação aproximada; não são capturas do Unity e não incluem a renderização dos textos dinâmicos. A aparência, importação, iluminação, uso no headset e desempenho ainda precisam de conferência no Unity, indisponível neste ambiente.

## Verificações

- validate-pavilion-interior.mjs: contagens, orientação dos stands, malhas, IDs, referências, remoção do forro e dois percursos livres considerando raio de 0,35 m.
- validate-all-geometry.mjs: buffers e índices das malhas do campus, cobertura, pavilhão e tech; presença dos destinos de navegação e dos dois interiores nas cenas.
- validate-tech-expo.mjs, validate-campus-reference.mjs e validate-elegance.mjs também passaram.

Os percursos são verificações geométricas de amostra; não equivalem a uma validação de acessibilidade, lotação ou segurança de eventos.

## Regeneração e cópias

Tools/PavilionBackup preserva as cenas e os assets do forro/vidro anteriores. install-pavilion-interior.mjs atualiza a faixa de IDs 2600000000 e modifica somente as malhas do forro provisório e do painel de vidro bloqueador da entrada. A cobertura branca externa foi mantida.

Outros geradores podem restaurar cenas antigas. Preserve suas edições antes de executá-los. Para regenerar tudo a partir dos backups originais, a ordem é: rebuild-campus.mjs, make-campus-labels.ps1, install-multicenter-roof.mjs, install-tech-expo.mjs e install-pavilion-interior.mjs. O gerador do campus foi ajustado para não recolocar o forro baixo.