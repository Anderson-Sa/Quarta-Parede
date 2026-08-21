import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { slugify } from "../src/lib/slug";
import { hexAt } from "../src/lib/categoryColor";
import { categoryCoverImage } from "../src/lib/coverPlaceholder";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const CATEGORIES = ["Cinema", "Animes", "Séries", "Games"];

const SAMPLE_VIDEOS = [
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
];

function buildContent(
  intro: string,
  body: string,
  highlights: string[],
  videoIndex: number,
  posterUrl: string,
) {
  const highlightList = highlights.map((item) => `- ${item}`).join("\n");
  return `## ${intro}

${body}

Confira abaixo um vídeo relacionado ao assunto:

<video controls class="w-full rounded-lg" poster="${posterUrl}">
  <source src="${SAMPLE_VIDEOS[videoIndex % SAMPLE_VIDEOS.length]}" type="video/mp4" />
</video>

### Destaques

${highlightList}`;
}

const POSTS: {
  category: string;
  title: string;
  excerpt: string;
  intro: string;
  body: string;
  highlights: string[];
}[] = [
  // Cinema
  {
    category: "Cinema",
    title: "Novo trailer de super-herói divide opiniões dos fãs",
    excerpt: "O estúdio divulgou o primeiro trailer completo e a internet já está em polvorosa.",
    intro: "Um trailer e mil reações",
    body: "O novo trailer trouxe cenas inéditas e um tom mais sombrio do que o esperado. Nos comentários, os fãs se dividem entre empolgação com a nova direção e saudosismo dos filmes anteriores.",
    highlights: ["Elenco renovado", "Trilha sonora original", "Estreia prevista para o próximo ano"],
  },
  {
    category: "Cinema",
    title: "Diretor revela bastidores de cena de ação inédita",
    excerpt: "Em entrevista, o cineasta contou como a sequência mais comentada do filme foi filmada sem efeitos digitais.",
    intro: "Tudo feito na marra",
    body: "Segundo o diretor, a equipe optou por efeitos práticos sempre que possível, o que exigiu semanas de ensaio com os dublês antes das gravações.",
    highlights: ["Coreografia assinada por especialistas em artes marciais", "Cenário construído em escala real", "Poucos cortes de edição na cena final"],
  },
  {
    category: "Cinema",
    title: "Trilogia de ficção científica ganha remasterização em 4K",
    excerpt: "Clássicos do gênero voltam aos cinemas com nova cor, som e efeitos restaurados.",
    intro: "De volta às telonas",
    body: "A remasterização levou mais de um ano e contou com a supervisão da equipe original de fotografia, garantindo fidelidade ao visual lançado décadas atrás.",
    highlights: ["Sessões especiais em cinemas selecionados", "Faixa de áudio remixada em som espacial", "Extras inéditos no lançamento em disco"],
  },
  {
    category: "Cinema",
    title: "Bilheteria surpreende e sequência já está confirmada",
    excerpt: "Resultado acima das expectativas no fim de semana de estreia acelera os planos do estúdio.",
    intro: "Números que impressionam",
    body: "O desempenho nas bilheterias globais superou projeções internas, o que motivou o estúdio a anunciar a continuação antes mesmo do fim do primeiro mês em cartaz.",
    highlights: ["Roteiro da sequência já em desenvolvimento", "Elenco principal deve retornar", "Nova data de estreia anunciada para o próximo ano"],
  },
  {
    category: "Cinema",
    title: "Festival de cinema geek anuncia programação deste ano",
    excerpt: "Evento reúne pré-estreias, painéis com elenco e sessões especiais em várias cidades.",
    intro: "Programação recheada",
    body: "Entre os destaques estão painéis exclusivos com diretores, exibições de curtas independentes e uma mostra dedicada a clássicos cult remasterizados.",
    highlights: ["Ingressos com venda antecipada limitada", "Painéis transmitidos ao vivo", "Espaço dedicado a produções nacionais"],
  },
  // Animes
  {
    category: "Animes",
    title: "Anime da temporada surpreende com animação impecável",
    excerpt: "Estúdio aposta em técnica mista e conquista o público logo no primeiro episódio.",
    intro: "Primeira impressão",
    body: "O episódio de estreia já mostra um cuidado visual raro nas produções atuais, combinando animação tradicional com efeitos digitais.",
    highlights: ["Direção de arte", "Trilha sonora marcante", "Ritmo de narrativa envolvente"],
  },
  {
    category: "Animes",
    title: "Mangá que inspirou o anime chega ao capítulo final",
    excerpt: "Autor confirma que a obra original está próxima do desfecho após anos de publicação.",
    intro: "Reta final",
    body: "Fãs acompanham a novela gráfica desde seu início e agora se preparam para acompanhar como a trama vai amarrar os diversos arcos construídos ao longo da série.",
    highlights: ["Capítulo especial de encerramento anunciado", "Volume colecionável em produção", "Editora confirma tiragem limitada"],
  },
  {
    category: "Animes",
    title: "Estúdio anuncia adaptação de light novel best-seller",
    excerpt: "Obra literária de sucesso ganhará versão animada com equipe de peso por trás da produção.",
    intro: "Do papel para a tela",
    body: "A adaptação promete manter o tom da obra original, com roteiro supervisionado pelo próprio autor da light novel.",
    highlights: ["Elenco de dublagem ainda não revelado", "Primeira temporada com 12 episódios confirmados", "Estreia prevista para o próximo semestre"],
  },
  {
    category: "Animes",
    title: "Trilha sonora de abertura viraliza nas redes sociais",
    excerpt: "Música de abertura da nova temporada já soma milhões de reproduções em poucos dias.",
    intro: "Um hit instantâneo",
    body: "A parceria entre o estúdio de animação e a banda responsável pela trilha rendeu um resultado que rapidamente conquistou a comunidade de fãs.",
    highlights: ["Clipe oficial disponível nas plataformas de streaming", "Single já entrou em paradas musicais", "Versão instrumental lançada separadamente"],
  },
  {
    category: "Animes",
    title: "Convenção reúne milhares de fãs de anime pelo país",
    excerpt: "Evento contou com cosplay, painéis exclusivos e lançamentos de produtos licenciados.",
    intro: "Casa cheia",
    body: "A edição deste ano bateu recorde de público, com filas que começaram a se formar horas antes da abertura dos portões.",
    highlights: ["Concurso de cosplay com premiação especial", "Painéis com dubladores convidados", "Área exclusiva para lançamentos de mangás"],
  },
  // Séries
  {
    category: "Séries",
    title: "Série de mistério é renovada para segunda temporada",
    excerpt: "Sucesso de crítica e público garante continuação confirmada pelo streaming.",
    intro: "Renovação confirmada",
    body: 'Após o final surpreendente da primeira temporada, o streaming confirmou a continuação da trama para o próximo ano.\n\n> "Ainda há muita história para contar", disse a criadora da série.',
    highlights: ["Novos personagens confirmados", "Filmagens previstas para começar em breve", "Criadora original segue como showrunner"],
  },
  {
    category: "Séries",
    title: "Spin-off surpreende crítica ao expandir universo original",
    excerpt: "Produção derivada conquista espaço próprio sem depender da série que a originou.",
    intro: "Vida própria",
    body: "Diferente do que muitos esperavam, o spin-off conseguiu construir uma identidade própria, explorando personagens secundários com profundidade.",
    highlights: ["Elenco majoritariamente novo", "Ambientação alguns anos antes da trama original", "Segunda temporada já cotada"],
  },
  {
    category: "Séries",
    title: "Elenco revela detalhes sobre o final da série",
    excerpt: "Em painel de convenção, atores comentaram bastidores das últimas gravações.",
    intro: "Despedida emocionante",
    body: "Durante o painel, o elenco relembrou momentos marcantes das gravações e comentou como foi encerrar uma produção de tantos anos.",
    highlights: ["Cena final gravada em segredo absoluto", "Roteiro alterado nas últimas semanas", "Especial de despedida confirmado"],
  },
  {
    category: "Séries",
    title: "Streaming bate recorde de audiência com nova produção",
    excerpt: "Número de horas assistidas na primeira semana supera todas as estreias anteriores da plataforma.",
    intro: "Recorde histórico",
    body: "A plataforma divulgou números internos que mostram a nova produção como a estreia de maior sucesso do catálogo até agora.",
    highlights: ["Presença no top 10 em dezenas de países", "Renovação anunciada dias após a estreia", "Trilha sonora original disponível para download"],
  },
  {
    category: "Séries",
    title: "Trailer da temporada final gera expectativa entre fãs",
    excerpt: "Prévia divulgada nas redes sociais promete confrontos decisivos entre os personagens principais.",
    intro: "Contagem regressiva",
    body: "O trailer, divulgado sem aviso prévio, já acumula milhões de visualizações e reacende teorias antigas dos fãs sobre o desfecho da trama.",
    highlights: ["Data de estreia revelada ao final do vídeo", "Retorno de personagens ausentes há temporadas", "Episódio final com duração estendida"],
  },
  // Games
  {
    category: "Games",
    title: "Jogo indie viraliza nas redes sociais antes mesmo do lançamento",
    excerpt: "Trailer de gameplay chama atenção pela proposta única e arte estilizada.",
    intro: "Um indie que promete",
    body: "Com uma proposta de jogabilidade diferente do que estamos acostumados, o título já é apontado como uma das surpresas do ano.",
    highlights: ["Plataformas: PC e consoles", "Gênero: Aventura", "Previsão de lançamento: a definir"],
  },
  {
    category: "Games",
    title: "Grande estúdio anuncia sequência aguardada há anos",
    excerpt: "Anúncio pegou fãs de surpresa durante transmissão especial e já domina as redes sociais.",
    intro: "Finalmente confirmado",
    body: "Após anos de especulação, o estúdio confirmou oficialmente o desenvolvimento da sequência, prometendo novidades na jogabilidade e na narrativa.",
    highlights: ["Motor gráfico totalmente novo", "Mundo aberto maior que o jogo anterior", "Beta fechado previsto para os próximos meses"],
  },
  {
    category: "Games",
    title: "Atualização gratuita traz novo modo multiplayer",
    excerpt: "Desenvolvedora expande o jogo com conteúdo cooperativo pedido pela comunidade há tempos.",
    intro: "Comunidade atendida",
    body: "A atualização chega sem custo adicional e inclui um modo cooperativo para até quatro jogadores, além de ajustes de balanceamento.",
    highlights: ["Crossplay entre plataformas", "Novos mapas exclusivos do modo", "Progressão compartilhada com o modo principal"],
  },
  {
    category: "Games",
    title: "Campeonato de esports bate recorde de audiência online",
    excerpt: "Final do torneio reuniu milhões de espectadores simultâneos nas plataformas de streaming.",
    intro: "Recorde nas transmissões",
    body: "A grande final movimentou a comunidade competitiva e consolidou o título como um dos principais nomes do cenário de esports atual.",
    highlights: ["Premiação recorde para a equipe campeã", "Transmissão em múltiplos idiomas", "Próxima temporada já tem data confirmada"],
  },
  {
    category: "Games",
    title: "Remake de clássico dos anos 2000 ganha data de lançamento",
    excerpt: "Produção revisita um dos títulos mais queridos da geração com gráficos totalmente refeitos.",
    intro: "Nostalgia renovada",
    body: "O remake mantém a essência da história original, mas chega com gráficos, trilha sonora e sistema de combate completamente repaginados.",
    highlights: ["Dublagem em português confirmada", "Edição de colecionador anunciada", "Demo gratuita disponível antes do lançamento"],
  },
];

