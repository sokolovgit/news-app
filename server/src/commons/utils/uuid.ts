import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

export type Uuid<T = unknown> = string & { __brand: T };

export const isUuid = <T extends Uuid<any>>(value: string): value is T => {
  return z.uuid().safeParse(value).success;
};

export function asUuid<T extends Uuid<any>>(value: string): T;
export function asUuid<T extends Uuid<any>>(value: string | null): T | null;
export function asUuid<T extends Uuid<any>>(
  value: string | undefined,
): T | undefined;

export function asUuid<T extends Uuid<any>>(
  value: string | null | undefined,
): T | null | undefined {
  return value as T | null | undefined;
}

export const uuid = <T extends Uuid<any>>(): T => {
  return uuidv4() as T;
};
