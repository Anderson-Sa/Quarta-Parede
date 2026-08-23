import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("strips accents", () => {
    expect(slugify("Programação Reação Ação")).toBe("programacao-reacao-acao");
  });

  it("removes non-alphanumeric characters", () => {
    expect(slugify("C++ & Rust: o duelo!")).toBe("c-rust-o-duelo");
  });

  it("collapses repeated whitespace/hyphens", () => {
    expect(slugify("um   dois---tres")).toBe("um-dois-tres");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  -Olá Mundo-  ")).toBe("ola-mundo");
  });

  it("returns empty string for input with no valid characters", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("uniqueSlug", () => {
  it("returns the base slug when it's not taken", async () => {
    const result = await uniqueSlug("meu-post", async () => false);
    expect(result).toBe("meu-post");
  });

  it("appends -2, -3, ... until an untaken slug is found", async () => {
    const taken = new Set(["meu-post", "meu-post-2", "meu-post-3"]);
    const result = await uniqueSlug("meu-post", async (slug) => taken.has(slug));
    expect(result).toBe("meu-post-4");
  });
});
