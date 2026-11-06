# Mostruário VR do Sebrae

A cena `Assets/Scenes/MostruarioSebrae.unity` reúne o espaço do Sebrae com três estações de exposição: 3 mesas, 6 cadeiras e 12 objetos de exemplo. Ela é a primeira cena habilitada no build.

Cada estação fica em `Mostruario > Exposicao` e contém `Mesa`, `Cadeiras` e `Produtos`. Os objetos ficam fixos nesta primeira montagem. As amostras incluem canecas, jarra, plantas, livros, porta-lápis e projetor; podem ser substituídas pelos produtos dos empreendedores.

## Abrir e adaptar

1. Abra o projeto no Unity **6000.0.83f1**, com uma licença ativa no Unity Hub.
2. Abra `Assets/Scenes/MostruarioSebrae.unity`, ou use **SebraeLab > Mostruário > Abrir cena**.
3. Use **SebraeLab > Mostruário > Conferir cena aberta** para conferir as referências importadas.
4. Entre em Play e confira a aparência, o piso, as colisões e os controles. Depois teste no aparelho real.

Para mudar uma exposição, edite os filhos de `Produtos`. O tampo está a aproximadamente **0,90 m** do piso. As amostras foram apoiadas usando os limites de seus colliders. Para um novo modelo, ajuste sua escala e a altura até a base encostar no tampo; inclua um collider adequado. Para reorganizar uma estação inteira, mova o grupo da estação. Reposicione também as áreas de `Circulacao VR` para manter os destinos de teleporte livres de móveis.

Os prefabs da montagem estão em `Assets/Mostruario/Prefabs`, com materiais URP próprios em `Assets/Mostruario/Materials`. Eles usam as malhas e texturas do Office Essentials Pack já presente no projeto. Os modelos Kenney recém-copiados em `Assets/Models/FBX format` também estão disponíveis para substituições depois da importação pelo Unity.

Ao iniciar, `MostruarioEnvironment` prepara os colliders do prédio, adapta os materiais antigos do FBX para URP e ativa as cinco áreas de teleporte na camada `Teleport` dos Starter Assets. Também desativa as câmeras de modelagem e as cópias de objetos que o FBX contém fora do espaço principal. A cena `Sebrae.unity` e os assets originais foram preservados.

## Óculos e conta

A conta solicitada para vincular o aparelho é **kassio.undb@gmail.com**. A vinculação ainda não foi realizada: os óculos não estavam disponíveis, o modelo não foi identificado e não houve acesso à conta. O procedimento depende do fabricante e precisa ser concluído com o aparelho em mãos. Nenhuma senha foi armazenada e nenhum login foi incluído no aplicativo.

O projeto já contém OpenXR e o XR Origin com controles de VR. Isso não substitui a configuração e o teste do modelo específico. O editor 6000.0.83f1 instalado neste computador contém apenas o módulo Windows; se o aparelho exigir um APK Android, será preciso instalar o módulo Android correspondente antes de gerar esse build.

## Verificação desta montagem

- Código C# compilado contra as bibliotecas instaladas do Unity e XR Interaction Toolkit.
- Referências dos arquivos, posições de apoio e limites dos móveis conferidos por análise dos arquivos.
- A abertura automatizada do Unity foi bloqueada por **“No valid Unity Editor license found”**. Portanto, a importação final, a aparência, a execução em Play e o comportamento de VR ainda precisam ser verificados no editor com licença e no aparelho.

`Tools/prepare-mostruario.mjs` permite recriar os arquivos desta montagem com Node.js. Ele sobrescreve a cena e as cópias geradas; salve adaptações manuais em outra cena antes de executá-lo. `Tools/mostruario-layout.json` registra as posições e medidas usadas na montagem.
