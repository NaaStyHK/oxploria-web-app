import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { readFile } from 'node:fs/promises'

let environment: RulesTestEnvironment

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId: 'demo-oxploria-rules',
    firestore: { rules: await readFile('docs/security/firestore-rules-proposed.rules', 'utf8') },
  })
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'Barcelona', 'public-place'), { name: 'Barcelona' })
    await setDoc(doc(context.firestore(), 'La-Rochelle', 'public-place'), { name: 'La Rochelle' })
  })
})

afterAll(async () => environment.cleanup())

describe.each(['Barcelona', 'La-Rochelle'])('%s public content rules', (collectionName) => {
  it('allows unauthenticated reads', async () => {
    const database = environment.unauthenticatedContext().firestore()
    await assertSucceeds(getDoc(doc(database, collectionName, 'public-place')))
  })

  it('denies create, update and delete', async () => {
    const database = environment.unauthenticatedContext().firestore()
    await expect(assertFails(setDoc(doc(database, collectionName, 'created'), { name: 'blocked' }))).resolves.toBeDefined()
    await expect(assertFails(updateDoc(doc(database, collectionName, 'public-place'), { name: 'blocked' }))).resolves.toBeDefined()
    await expect(assertFails(deleteDoc(doc(database, collectionName, 'public-place')))).resolves.toBeDefined()
  })
})
