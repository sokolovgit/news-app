import { Collector, PublicSource } from '@/sources/domain/enums';
import { SourceId } from '@/sources/domain/schemas';
import { UserId } from '@/users/domain/schemas';

export type CreateSourceProps = {
  id?: SourceId;
  addedBy?: UserId;
  source: PublicSource;
  collector: Collector;
  name: string;
  url: string;
};
