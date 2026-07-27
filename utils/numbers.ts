export const toPersianDigits = (text: string | number | null | undefined): string => {
  if (text === null || text === undefined) return ''
  return String(text).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)])
}