async function main() {
  const categoryMap = new Map<string, string>();

  for (const name of CATEGORIES) {
    const slug = slugify(name);
    const category = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    categoryMap.set(name, category.id);
  }

  // Same ordering the site uses at runtime (src/lib/categories.ts), so
  // placeholder cover colors match the header/badge colors exactly.
  const orderedCategories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const hexByCategory = new Map<string, string>();
  orderedCategories.forEach((category, index) => {
    hexByCategory.set(category.name, hexAt(index));
  });

  // Group by category, then interleave round-robin so the home feed (sorted
  // desc by publishedAt) mixes categories instead of clustering them.
  const byCategory = new Map<string, typeof POSTS>();
  for (const post of POSTS) {
    const list = byCategory.get(post.category) ?? [];
    list.push(post);
    byCategory.set(post.category, list);
  }
  const interleaved: typeof POSTS = [];
  const maxPerCategory = Math.max(...[...byCategory.values()].map((list) => list.length));
  for (let i = 0; i < maxPerCategory; i++) {
    for (const category of CATEGORIES) {
      const list = byCategory.get(category);
      if (list && list[i]) interleaved.push(list[i]);
    }
  }

  const now = Date.now();
  const HOUR = 60 * 60 * 1000;

  for (const [index, post] of interleaved.entries()) {
    const slug = slugify(post.title);
    const hex = hexByCategory.get(post.category)!;
    const cover = categoryCoverImage(post.category, hex);
    const content = buildContent(post.intro, post.body, post.highlights, index, cover);
    const publishedAt = new Date(now - index * HOUR);

    await prisma.post.upsert({
      where: { slug },
      update: {
        excerpt: post.excerpt,
        content,
        coverImageUrl: cover,
        categoryId: categoryMap.get(post.category)!,
        published: true,
        publishedAt,
      },
      create: {
        title: post.title,
        slug,
        excerpt: post.excerpt,
        content,
        coverImageUrl: cover,
        categoryId: categoryMap.get(post.category)!,
        published: true,
        publishedAt,
      },
    });
  }

  console.log(`Seed concluído: ${POSTS.length} posts.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
