import {getRequestConfig} from 'next-intl/server'

export default getRequestConfig(async ({locale}) => {
  const active = locale || 'en'
  return {
    locale: active,
    messages: (await import(`../../messages/${active}.json`)).default
  }
})


