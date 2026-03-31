import { Prisma, PrismaClient } from "@prisma/client";
import { prisma as prismaClient } from "../../modules/auth_module/src/config/prisma";

export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected prisma: PrismaClient;
  protected abstract model: any;

  constructor(model?: any) {
    this.prisma = prismaClient;
    this.model = model || this.getDefaultModel();
  }

  protected abstract getDefaultModel(): any;

  public async findById(id: string): Promise<T | null> {
    return await this.prisma[this.model as keyof typeof this.prisma].findUnique({
      where: { id },
    }) as T | null;
  }

  public async findMany(args?: {
    where?: any;
    include?: any;
    select?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
  }): Promise<T[]> {
    return await this.prisma[this.model as keyof typeof this.prisma].findMany(args) as T[];
  }

  public async create(data: CreateInput): Promise<T> {
    return await this.prisma[this.model as keyof typeof this.prisma].create({
      data,
    }) as T;
  }

  public async update(id: string, data: UpdateInput): Promise<T> {
    return await this.prisma[this.model as keyof typeof this.prisma].update({
      where: { id },
      data,
    }) as T;
  }

  public async delete(id: string): Promise<T> {
    return await this.prisma[this.model as keyof typeof this.prisma].delete({
      where: { id },
    }) as T;
  }

  public async count(where?: any): Promise<number> {
    return await this.prisma[this.model as keyof typeof this.prisma].count({ where });
  }

  public async findFirst(args: {
    where?: any;
    include?: any;
    select?: any;
    orderBy?: any;
  }): Promise<T | null> {
    return await this.prisma[this.model as keyof typeof this.prisma].findFirst(args) as T | null;
  }
}