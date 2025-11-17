import type { RepeatOptions, JobSchedulerTemplateOptions } from 'bullmq';

export interface UpsertJobSchedulerConfig<SchedulerId extends string, JobData> {
  /**
   * Unique identifier for the job scheduler
   */
  jobSchedulerId: SchedulerId;

  /**
   * Repeat options for the schedule
   * (BullMQ will inject the `key` automatically)
   */
  repeatOptions: Omit<RepeatOptions, 'key'>;

  /**
   * Template for the jobs created by the scheduler
   */
  template?: {
    name?: SchedulerId;
    data?: JobData;
    opts?: JobSchedulerTemplateOptions;
  };
}
