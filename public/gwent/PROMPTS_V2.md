# v2 美术生成提示词

## 自由组牌新增角色（2026-09-11）

Three independent built-in imagegen calls, using the approved `peroxide-v2.png` academy portrait as a style reference. The following records the prompt specifications: single finished portrait illustration, 3:4, one confident teen-adventure character filling the scene; crisp ink and refined cel-shaded painterly finish; teal shadows, ivory sunlight, warm brass details in an old chemistry academy. Distinct readable silhouette; no toddler proportions, giant baby eyes, readable text, formulae, numbers, card border or UI.

- `mentor-v2`: anthropomorphic brass balance professor with spectacles, teal academic coat and an open book; composed, experienced expression, laboratory academy setting.
- `witness-v2`: magnifying-glass guardian with an ivory cape and a shield bearing a simple check emblem; observant and confident, protecting experimental evidence.
- `spy-v2`: envelope-faced visiting scholar/courier with a teal hood, goggles and satchel carrying two blank cards; clever rather than sinister, dynamic academy adventure pose.

Original PNG files and corresponding WebP delivery files are preserved in this directory. Tactical card emblems are SVG interface artwork in `GwentCardFace.tsx`, not generated chemical-substance portraits. Role cards represent game rules, not chemical substances.

执行方式：内置 imagegen，独立调用生成六项资源，原图保留。参考图为用户认可的三张角色卡概念图：`exec-4019edbe-d5ec-4478-a71a-475b6994c136.png`。

## 三张独立立绘（同一模板，分别调用）

Single finished collectible game card ILLUSTRATION ONLY. Recreate the SUBJECT from the reference exactly in identity, expression, confident teen-adventure demeanor and refined ink/cel-shaded painterly quality. Reference is identity/style source. Show this ONE character alone in a richly painted sunlit old chemistry academy, teal shadows ivory light warm brass details, shelves and arched windows; no readable writing anywhere. Portrait 3:4 image, frame-filling character occupying 85% height, full body, strong expressive pose, no childish big eyes. NO card border, NO nameplate, NO words, NO chemical formula, NO UI, NO numbers. Clear colorless glass/liquid. The output is a high quality stand-alone portrait for the card's illustration window.

SUBJECT:
- acid-v2: left clear droplet scout holding a dropper with teal scarf.
- peroxide-v2: middle clear round flask explorer with goggles and satchel.
- limewater-v2: right tall clear test tube detective with magnifier and sage cape.

## 七张补齐立绘（2026-09-10）

Each asset was generated separately using `characters-v1.png` for identity and `peroxide-v2.png` for the approved scene rendering. Shared instructions: one full-body figure, portrait 3:4, fills 85% height; confident teen-adventure expression, crisp ink/cel-shaded painterly finish, warm ivory sunlight / teal shadows / brass academy setting. No toddler proportions, labels, numbers, formulae, card frame or UI. Background subordinate, silhouette readable at thumbnail size.

- carbonate-v2: atlas top-left white opaque limestone rock guardian, blocky chalk-white body and fists, teal cape, brass clasp. Geology courtyard. Not transparent or crystalline.
- catalyst-v2: atlas top-right black granular manganese dioxide mineral tactician, bronze monocle, teal cape, calculating expression. Mineral workshop. Opaque matte black grains, not silver armor.
- splint-v2: atlas bottom-left tall wood-grain splint ranger, teal cloak, brown belt. Charred top with tiny dull red ember; no open flame on character (before oxygen testing).
- copper-v2: atlas bottom-second reddish copper wire coil engineer, wrench, teal cape, brown tool belt. Academy workshop. Recognizable coil silhouette, red-orange copper rather than gold or grey.
- iron-v2: atlas bottom-third grey iron nail sentinel, distinctive flat nail head, teal scarf and round shield. Stone arcade. Grey metal, not copper.
- nitrogen-v2: atlas bottom-fourth transparent colorless air aviator, brass goggles, ivory scarf and clear pale air swirls. Open-air observatory. Artistic air spirit, not colored gas, smoke or a bottle.
- silica-v2: atlas bottom-right sharp angular transparent/white quartz crystal sage, crystal staff and teal cape. Mineral gallery. Faceted geometric silhouette, not rounded glass or a rock monster.

## card-frame-v2

Generate a production UI asset: a SINGLE empty collectible card frame matching reference's enamel dark teal and fine warm brass edge, sophisticated hand-painted adventure game quality. Portrait 2:3 aspect ratio. The card fills entire image almost edge to edge. Outer rounded rectangular teal enamel border with subtle highlights and brass carved corner fittings. Large entirely TRANSPARENT illustration window x=7% to93%, y=5% to76%, no scenery in that window. Bottom ivory parchment nameplate y=77% to96% remains opaque, EMPTY for live text. No text, no numbers, no score medallion, no characters. Outside card transparent. Reference is style not edit target. Front-facing flat orthographic UI artwork, no tilt, no cast shadow outside. Fine crisp details readable at 150px wide. Real alpha transparency in illustration window and outside.

## life-orb-v2

Single production game UI life token, centered circular luminous emerald glass orb in an exquisitely crafted brass and deep teal enamel socket, face-on view. Chemistry adventure collectible game for teens, clean cel-shaded painterly illustrated finish, premium delicate bevels and restrained warm gold filigree. Round orb, not diamond, not heart. Inner liquid green light with tiny subtle bubbles, calm luminous core, three dimensional glass highlight. Entire token occupies 90% of square image. True transparent background outside the circular metal socket. No lettering, no numbers, no text, no other items. Must be recognizable at 40px. Dark green/gold/ivory palette, not neon sci-fi.

## table-v2

A production background texture for a premium chemistry adventure card-game BOARD matching the reference's painterly teenage academy style. Landscape 3:2. Strict overhead straight-on view of an empty dark teal green velvet playing mat set into an aged walnut laboratory desk with thin engraved brass rails along the outermost edges. The central 85% is quiet dark desaturated green fine felt texture for overlaying playable cards, subtly illuminated center, no bright focal objects. Edge-only tiny engraved botanical alchemical scrollwork and fine ivory/bronze inlay, understated hand-painted detail, warm lantern light from upper left, rich refined materials. No cards, no UI, no words, no labels, no character, no bottles, no glyphs, no diagrams, no symbols in center. Seamless quiet card placement area. Sharp polished game art, no photorealism, no mockup screenshot.
