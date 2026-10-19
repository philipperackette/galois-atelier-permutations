[![CI](https://github.com/philipperackette/galois-atelier-permutations/actions/workflows/ci.yml/badge.svg)](https://github.com/philipperackette/galois-atelier-permutations/actions/workflows/ci.yml)

# Atelier permutations

Application pédagogique interactive pour construire graphiquement des permutations et visualiser leurs décompositions en cycles, en transpositions et leur signature.

**En ligne :** https://philipperackette.github.io/galois-atelier-permutations/

## Vérifications automatiques

À chaque push et pull request, GitHub Actions lance ESLint et HTMLHint, puis des tests Playwright dans Chromium, sur écran d'ordinateur et de téléphone. Ils vérifient que chaque page s'ouvre sans erreur JavaScript ni défilement horizontal. Tests propres à ce site : cycles, transpositions, signature et ordre pour toutes les permutations de S₁ à S₆, ainsi que la composition, la conjugaison et le sous-groupe engendré.

Le site lui-même n'a aucune dépendance : `package.json` ne sert qu'à ces vérifications.

```bash
npm ci
npm run lint
npx playwright install chromium
npm test
```
