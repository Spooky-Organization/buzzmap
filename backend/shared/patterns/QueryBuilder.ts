import { Prisma } from "@prisma/client";
import { PaginationMeta } from "../types";

export class QueryBuilder {
  protected _where: any = {};
  protected _orderBy: any = {};
  protected _include: any = {};
  protected _select: any = {};
  protected _skip: number = 0;
  protected _take: number = 20;
  protected _page: number = 1;

  public where(conditions: any): this {
    this._where = { ...this._where, ...conditions };
    return this;
  }

  public orderBy(field: string, direction: "asc" | "desc" = "asc"): this {
    this._orderBy = { [field]: direction };
    return this;
  }

  public orderByMultiple(fields: Record<string, "asc" | "desc">): this {
    this._orderBy = fields;
    return this;
  }

  public paginate(page: number = 1, limit: number = 20): this {
    this._page = Math.max(1, page);
    this._take = Math.min(Math.max(1, limit), 100);
    this._skip = (this._page - 1) * this._take;
    return this;
  }

  public limit(count: number): this {
    this._take = Math.min(Math.max(1, count), 100);
    return this;
  }

  public offset(count: number): this {
    this._skip = Math.max(0, count);
    return this;
  }

  public include(relations: Record<string, boolean | any>): this {
    this._include = { ...this._include, ...relations };
    return this;
  }

  public select(fields: Record<string, boolean>): this {
    this._select = fields;
    return this;
  }

  public build() {
    return {
      where: Object.keys(this._where).length ? this._where : undefined,
      orderBy: Object.keys(this._orderBy).length ? this._orderBy : undefined,
      include: Object.keys(this._include).length ? this._include : undefined,
      select: Object.keys(this._select).length ? this._select : undefined,
      skip: this._skip,
      take: this._take,
    };
  }

  public buildPagination(total: number): {
    data: any[];
    meta: PaginationMeta;
  } {
    const totalPages = Math.ceil(total / this._take);
    return {
      data: [],
      meta: {
        page: this._page,
        limit: this._take,
        total,
        totalPages,
        hasNext: this._page < totalPages,
        hasPrevious: this._page > 1,
      },
    };
  }
}

export class FeedQueryBuilder extends QueryBuilder {
  private _feedType: "latest" | "popular" | "following" = "latest";
  private _userId?: string;
  private _businessId?: string;

  public feedType(type: "latest" | "popular" | "following"): this {
    this._feedType = type;
    return this;
  }

  public forUser(userId: string): this {
    this._userId = userId;
    return this;
  }

  public forBusiness(businessId: string): this {
    this._businessId = businessId;
    return this;
  }

  public build() {
    const base = super.build();

    switch (this._feedType) {
      case "popular":
        this._orderBy = { likes: "desc", createdAt: "desc" };
        break;
      case "following":
        if (this._userId) {
          this._where = {
            ...this._where,
            author: { followers: { some: { id: this._userId } } },
          };
        }
        break;
      case "latest":
      default:
        this._orderBy = { createdAt: "desc" };
    }

    if (this._businessId) {
      this._where = { ...this._where, businessId: this._businessId };
    }

    return {
      ...base,
      where: Object.keys(this._where).length ? this._where : undefined,
      orderBy: Object.keys(this._orderBy).length ? this._orderBy : undefined,
    };
  }
}