# HA Pool Dashboard — Design System

## Principes

1. Mobile-first.
2. Une seule application, pas une succession de cartes.
3. Le Hero est le point focal.
4. pH et ORP utilisent des anneaux fins.
5. Conductivité, salinité et chlore libre utilisent des barres linéaires.
6. Animations discrètes, désactivées avec `prefers-reduced-motion`.

## Palette Ocean

| Token | Valeur |
|---|---|
| Primary | `#2E9FFF` |
| Water | `#12ADD7` |
| Lagoon | `#52C2EF` |
| Deep | `#0874B4` |
| Success | `#31C48D` |
| Warning | `#F6AD3C` |
| Danger | `#F05D6F` |

## Rayons

- Petit : 14 px
- Moyen : 20 px
- Grand : 28 px
- Hero : 32 px

## Espacement

Base 4 px. Valeurs principales : 8, 12, 16, 20, 24, 32.

## Typographie

La carte utilise la police du thème Home Assistant. Les valeurs importantes emploient une graisse légère ; les titres et scores une graisse forte.

## Responsive

- `< 760 px` : une colonne, appareils empilés.
- `>= 760 px` : deux appareils côte à côte.
- Hero toujours pleine largeur.
