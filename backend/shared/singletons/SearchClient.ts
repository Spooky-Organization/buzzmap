import { MeiliSearch, Index } from "meilisearch";
import { PaginationMeta, UserRole } from "../types";

const MEILISEARCH_HOST = process.env["MEILISEARCH_HOST"] || "http://localhost:7700";
const MEILISEARCH_API_KEY = process.env["MEILISEARCH_API_KEY"] || "";

export interface SearchableDocument {
  id: string;
  [key: string]: unknown;
}

export interface SearchResult<T> {
  hits: T[];
  totalHits: number;
  processingTimeMs: number;
}

export interface MultiSearchResult {
  businesses?: SearchResult<SearchableDocument>;
  products?: SearchResult<SearchableDocument>;
  povs?: SearchResult<SearchableDocument>;
}

export class SearchClient {
  private static instance: SearchClient;
  private client: MeiliSearch;
  private initialized: boolean = false;

  private constructor() {
    this.client = new MeiliSearch({
      host: MEILISEARCH_HOST,
      apiKey: MEILISEARCH_API_KEY,
    });
  }

  public static getInstance(): SearchClient {
    if (!SearchClient.instance) {
      SearchClient.instance = new SearchClient();
    }
    return SearchClient.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const health = await this.client.health();
      console.log(`[${new Date().toISOString()}] SearchClient: Connected to Meilisearch at ${MEILISEARCH_HOST}`);
      this.initialized = true;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] SearchClient: Failed to connect to Meilisearch`, error);
    }
  }

  public getBusinessesIndex(): Index {
    return this.client.index("businesses");
  }

  public getProductsIndex(): Index {
    return this.client.index("products");
  }

  public getPovsIndex(): Index {
    return this.client.index("povs");
  }

  public async searchBusinesses(
    query: string,
    options?: { limit?: number; offset?: number; filter?: string }
  ): Promise<SearchResult<SearchableDocument>> {
    const results = await this.getBusinessesIndex().search(query, {
      limit: options?.limit || 20,
      offset: options?.offset || 0,
      filter: options?.filter,
    });
    return {
      hits: results.hits as SearchableDocument[],
      totalHits: results.estimatedTotalHits || 0,
      processingTimeMs: results.processingTimeMs,
    };
  }

  public async searchProducts(
    query: string,
    options?: { limit?: number; offset?: number; filter?: string }
  ): Promise<SearchResult<SearchableDocument>> {
    const results = await this.getProductsIndex().search(query, {
      limit: options?.limit || 20,
      offset: options?.offset || 0,
      filter: options?.filter,
    });
    return {
      hits: results.hits as SearchableDocument[],
      totalHits: results.estimatedTotalHits || 0,
      processingTimeMs: results.processingTimeMs,
    };
  }

  public async searchPovs(
    query: string,
    options?: { limit?: number; offset?: number; filter?: string }
  ): Promise<SearchResult<SearchableDocument>> {
    const results = await this.getPovsIndex().search(query, {
      limit: options?.limit || 20,
      offset: options?.offset || 0,
      filter: options?.filter,
    });
    return {
      hits: results.hits as SearchableDocument[],
      totalHits: results.estimatedTotalHits || 0,
      processingTimeMs: results.processingTimeMs,
    };
  }

  public async searchAll(
    query: string,
    options?: { limitPerIndex?: number }
  ): Promise<MultiSearchResult> {
    const limit = options?.limitPerIndex || 10;
    const [businesses, products, povs] = await Promise.all([
      this.searchBusinesses(query, { limit }).catch(() => ({
        hits: [] as SearchableDocument[],
        totalHits: 0,
        processingTimeMs: 0,
      })),
      this.searchProducts(query, { limit }).catch(() => ({
        hits: [] as SearchableDocument[],
        totalHits: 0,
        processingTimeMs: 0,
      })),
      this.searchPovs(query, { limit }).catch(() => ({
        hits: [] as SearchableDocument[],
        totalHits: 0,
        processingTimeMs: 0,
      })),
    ]);

    return { businesses, products, povs };
  }

  public async indexBusiness(doc: SearchableDocument): Promise<void> {
    await this.getBusinessesIndex().addDocuments([doc]);
  }

  public async indexProduct(doc: SearchableDocument): Promise<void> {
    await this.getProductsIndex().addDocuments([doc]);
  }

  public async indexPov(doc: SearchableDocument): Promise<void> {
    await this.getPovsIndex().addDocuments([doc]);
  }

  public async deleteBusiness(id: string): Promise<void> {
    await this.getBusinessesIndex().deleteDocument(id);
  }

  public async deleteProduct(id: string): Promise<void> {
    await this.getProductsIndex().deleteDocument(id);
  }

  public async deletePov(id: string): Promise<void> {
    await this.getPovsIndex().deleteDocument(id);
  }
}

export const searchClient = SearchClient.getInstance();