import chalk from 'chalk';

const ORANGE = chalk.hex('#E8955A');
const DIM = chalk.dim;

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * Search the web using DuckDuckGo.
 * Returns up to maxResults results.
 */
export async function webSearch(query: string, maxResults: number = 3): Promise<SearchResult[]> {
  try {
    // Lazy import duck-duck-scrape (it may not be available in all environments)
    const dds = await import('duck-duck-scrape').catch(() => null);
    if (!dds) {
      return fallbackSearch(query);
    }

    const results = await dds.search(query, { safeSearch: dds.SafeSearchType.OFF });

    return (results.results ?? []).slice(0, maxResults).map((r: {
      title?: string;
      url?: string;
      description?: string;
    }) => ({
      title: r.title ?? '',
      url: r.url ?? '',
      snippet: r.description ?? '',
    }));
  } catch {
    return fallbackSearch(query);
  }
}

/**
 * Fallback: use DuckDuckGo instant answer API.
 */
async function fallbackSearch(query: string): Promise<SearchResult[]> {
  try {
    const encoded = encodeURIComponent(query);
    const res = await fetch(`https://api.duckduckgo.com/?q=${encoded}&format=json&no_redirect=1&no_html=1`);
    if (!res.ok) return [];

    const data = await res.json() as {
      AbstractText?: string;
      AbstractURL?: string;
      AbstractSource?: string;
      RelatedTopics?: Array<{ Text?: string; FirstURL?: string }>;
    };

    const results: SearchResult[] = [];

    if (data.AbstractText && data.AbstractURL) {
      results.push({
        title: data.AbstractSource ?? query,
        url: data.AbstractURL,
        snippet: data.AbstractText.slice(0, 300),
      });
    }

    const topics = (data.RelatedTopics ?? []).slice(0, 2);
    for (const topic of topics) {
      if (topic.Text && topic.FirstURL) {
        results.push({
          title: topic.Text.slice(0, 80),
          url: topic.FirstURL,
          snippet: topic.Text.slice(0, 200),
        });
      }
    }

    return results;
  } catch {
    return [];
  }
}

/**
 * Format search results for display in terminal.
 */
export function printSearchResults(query: string, results: SearchResult[]): void {
  console.log(`\n ${ORANGE('◆')} ${DIM('web:')} ${chalk.white(query)}\n`);

  if (results.length === 0) {
    console.log(` ${DIM('No results found.')}\n`);
    return;
  }

  results.forEach((r, i) => {
    console.log(` ${chalk.white(`${i + 1}.`)} ${chalk.white(r.title)}`);
    console.log(`    ${DIM(r.url)}`);
    if (r.snippet) {
      console.log(`    ${DIM(r.snippet.slice(0, 150))}${r.snippet.length > 150 ? DIM('...') : ''}`);
    }
    console.log('');
  });
}

/**
 * Format search results for injection into AI context.
 */
export function formatSearchContext(query: string, results: SearchResult[]): string {
  if (results.length === 0) {
    return `--- WEB SEARCH ---\nQuery: ${query}\nNo results found.\n--- END WEB SEARCH ---`;
  }

  const lines = [`--- WEB SEARCH RESULTS ---`, `Query: "${query}"`, ``];

  results.forEach((r, i) => {
    lines.push(`${i + 1}. ${r.title}`);
    lines.push(`   URL: ${r.url}`);
    lines.push(`   ${r.snippet}`);
    lines.push('');
  });

  lines.push('--- END WEB SEARCH RESULTS ---');
  return lines.join('\n');
}
