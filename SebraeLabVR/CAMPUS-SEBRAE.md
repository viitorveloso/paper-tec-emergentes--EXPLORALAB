# Campus Sebrae: Multicenter e anexo Sebraelab

As cenas Assets/Scenes/Sebrae.unity e MostruarioSebrae.unity contêm a raiz `Campus Sebrae - Multicenter e Sebraelab`.

- O laboratório existente (FBX Sebrae Lab) mantém posição, interior, mobiliário e XR. O acabamento verde foi aplicado por revestimentos externos; a entrada lateral foi preservada.
- O Multicenter foi modelado ao lado esquerdo do anexo, com faixa amarela, marquise diagonal, oito arcos com vãos reais, vidro escuro, pedra, letreiros, rampas, escadas, corrimãos azuis e jardim.
- A placa do Sebraelab usa contornos traçados da fotografia, peças brancas com espessura, painel preto com mapeamento projetivo da referência e letras com relevo de 45 mm. A parte inferior cortada na foto precisou ser completada.
- Foram usadas as três fotografias enviadas em 13/11/2026. Não são um levantamento dimensional: escala, laterais e partes ocultas foram estimadas. O usuário autorizou dimensões adaptadas para um prédio grande: o volume principal tem aproximadamente 78 m de largura, 43 m de profundidade e 8,5 m de altura. Esses valores são de projeto, não medidas do prédio real. A fachada do anexo foi elevada a 4,8 m com revestimento externo, sem alterar o interior e sua entrada. A reprodução não deve ser tratada como 100% fiel ou fotogrametria.

## Conferir no Unity

Abra SebraeLabVR no Unity 6000.0.83f1 e a cena Assets/Scenes/Sebrae.unity. Use **SebraeLab > Campus > Mostrar Multicenter e Sebraelab** ou **Mostrar anexo verde e placa**.

O comando **Capturar imagens no Unity** grava campus-unity.png e sebraelab-unity.png em Docs/Previews. Essas capturas só existirão depois da execução no editor.

As prévias campus-geometria.png e sebraelab-geometria.png foram rasterizadas por software a partir das mesmas malhas geradas; não são capturas do Unity e mostram apenas a nova geometria externa. O interior original não é incluído nesse renderizador de revisão.

## Verificação realizada

Buffers, índices, limites das malhas, referências locais e preservação dos documentos originais das duas cenas foram verificados por Tools/review-campus.mjs. A verificação geométrica original Tools/validate-elegance.mjs também passou. A importação e a aparência no Unity, colisões/navegação e desempenho no headset ainda precisam de conferência no editor/aparelho; o Unity não está instalado/em execução neste ambiente.

## Arquivos

- Assets/CampusSebrae: materiais URP, texturas, malhas nativas e comandos de editor.
- Tools/campus-layout.json: posicionamento, materiais e contagens.
- Tools/CampusBackup: cópias das duas cenas anteriores à alteração.
- Tools/rebuild-campus.mjs: gera a geometria e monta as cenas a partir dos backups iniciais. Ao executar novamente, substitui as cenas: preserve edições posteriores antes de usá-lo.
- Tools/make-campus-labels.ps1: rasteriza os letreiros usando Arial do Windows.
- Tools/review-campus.mjs: valida os arquivos e gera as prévias de geometria.

A partir da raiz do repositório: `node SebraeLabVR/Tools/review-campus.mjs`. Não há dependências npm. Execute a geração dos letreiros após regenerar a modelagem. Não é necessário executar os geradores para abrir a cena pronta.
## Revisão das referências

A marquise agora tem o retorno inclinado à direita da ponta, como na fotografia. A via foi construída como faixa curva, e as escadas ficam ao lado da arcada. Tools/sebraelab-reference-trace.json registra os contornos e o mapeamento da placa. A textura PlacaReferencia.png é uma conversão sem recorte da fotografia fornecida pelo usuário; as peças 3D selecionam somente as partes da placa por coordenadas UV. O relevo das letras é derivado dos pixels claros do letreiro.

As prévias multicenter-fachada.png e sebraelab-placa-detalhe.png mostram a nova fachada e a placa em maior detalhe. A revisão anterior está preservada em Tools/CampusBackup/BeforeReference-*.bak.

## Referência frontal IMG_9627.jpeg

A nova foto frontal substitui a aproximação do desenho principal da marquise: o contorno inferior agora é curvo, e a ponta achatada fica quase abaixo do centro do letreiro. Foi acrescentada a base branca trapezoidal. A faixa amarela frontal usa a fotografia por mapeamento UV projetivo; letras e peças coloridas do nome possuem relevo em geometria. Os dados estão em Tools/multicenter-front-trace.json. A imagem original foi preservada em Docs/CampusReferences.

O último arco ficou aberto, conforme a nova fotografia. A rua externa ganhou faixa de pedestres, setas, vagas pintadas e passeio frontal. A rampa foi organizada em dois lances à esquerda para não encobrir o pedestal. As dimensões gerais continuam adaptadas com autorização do usuário. As marcações são cenografia, sem validação normativa.

O nome Pedro Neiva de Santana, parcialmente visível na foto, foi confirmado na [Agência Sebrae de Notícias](https://ma.agenciasebrae.com.br/arquivo/decreto-estadual-confirma-hospital-de-campanha-em-sao-luis/).

A imagem Docs/Previews/multicenter-frontal.png é uma revisão da nova geometria por software, não uma captura do Unity. Para gerar a captura no editor, use SebraeLab > Campus > Capturar imagens no Unity. A versão anterior a esta foto está em Tools/CampusBackup/BeforeFrontPhoto-*.bak.
