import { test, expect } from "@playwright/test";

// Reuses the same bootstrap admin credentials the rest of the dev workflow
// uses (see .env's ADMIN_EMAIL/ADMIN_PASSWORD, and src/lib/adminUsers.ts).
// There's no separate e2e fixture user — if these aren't set, the admin
// table either isn't bootstrapped yet or credentials are unknown, so the
// test skips rather than failing on an environment it can't drive.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

test.describe("publicar um post e comentar nele", () => {
  test.skip(
    !ADMIN_EMAIL || !ADMIN_PASSWORD,
    "ADMIN_EMAIL/ADMIN_PASSWORD não definidos no ambiente — necessários para logar como admin neste teste.",
  );

  test("login admin -> cria e publica um post -> aparece no site -> comentar", async ({
    page,
  }) => {
    const title = `Post de teste e2e ${Date.now()}`;
    const excerpt = "Resumo gerado automaticamente pelo teste e2e.";
    let postId = "";

    await test.step("login como admin", async () => {
      await page.goto("/admin/login");
      await page.fill("#email", ADMIN_EMAIL!);
      await page.fill("#password", ADMIN_PASSWORD!);
      await page.click('form button[type="submit"]');
      await page.waitForURL("**/admin");
    });

    await test.step("cria e publica um post", async () => {
      await page.goto("/admin/posts/novo");
      await page.fill("#title", title);
      await page.fill("#excerpt", excerpt);
      // index 0 is the disabled "Selecione..." placeholder; any real
      // category works, the test only needs a valid categoryId.
      await page.selectOption("#categoryId", { index: 1 });
      await page.check("#published");
      await page.click('button[type="submit"]:has-text("Criar post")');
      // createPost() redirects to the edit page of the post it just created.
      // The negative lookahead excludes "novo" itself: without it, this
      // pattern also matches the current /admin/posts/novo URL, and
      // waitForURL resolves immediately (before the redirect happens)
      // instead of waiting for the actual navigation.
      await page.waitForURL(/\/admin\/posts\/(?!novo$)[^/]+$/);
      postId = new URL(page.url()).pathname.split("/").pop()!;
      expect(postId).toBeTruthy();
    });

    await test.step("aparece no site público", async () => {
      await page.goto("/");
      await page.getByRole("link", { name: title }).first().click();
      await page.waitForURL(/\/post\//);
      await expect(page.locator("h1")).toContainText(title);
    });

    await test.step("envia um comentário", async () => {
      await page.fill("#authorName", "Comentarista E2E");
      await page.fill("#body", "Comentário automatizado enviado pelo teste e2e.");
      // Honeypot field (#website) is deliberately left untouched.
      await page.click('form button[type="submit"]:has-text("Comentar")');
      await expect(page.getByText("Comentário enviado!")).toBeVisible();
    });

    await test.step("limpeza: exclui o post de teste (o comentário cai em cascata)", async () => {
      page.once("dialog", (dialog) => dialog.accept());
      await page.goto(`/admin/posts/${postId}`);
      await page.click('button:has-text("Excluir post")');
      await page.waitForURL("**/admin/posts");
    });
  });
});
