/* global cycles, transpositions, signature, orderPerm, compose, inverse, identity, isValid, eq */
import { test, expect } from "@playwright/test";
import { adresse, surveiller } from "./outils.js";

test.beforeEach(async ({ page }) => {
  await page.goto(adresse("index.html"));
});

test("toutes les permutations de S₁ à S₆ : cycles, transpositions, signature, ordre", async ({ page }) => {
  const r = await page.evaluate(() => {
    const ecarts = [];
    const toutes = (n) => {
      if (n === 0) return [[]];
      return toutes(n - 1).flatMap((p) => [...Array(n).keys()].map((i) => [...p.slice(0, i), n, ...p.slice(i)]));
    };
    let compte = 0;
    for (let n = 1; n <= 6; n++) for (const p of toutes(n)) {
      compte++;
      const cs = cycles(p);
      // Les cycles redonnent la permutation.
      const q = identity(n);
      for (const c of cs) c.forEach((x, i) => { q[x - 1] = c[(i + 1) % c.length]; });
      if (!eq(q, p)) ecarts.push(`cycles ${p}`);
      // Le produit des transpositions (écrit de gauche à droite, appliqué de droite à gauche) vaut p.
      let prod = identity(n);
      for (const [a, b] of transpositions(cs)) {
        const t = identity(n); t[a - 1] = b; t[b - 1] = a;
        prod = compose(prod, t);
      }
      if (!eq(prod, p)) ecarts.push(`transpositions ${p}`);
      // Signature = parité du nombre d'inversions.
      let inv = 0;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (p[i] > p[j]) inv++;
      if (signature(cs) !== (inv % 2 ? -1 : 1)) ecarts.push(`signature ${p}`);
      // Ordre = plus petit k > 0 tel que pᵏ = id.
      let k = 1, pk = p.slice();
      while (!eq(pk, identity(n))) { pk = compose(p, pk); k++; }
      if (orderPerm(p) !== k) ecarts.push(`ordre ${p}`);
      if (!eq(compose(p, inverse(p)), identity(n))) ecarts.push(`inverse ${p}`);
    }
    return { ecarts, compte, invalides: [[1, 1], [0, 1], [2, 3], [1, "a"]].map((p) => isValid(p.map(Number))) };
  });
  expect(r.compte).toBe(1 + 2 + 6 + 24 + 120 + 720);
  expect(r.ecarts).toEqual([]);
  expect(r.invalides).toEqual([false, false, false, false]);
});

test("interface : analyse, composition, conjugaison, sous-groupe engendré", async ({ page }) => {
  const suivi = surveiller(page);
  await expect(page.locator("#result")).toContainText("(1 2 3)(4 5)");
  await page.getByRole("button", { name: "S₄ : (1 2 3 4)" }).click();
  await expect(page.locator("#result")).toContainText("(1 4)(1 3)(1 2)");
  await page.locator("#perm").fill("1 1 2");
  await page.click("#go");
  await expect(page.locator("#result")).toContainText("Permutation invalide");

  await page.getByRole("button", { name: "Composer σ·τ" }).click();
  await page.click("#gocomp");
  await expect(page.locator("#compResult")).toContainText("ne commutent pas");

  await page.getByRole("button", { name: "Conjuguer τστ⁻¹" }).click();
  await page.click("#goconj");
  await expect(page.locator("#conjResult")).toContainText("τστ⁻¹ = (1 3 2)");
  await expect(page.locator("#conjResult")).toContainText("Identiques ✓");

  await page.getByRole("button", { name: "Sous-groupe ⟨σ⟩" }).click();
  await page.click("#goeng");
  await expect(page.locator("#engResult")).toContainText("cyclique d'ordre 4");
  suivi.verifier();
});
