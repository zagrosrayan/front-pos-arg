export const processUrl = (
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any>
): string => {
  return url.replace(/\{([^}?]+)\??\}/g, (match, key) => {
    if (params && key in params && params[key] != null) {
      // Replace placeholder with the value if provided
      return encodeURIComponent(params[key])
    } else if (match.includes('?')) {
      // Remove the placeholder if it's optional
      return ''
    } else {
      // Throw an error if the parameter is missing but required
      throw new Error(`Missing required parameter: ${key}`)
    }
  })
}
