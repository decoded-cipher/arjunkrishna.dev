const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthsLong = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const IST = 330 * 60 * 1000;
const local = (date: Date) => new Date(date.getTime() + IST);
const day = (date: Date) => String(local(date).getUTCDate()).padStart(2, '0');

export const longDate = (date: Date) =>
  `${local(date).getUTCDate()} ${monthsLong[local(date).getUTCMonth()]} ${local(date).getUTCFullYear()}`;

export const shortDate = (date: Date) =>
  `${day(date)} ${months[local(date).getUTCMonth()]} ${local(date).getUTCFullYear()}`;

export const dayMonth = (date: Date) => `${day(date)} ${months[local(date).getUTCMonth()]}`;

export const yearOf = (date: Date) => local(date).getUTCFullYear();

export const monthYear = (yearMonth: string) => {
  const [year, month] = yearMonth.split('-').map(Number);
  return `${months[month - 1]} ${year}`;
};
