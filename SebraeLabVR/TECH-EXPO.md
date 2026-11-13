# Exposição Tech no Sebraelab

As cenas Sebrae.unity e MostruarioSebrae.unity contêm Exposicao Tech - Sebraelab, com três mesas existentes e um balcão na antiga ilha de moda.

1. Computação e IA: monitor, teclado, mouse e workstation com portas, ventilação e indicador de energia.
2. Criação digital: estação de trabalho e notebook, com tela de demonstração.
3. Experiências imersivas: headset, controles e o projetor existente.
4. Prototipagem: impressora 3D e drone com hélices, motores e trem de pouso.

Os modelos locais de computador, teclado, mouse e notebook foram convertidos de OBJ para malhas nativas Unity. Fonte: https://kenney.nl/assets/furniture-kit — CC0. Não foi necessário baixar outro pacote. Os modelos originais são estilizados; materiais e detalhes melhoram a apresentação, sem representar escaneamentos fotorealistas. O projetor foi reutilizado do pacote existente.

As telas são interfaces cenográficas estáticas. Os aparelhos não têm funcionalidades simuladas ou interação implementada nesta etapa. A configuração XR existente foi preservada. As amostras genéricas das três mesas e a ilha de moda foram desativadas; salas menores e pavilhão continuam como antes. A fachada foi preservada.

No Unity: SebraeLab > Exposicao Tech > Mostrar sala. Para uma imagem real do editor: Capturar imagem. Resultado: Docs/Previews/tech-expo-unity.png.

Verificação: node SebraeLabVR/Tools/validate-tech-expo.mjs. Conferidos buffers, apoios dos conjuntos importados, IDs, referências locais, presença das texturas e preservação da fachada. A verificação original validate-elegance.mjs também passou. Cópias das cenas anteriores em Tools/TechBackup.

A importação, a aparência, colisões e desempenho no Unity/headset ainda precisam ser conferidos; o Unity não está disponível neste ambiente.

O gerador install-tech-expo.mjs atualiza somente a faixa de IDs 2400000000. Outros geradores que restauram backups antigos podem remover alterações posteriores: preserve as cenas antes de executá-los e reaplique a exposição quando necessário.
## Revisão com a foto aérea

A foto JFIF mostra a cobertura externa do Multicenter, não o teto interno do anexo verde. Foi acrescentada uma cobertura metálica branca ondulada em Assets/MulticenterRoof, sem alterar o teto interno do laboratório. Dimensões e curvatura adaptadas; parâmetros em Tools/roof-layout.json. Cópias anteriores em Tools/RoofBackup.

Na exposição, o gabinete da estação de criação foi posicionado sob a mesa para liberar o notebook. Foram acrescentados módulo de sensores/IoT, roteador com antenas e mousepads. As prévias tech-exposicao-previa.png e tech-prototipagem-previa.png foram renderizadas por software usando os objetos gerados e uma reconstrução simplificada das mesas/paredes para contexto. Não são capturas do Unity nem reproduzem todo o mobiliário original. A captura real continua disponível no menu de editor.
