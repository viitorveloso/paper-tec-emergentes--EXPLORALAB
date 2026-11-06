# Vitrine Sebrae VR

O projeto usa Unity 6.0 (6000.0.83f1), URP e XR Interaction Toolkit/OpenXR. A pasta a abrir no Unity Hub e SebraeLabVR.

## Cenas e hierarquia

A cena principal e Assets/Scenes/Sebrae.unity. MostruarioSebrae.unity contem a mesma montagem. Sebrae e a primeira cena habilitada no build.

- Mostruario/Exposicao: tres expositores principais e areas existentes de teleporte.
- Cenografia - Mostruario Sebrae: sinalizacao, vitrine de moda, pavilhao, salas, paisagismo e iluminacao.
- Salas do corredor - Exposicao: tres salas, quatro mesas, oito cadeiras e colecoes sobre bases de exposicao.
- Pavilhao externo - Vitrine Sebrae: oito stands individuais, quatro mesas de encontro e palco. O piso fica entre Z=16 e Z=42, com uma passarela de acesso ao predio.
- Paisagismo - Fachada e entrada: vasos externos; dois modelos de planta da Artec 3D ficam junto a porta principal.
- Lustre e focos - Salao principal: lustre contemporaneo de dois aros e quatro focos sobre os expositores.

Os pisos sao brancos, as paredes usam creme pastel e o teto e branco. Materiais URP em azul, madeira, branco e metal organizam a cenografia. A configuracao Performance URP habilita luzes adicionais, sem sombras adicionais em tempo real.

## Abrir e conferir

Abra a cena fora do Play. No menu SebraeLab > Mostruario, use os comandos de enquadramento das salas, pavilhao e paisagismo. O comando de conferir a cena verifica referencias, expositores e stands.

As mudancas feitas apenas durante Play nao persistem ao sair. Os scripts de editor para atualizacao automatizada so fazem a recarga quando existe um pedido local em Tools/apply-visible-layout.request, arquivo excluido do Git. A recarga preserva uma copia de alteracoes pendentes antes de abrir a cena salva.

A aparencia foi conferida em imagens renderizadas pelo proprio Unity, com as cenas carregadas fora do Play. Caches e registros locais ficam fora do repositorio. Imagens selecionadas estao em Docs/Previews.

Depois da importacao pelo Unity, execute a partir da raiz do repositorio, com Node.js 22 ou superior:

```powershell
node SebraeLabVR/Tools/validate-elegance.mjs
node SebraeLabVR/Tools/validate-exterior.mjs
```

Essas verificacoes conferem referencias dos assets, IDs, contagens e intersecoes de moveis/destinos com os limites geometricos registrados. Nao substituem o teste de navegacao e desempenho no headset. O runtime OpenXR, o modelo do aparelho e os modulos de build devem ser configurados e testados no ambiente de destino.

## Adaptar os produtos

Os itens expostos e os nomes Empreendedor 01 a 08 sao amostras cenograficas. Substitua-os pelos produtos e nomes reais mantendo as bases de apoio, portas e passagens livres. Os tampos das mesas de galeria ficam a 0,90 m. Alguns produtos ficam sobre bases acima do tampo; mantenha o apoio na superficie correta.

As colecoes baixadas incluem:

- Food Kit da Kenney, sob CC0, com malhas leves preparadas para o Unity.
- Texturas Wood051 e Fabric030 de ambientCG, sob CC0, em 1K.
- Houseplant e Decorative vase da Artec 3D, tambem publicados no Sketchfab, sob CC BY 4.0. Foram reduzidos para um total de 14000 triangulos no conjunto de modelos e texturas 1K. Ha quatro plantas e tres vasos dessas fontes na montagem.

Os creditos da Artec 3D aparecem no painel de creditos da vitrine e em Assets/Mostruario/ArtecCollection/CREDITS.md. Preserve os creditos, links e avisos de modificacao ao distribuir o projeto. Consulte ASSETS-BAIXADOS.md e as licencas nas pastas dos fornecedores.

## Regenerar a montagem

Tools/refine-showroom.mjs regenera a cenografia das duas cenas usando os modulos de salas, pavilhao, produtos, paisagismo e iluminacao. Ele sobrescreve os elementos gerados: preserve uma copia de suas adaptacoes manuais antes de executar.

Os arquivos *-layout.json e showroom-design.json registram a montagem. building-floorplan.json e a planta extraida de Sebrae Lab.fbx; a conversao de coordenadas usada e (-BlenderX, BlenderZ, -BlenderY).

Os scripts de preparacao de malhas e texturas exigem Blender quando indicado e os downloads originais em Tools/Downloads. Esses downloads e os backups locais nao sao versionados. Os assets finais, materiais, texturas e respectivos arquivos .meta estao incluidos em Assets e permitem abrir o projeto sem executar esses scripts.