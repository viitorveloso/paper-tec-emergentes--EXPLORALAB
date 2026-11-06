# Assets baixados e aplicados na Vitrine Sebrae

Data: 06/11/2026.

- Kenney Food Kit 2.0: https://kenney.nl/assets/food-kit - CC0. O pacote foi baixado pelo endpoint de download atual do autor. Doze modelos foram preparados como malhas nativas Unity, preservando UVs e normais, com material URP e paleta original. Licenca em Assets/Mostruario/FoodKit/License.txt. Fontes FBX no arquivo original em Tools/Downloads/kenney_food-kit.zip.
- ambientCG Wood051: https://ambientcg.com/view?id=Wood051 - CC0. Mapas Color e NormalGL em 1K aplicados em tampos, apoios e superficies de madeira.
- ambientCG Fabric030: https://ambientcg.com/view?id=Fabric030 - CC0. Mapas Color e NormalGL em 1K aplicados nos tapetes, com tonalidade azul.

Foram distribuidas 24 instancias dos novos produtos nas duas cenas: seis no stand de sabores, tres no stand de negocios locais, sete nas salas e oito xicaras nas mesas de encontro. Os nomes e objetos sao amostras cenograficas para substituicao pelos produtos reais.

Sinalizacao: os TextMesh gerados usavam um material interno legado. Ele foi substituido por SebraeSignText.mat, com o shader Sebrae/SignTextURP. SebraeSignMaterials prepara o atlas dinamico da fonte tanto no editor quanto no Play. Essa incompatibilidade era uma possivel causa das placas rosas mencionadas; o resultado visual precisa ser confirmado no Unity. Nenhuma bandeira rosa foi criada intencionalmente na cenografia.

Validacao: controlador C# compilado com as bibliotecas do Unity instalado; 12 malhas (2024 triangulos no conjunto de modelos), indices e dados de vertices conferidos; 24 novos produtos por cena; referencias de materiais e assets validas; IDs unicos; areas de teleporte livres dos volumes cenograficos verificados. O shader precisa terminar a importacao/compilacao no editor para confirmacao visual.

Saia do Play, use Assets > Refresh e reabra Assets/Scenes/Sebrae.unity para carregar os novos objetos e materiais. O pavilhao, as salas e os stands anteriores foram mantidos. Tools/refine-showroom.mjs preserva a aplicacao desses acabamentos e o material de texto corrigido nas regeneracoes. Tools/prepare-food-assets.mjs prepara as malhas a partir dos dados extraidos por Tools/bake-food-meshes.py.