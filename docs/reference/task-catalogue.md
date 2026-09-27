---
title: Task catalogue
description: All 105 task types in the registry, by grade.
order: 2
---

Generated from the task registry (`allTaskDefinitions` in `src/server/domain/task-system/tasks/`).
The description column is the German label each definition carries in the code. The input
column is the input type of a generated task; `text` covers the free text field as well as the
number pad.

A run for grade *n* draws from grade *n* and grade *n − 1*.

| Grade | Task types |
| --- | --- |
| 1 | 17 |
| 2 | 26 |
| 3 | 23 |
| 4 | 24 |
| 5 | 15 |
| **Total** | **105** |

## Grade 1

| Type id | Category | Description | Input |
| --- | --- | --- | --- |
| `arithmetic-add-10` | arithmetic | Addition bis 10 | text |
| `arithmetic-add-20` | arithmetic | Addition bis 20 | text |
| `arithmetic-sub-10` | arithmetic | Subtraktion bis 10 | text |
| `arithmetic-sub-20` | arithmetic | Subtraktion bis 20 | text |
| `arithmetic-complement-10` | arithmetic | Ergänzungsaufgaben bis 10 | text |
| `geometry-count` | geometry | Formen zählen | text |
| `number-sequence-simple` | number-sense | Einfache Zahlenreihen | text |
| `number-compare-simple` | number-sense | Größer/Kleiner Vergleiche | multiple-choice |
| `number-neighbors-after` | number-sense | Nachbarzahlen (danach) | text |
| `number-neighbors-before` | number-sense | Nachbarzahlen (davor) | text |
| `money-add-simple` | measurement | Geld addieren (einfach) | text |
| `visual-count-circles` | number-sense | Kreise zählen | text |
| `visual-count-squares` | number-sense | Quadrate zählen | text |
| `visual-count-triangles` | number-sense | Dreiecke zählen | text |
| `visual-count-mixed` | number-sense | Gemischte Formen zählen | text |
| `mc-addition` | arithmetic | Multiple-Choice Addition | multiple-choice |
| `dd-order-numbers` | number-sense | Zahlen ordnen (Drag & Drop) | drag-drop |

## Grade 2

| Type id | Category | Description | Input |
| --- | --- | --- | --- |
| `arithmetic-add-tens-100` | arithmetic | Addition Zehner bis 100 | text |
| `arithmetic-add-100` | arithmetic | Addition bis 100 | text |
| `arithmetic-sub-tens-100` | arithmetic | Subtraktion Zehner bis 100 | text |
| `arithmetic-sub-100` | arithmetic | Subtraktion bis 100 | text |
| `arithmetic-mult-2-5-10` | arithmetic | Einmaleins 2, 5, 10 | text |
| `arithmetic-mult-small` | arithmetic | Kleines Einmaleins (2-5) | text |
| `arithmetic-double` | arithmetic | Verdoppeln | text |
| `arithmetic-swap` | arithmetic | Tauschaufgaben | text |
| `arithmetic-reverse-add` | arithmetic | Umkehraufgaben Addition | text |
| `arithmetic-reverse-sub` | arithmetic | Umkehraufgaben Subtraktion | text |
| `number-sequence-medium` | number-sense | Zahlenreihen bis 100 | text |
| `number-compare-medium` | number-sense | Vergleiche bis 100 | multiple-choice |
| `money-add-cents` | measurement | Geld addieren mit Cent | text |
| `money-change` | measurement | Wechselgeld berechnen | text |
| `length-cm-to-mm` | measurement | Zentimeter in Millimeter | text |
| `length-mm-to-cm` | measurement | Millimeter in Zentimeter | text |
| `length-m-to-cm` | measurement | Meter in Zentimeter | text |
| `length-cm-to-m` | measurement | Zentimeter in Meter | text |
| `mc-unit-conversion` | measurement | Einheit bei Umrechnung wählen | multiple-choice |
| `mc-unit-category` | measurement | Richtige Einheitenkategorie wählen | multiple-choice |
| `time-clock-full` | measurement | Volle Stunde lesen | text |
| `time-clock-half` | measurement | Halbe Stunde lesen | text |
| `time-clock-quarter` | measurement | Viertelstunde lesen | text |
| `time-clock-any` | measurement | Beliebige Uhrzeit lesen | text |
| `mc-multiplication` | arithmetic | Multiple-Choice Multiplikation | multiple-choice |
| `dd-match-operations` | arithmetic | Rechnungen zuordnen (Drag & Drop) | drag-drop |

## Grade 3

