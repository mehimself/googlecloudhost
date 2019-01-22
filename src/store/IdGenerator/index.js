function IdGenerator() {
  const offset = 'a'.charCodeAt(0)
  const limit = 'z'.charCodeAt(0)
  let last = offset
  let lastToken
  return {
    newId: function (idToken) {
      const requiresSuffix = idToken === lastToken
      let suffix
      if (requiresSuffix) {
        let next = last++
        if (last > limit) {
          next = offset
        }
        last = next
        suffix = idToken + String.fromCharCode(next)
      } else {
        last = offset - 1
        suffix = ''
      }
      lastToken = idToken + idToken
      return idToken + suffix
    }
  }
}
export default IdGenerator
