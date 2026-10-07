/* Set endpoint to the deployed signup service. A configured service always wins.
 * Localhost/file previews use the local interaction adapter only when endpoint is empty.
 * See docs/预约接口接入.md for the request/response contract and preview scenarios.
 */
window.BOXZY_SIGNUP = {
 endpoint: '/api/email-subscription/subscribe',
 timeoutMs: 10000
};
