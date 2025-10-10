import { uuid } from 'drizzle-orm/pg-core';
import { Uuid } from '../utils';

export const brandedUuid = <Brand extends Uuid<any>>() => uuid().$type<Brand>();
export const primaryUuid = <Brand extends Uuid<any>>() =>
  brandedUuid<Brand>().primaryKey().defaultRandom().notNull();
