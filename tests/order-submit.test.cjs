const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')
const React = require('react')
const { renderToString } = require('react-dom/server')
const { useForm } = require('react-hook-form')

const filename = path.resolve(__dirname, '../utils/handleOrderSubmit.ts')
const compiled = new Module(filename, module)
compiled._compile(
  ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  filename
)
const { handleOrderSubmit } = compiled.exports

function makeForm(defaultValues) {
  let form
  function Probe() {
    form = useForm({ defaultValues })
    return null
  }
  renderToString(React.createElement(Probe))
  form.control._state.mount = true
  // Mirror useForm's root subscription, which server rendering doesn't mount.
  form.control._subjects.state.subscribe({
    next: (state) => Object.assign(form.control._formState, state),
  })
  return form
}

for (const field of ['reserve_number', 'customer_id']) {
  test(`corrected ${field} can be submitted without reloading`, async () => {
    const form = makeForm({ [field]: '' })
    let successfulRequests = 0
    const submit = handleOrderSubmit(form, (data) => {
      if (!data[field]) {
        form.setError(field, { type: 'manual', message: 'Required' })
        return
      }
      successfulRequests++
    })

    await submit()
    await submit()
    assert.equal(successfulRequests, 0, 'missing identity still blocks submission')
    assert.ok(form.control._formState.errors[field])

    form.setValue(field, '123')
    // Confirm the original handleSubmit cannot retry this corrected selector.
    await form.handleSubmit(() => successfulRequests++)()
    assert.equal(successfulRequests, 0)

    await submit()
    assert.equal(successfulRequests, 1)
    assert.equal(form.getValues(field), '123', 'retry preserves entered values')
  })
}

test('retry clears server-only errors but still runs registered field rules', async () => {
  const form = makeForm({ name: '' })
  form.register('name', { required: 'Name is required' })
  form.setError('discount', { type: 'manual', message: 'Server error' })
  let requests = 0
  const submit = handleOrderSubmit(form, () => requests++)
  await submit()
  assert.equal(requests, 0)
  assert.equal(form.control._formState.errors.name.type, 'required')
  form.setValue('name', 'Guest')
  await submit()
  assert.equal(requests, 1)
})
