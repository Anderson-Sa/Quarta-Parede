import { describe, expect, it } from "vitest";
import { categorySchema, firstIssueMessage, postSchema, siteSettingsSchema } from "./validation";

const validPost = {
  title: "Meu Post",
  excerpt: "Um resumo qualquer.",
  content: "Conteúdo do post.",
  coverImageUrl: "",
  categoryId: "cat-1",
  published: true,
};

describe("postSchema", () => {
  it("accepts a valid post", () => {
    const result = postSchema.safeParse(validPost);
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = postSchema.safeParse({ ...validPost, title: "  " });
    expect(result.success).toBe(false);
  });

  it("rejects a title over 200 characters", () => {
    const result = postSchema.safeParse({ ...validPost, title: "a".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("rejects content over 60000 characters", () => {
    const result = postSchema.safeParse({ ...validPost, content: "a".repeat(60001) });
    expect(result.success).toBe(false);
  });

  it("treats an empty coverImageUrl as undefined", () => {
    const result = postSchema.parse({ ...validPost, coverImageUrl: "" });
    expect(result.coverImageUrl).toBeUndefined();
  });

  it("accepts an http(s) coverImageUrl", () => {
    const result = postSchema.safeParse({
      ...validPost,
      coverImageUrl: "https://example.com/image.png",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a data:image/... coverImageUrl", () => {
    const result = postSchema.safeParse({
      ...validPost,
      coverImageUrl: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-image data: URI", () => {
    const result = postSchema.safeParse({
      ...validPost,
      coverImageUrl: "data:text/html;base64,PHNjcmlwdD48L3NjcmlwdD4=",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid URL scheme", () => {
    const result = postSchema.safeParse({ ...validPost, coverImageUrl: "javascript:alert(1)" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing categoryId", () => {
    const result = postSchema.safeParse({ ...validPost, categoryId: "" });
    expect(result.success).toBe(false);
  });
});

describe("categorySchema", () => {
  it("accepts a valid category name", () => {
    expect(categorySchema.safeParse({ name: "Tecnologia" }).success).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(categorySchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("rejects a name over 100 characters", () => {
    expect(categorySchema.safeParse({ name: "a".repeat(101) }).success).toBe(false);
  });
});

describe("siteSettingsSchema", () => {
  const valid = {
    siteName: "Quarta Parede",
    slogan: "Um blog geek",
    logoUrl: "",
    footerText: "Rodapé do site",
  };

  it("accepts valid settings", () => {
    expect(siteSettingsSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an empty siteName", () => {
    expect(siteSettingsSchema.safeParse({ ...valid, siteName: "" }).success).toBe(false);
  });

  it("rejects an invalid logoUrl", () => {
    expect(siteSettingsSchema.safeParse({ ...valid, logoUrl: "not-a-url" }).success).toBe(false);
  });
});

describe("firstIssueMessage", () => {
  it("returns the first validation issue message", () => {
    const result = postSchema.safeParse({ ...validPost, title: "" });
    if (result.success) throw new Error("expected failure");
    expect(firstIssueMessage(result.error)).toBe("Informe um título.");
  });
});
