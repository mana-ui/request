const factory = () => {
    let interceptor = o => o
    let handle401 = () => {}
    return {
      setInterceptor: handler => {
        interceptor = handler
      },
      set401Handler: handler => {
        handle401 = handler
      },
      request: (endpoint, {query, body, ...options} = {}) => new Promise(async (resolve, reject) => {
          let queryString = query ? Object.entries(query).reduce((s, [k,v]) => {
            if(v !== void 0 && v !== null && v !== ''){
              s.push( `${k}=${v}`)
            }
            return s
          }, []).join('&') : ''
          queryString = queryString && '?'+queryString
          if (body) {
            options.body = JSON.stringify(body)
          }
          try {
            const response = await fetch(`${endpoint}${queryString}`, interceptor(options))
            const { status } = response
            if (status >= 200 && status < 300) {
              resolve(await response.json())
            } else if (status === 401) {
              reject(401)
              handle401()
            } else {
              const e = await response.json()
              reject(e)
            }
          } catch (e) {
            reject(e)
          }
          
      })
    }
  }
  
  const {setInterceptor, request, set401Handler} = factory()
  
  export default request
  export {setInterceptor, set401Handler}