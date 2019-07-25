let parse = (obj) => {
  return Object.keys(obj || {}).map(k => `${k}=${obj[k]}`).join('&')
}

let path = `?a=1&b=2&c=3`
