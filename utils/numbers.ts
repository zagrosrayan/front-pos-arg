export const toPersianDigits = (text: string): string => {
  return text.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)])
}
