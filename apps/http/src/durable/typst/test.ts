/**
 * Runs a scheduled job at a given time and returns the start and end dates for the job.
 *
 * @param {Date} currTime - The current date time.
 * @param {number} [num_days=30] - The number of days of emails to look through
 * @param {number} [monthChunks=4] - The number of months to iterate over
 * @return {*}
 */
export function runScheduled(
  currTime: Date,
  num_days = 30,
  monthChunks = 4,
): { start_date: Date; end_date: Date } {
  // const hour = currTime.getHours();
  // const now = moment();
  // const i = hour % monthChunks;
  // const end_date = now.subtract("days", i * num_days);
  // const start_date = end_date.subtract("days", num_days);
  // return { start_date, end_date };
}
