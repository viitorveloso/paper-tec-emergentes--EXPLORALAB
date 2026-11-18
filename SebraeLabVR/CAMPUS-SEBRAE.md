# Campus Sebrae: Multicenter e anexo Sebraelab

As cenas Assets/Scenes/Sebrae.unity e MostruarioSebrae.unity contêm a raiz `Campus Sebrae - Multicenter e Sebraelab`.

- O laboratório existente (FBX Sebrae Lab) mantém posição, interior, mobiliário e XR. O acabamento verde foi aplicado por revestimentos externos; a entrada lateral foi preservada.
- O Multicenter foi modelado ao lado esquerdo do anexo, com faixa amarela, marquise diagonal, oito arcos com vãos reais, vidro escuro, pedra, letreiros, rampas, escadas, corrimãos azuis e jardim.
- A placa do SebraeLab tem corpo e painel brancos. O contorno da fotografia foi mantido em metade da escala anterior, com letreiro escuro.
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


## Revisão do exterior com a referência da rampa

As cenas **Assets/Scenes/Sebrae.unity** e **Assets/Scenes/MostruarioSebrae.unity** incluem uma ala esquerda aberta com cobertura ondulada, pilastras, treliças azuis e luminárias. A imagem ao nível da rampa orientou a curva do passeio com corrimãos duplos, a inclinação, a via e o canteiro. A vista frontal orientou os detalhes do letreiro, os caixilhos e as floreiras da arcada. As vistas aéreas forneceram a implantação geral das coberturas e das vagas.

O lado esquerdo usa a perspectiva da rampa e a foto Sebrae2.jpg como referência. A profundidade da ala, a divisão dos vãos, a posição dos fechamentos recuados e as dimensões gerais são estimativas. A cena representa a implantação permanente observada nas fotos, com o pavilhão e a exposição Sebraelab preparados para a visita.

O menu **SebraeLab > Campus > Mostrar acesso coberto** enquadra a rampa. **Capturar imagens no Unity** grava os ângulos externos. As prévias em Docs/Previews com nomes iniciados por multicenter-exterior foram renderizadas a partir das malhas salvas para revisão geométrica.

As superfícies usam materiais URP e mapas de relevo. Os novos destinos de teleporte são registrados pela navegação já usada no pavilhão. O script Tools/revise-multicenter-exterior.mjs regenera apenas esta revisão nas cenas atuais. Com `--check` ele confere as malhas e as referências salvas. Com `--preview` ele também exporta as prévias geométricas. Abrir as cenas no Unity dispensa executar o script.

A cena principal e a colisão da rampa foram abertas e conferidas no Unity 6000.0.83f1. As capturas do editor estão em Docs/Previews. Nesta máquina, o caminho curto C:\UnityProjects\Multicenter-Exterior aponta para a mesma pasta do projeto e evita o limite de caminhos na importação do Windows.

### Acesso pela avenida e bloco Sebrae

As novas referências mostram dois pórticos brancos com grafismos coloridos, uma guarita envidraçada e uma portaria lateral em pastilha laranja. Essas estruturas foram implantadas como acessos complementares, com ilhas, cancelas, rede aérea e vagas. O bloco branco e azul entra sob a cobertura oeste. A posição relativa das portarias, o relevo e as dimensões foram estimados a partir das fotografias. O menu **SebraeLab > Campus > Mostrar portaria e porticos** abre a vista pela avenida.

A fotografia próxima da entrada orientou a revisão dos dois vãos. O pórtico esquerdo tem um pilar externo elevado e um retorno que encontra a guarita. O pórtico direito parte da cobertura da guarita em ângulo. Os letreiros principais têm relevo, as ilhas têm extremidades arredondadas e o vidro da guarita usa um cubemap local gravado pelo Unity. A distância e o ângulo entre as estruturas permanecem estimados a partir das perspectivas disponíveis.

### Cobertura e pátio de serviço pela vista aérea

A nova fotografia aérea orientou os seis tramos arqueados na ala oeste, os três tramos no pavilhão principal, o volume posterior com cobertura azul e a implantação do pátio de carga junto à lateral. Os veículos são modelos genéricos estacionados. As dimensões, a divisão das docas e a implantação posterior são estimativas. O comando **SebraeLab > Campus > Mostrar cobertura e patio de servico** enquadra o conjunto. A colisão da pista lateral foi conferida no Unity 6000.0.83f1.

### Escadaria vista na referência do Google Maps

A vista aérea vinculada mostrou a escadaria azul entre a área de estacionamento e a via interna. A cena inclui três lances, patamares, faixas amarelas, corrimãos, ligação à travessia e dois destinos de teleporte. A largura, o desnível e a inclinação do talude são estimativas. A colisão de um degrau foi testada no Unity. [Referência do Google Maps](https://maps.app.goo.gl/Yyeh2LUsmmmqGSUW9)

### Correção da implantação frontal

As novas vistas do Google Maps mostram a ala branca e azul voltada para a rua, alinhada transversalmente com a fachada do Multicenter e avançada sob uma cobertura larga. A reconstrução ampliou essa ala, refez a frente do bloco Sebrae, o passeio com palmeiras e a curva da via. O pátio de serviço acompanhou a nova borda oeste. A largura da ala e os afastamentos são estimativas. A colisão da pista frontal e da via de serviço foi conferida no Unity 6000.0.83f1.


### Estacionamento principal e curva leste

A avenida e os pórticos ficam na borda sul do estacionamento. Cinco fileiras duplas de vagas e a fileira junto à entrada se organizam em torno do eixo central, com sinalização amarela, vagas acessíveis, marcas PARE, postes e remendos no asfalto. A ligação com a escadaria azul atravessa o talude. O acesso leste contorna o Sebraelab, com ilha gramada, recuo de estacionamento, passeio e rede aérea.

As distâncias, os desníveis e os volumes residenciais do outro lado da avenida foram estimados pelas imagens. Use **SebraeLab > Campus > Mostrar estacionamento principal** ou **Mostrar curva ao lado do Sebraelab** para conferir os novos trechos. A validação do editor verifica o piso do estacionamento, a ligação de pedestres, a pista leste e o passeio.