| Type id | Category | Description | Input |
| --- | --- | --- | --- |
| `arithmetic-mult-full` | arithmetic | Großes Einmaleins | text |
| `arithmetic-div-basic` | arithmetic | Division Grundlagen | text |
| `arithmetic-add-over-100` | arithmetic | Addition dreistellig | text |
| `arithmetic-sub-over-100` | arithmetic | Subtraktion dreistellig | text |
| `arithmetic-div-remainder` | arithmetic | Division mit Rest | text |
| `word-simple-add` | word-problem | Einfache Textaufgabe Addition | text |
| `word-simple-sub` | word-problem | Einfache Textaufgabe Subtraktion | text |
| `word-simple-mult` | word-problem | Einfache Textaufgabe Multiplikation | text |
| `word-simple-div` | word-problem | Einfache Textaufgabe Division | text |
| `length-km-to-m` | measurement | Kilometer in Meter | text |
| `length-m-to-km` | measurement | Meter in Kilometer | text |
| `weight-kg-to-g` | measurement | Kilogramm in Gramm | text |
| `weight-g-to-kg` | measurement | Gramm in Kilogramm | text |
| `weight-add-g` | measurement | Gramm addieren | text |
| `volume-l-to-ml` | measurement | Liter in Milliliter | text |
| `volume-ml-to-l` | measurement | Milliliter in Liter | text |
| `dozen-to-pieces` | measurement | Dutzend in Stück | text |
| `pieces-to-dozen` | measurement | Stück in Dutzend | text |
| `mc-unit-advanced` | measurement | Erweiterte Einheitenwahl (ha, a, t) | multiple-choice |
| `visual-symmetry` | geometry | Symmetrie erkennen | multiple-choice |
| `time-span-simple` | measurement | Einfache Zeitspanne (volle Stunden) | text |
| `time-span-minutes` | measurement | Zeitspanne in Minuten | text |
| `time-span-mixed` | measurement | Zeitspanne gemischt | text |

## Grade 4

| Type id | Category | Description | Input |
| --- | --- | --- | --- |
| `arithmetic-add-1000` | arithmetic | Addition bis 1000 | text |
| `arithmetic-sub-1000` | arithmetic | Subtraktion bis 1000 | text |
| `arithmetic-mult-10-100` | arithmetic | Multiplikation ×10, ×100 | text |
| `arithmetic-mult-larger` | arithmetic | Größere Multiplikation | text |
| `arithmetic-div-larger` | arithmetic | Größere Division | text |
| `word-multi-step` | word-problem | Mehrstufige Textaufgabe | text |
| `weight-kg-to-t` | measurement | Kilogramm in Tonnen | text |
| `weight-t-to-kg` | measurement | Tonnen in Kilogramm | text |
| `area-m2-to-a` | measurement | Quadratmeter in Ar | text |
| `area-a-to-m2` | measurement | Ar in Quadratmeter | text |
| `area-a-to-ha` | measurement | Ar in Hektar | text |
| `area-ha-to-a` | measurement | Hektar in Ar | text |
| `area-ha-to-m2` | measurement | Hektar in Quadratmeter | text |
| `fraction-identify-circle` | arithmetic | Bruch erkennen (Kreis) | text |
| `fraction-identify-bar` | arithmetic | Bruch erkennen (Balken) | text |
| `fraction-to-decimal` | arithmetic | Bruch als Dezimalzahl | text |
| `visual-diagram-bar-total` | data | Balkendiagramm - Summe | text |
| `visual-diagram-bar-diff` | data | Balkendiagramm - Differenz | text |
| `coordinate-read` | geometry | Koordinaten ablesen | text |
| `written-addition` | arithmetic | Schriftliche Addition | text |
| `written-subtraction` | arithmetic | Schriftliche Subtraktion | text |
| `written-multiplication` | arithmetic | Schriftliche Multiplikation | text |
| `mc-fraction` | arithmetic | Multiple-Choice Bruch | multiple-choice |
| `dd-match-fractions` | arithmetic | Brüche zuordnen (Drag & Drop) | drag-drop |

## Grade 5

| Type id | Category | Description | Input |
| --- | --- | --- | --- |
| `arithmetic-add-10000` | arithmetic | Addition bis 10000 | text |
| `arithmetic-mult-large` | arithmetic | Große Multiplikation (schriftlich) | text |
| `arithmetic-div-large` | arithmetic | Große Division (schriftlich) | text |
| `geometry-rect-perimeter` | geometry | Umfang Rechteck | text |
| `geometry-rect-area` | geometry | Fläche Rechteck | text |
| `geometry-square-perimeter` | geometry | Umfang Quadrat | text |
| `geometry-square-area` | geometry | Fläche Quadrat | text |
| `fraction-add-same` | arithmetic | Brüche addieren (gleicher Nenner) | text |
| `decimal-add` | arithmetic | Dezimalzahlen addieren | text |
| `percent-identify` | arithmetic | Prozent als Bruch | text |
| `percent-of-number` | arithmetic | Prozent einer Zahl | text |
| `negative-add` | arithmetic | Addition mit negativen Zahlen | text |
| `negative-sub` | arithmetic | Subtraktion mit negativen Zahlen | text |
| `geometry-triangle-area` | geometry | Dreiecksfläche berechnen | text |
| `geometry-cuboid-volume` | geometry | Quadervolumen berechnen | text |
