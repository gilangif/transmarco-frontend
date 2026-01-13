export default function currrency(value) {
  return new Intl.NumberFormat("id-ID").format(value)
}
