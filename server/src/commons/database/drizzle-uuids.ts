import { uuid } from 'drizzle-orm/pg-core';
import { Uuid } from '@/commons/utils';

export const brandedUuid = <Brand extends Uuid<any>>(name: string) =>
  uuid(name).$type<Brand>();

export const primaryUuid = <Brand extends Uuid<any>>() =>
  uuid().$type<Brand>().primaryKey().defaultRandom().notNull();
