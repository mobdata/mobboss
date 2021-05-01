const fetchPromise = (response, json) => new Promise((resolve) => resolve({ response, json }))

export default function callApi(endpoint, method = 'get', body) {
  const target = process.env.NODE_ENV === 'production'
    ? `${window.location.origin}${process.env.REACT_APP_INDEX_ROUTE}/api/${endpoint}`
    : `${window.location.origin}/api/${endpoint}`

  // eslint-disable-next-line no-undef
  return fetch(target, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    method,
    body: JSON.stringify(body),
  })
    .then((response) => response.json().then((json) => ({ response, json })))
    .then(({ response, json }) => fetchPromise(response, json))
}
