import dotenv from 'dotenv'
import { $ } from 'execa'

dotenv.config({
  path: 'capacitor.env'
})

run()

async function run() {
  const $$ = $({ shell: true, stdout: 'inherit' })

  await $$`npm run build` // build PWA
  await $$`cap sync` // copy web assets to ./android

  const buildArgs = [
    '--keystorepath $ANDROID_KEYSTORE_PATH',
    '--keystorepass $ANDROID_KEYSTORE_PASSWORD',
    '--keystorealias $ANDROID_KEYSTORE_ALIAS',
    '--keystorealiaspass $ANDROID_KEYSTORE_ALIAS_PASSWORD',
    '--androidreleasetype $ANDROID_RELEASE_TYPE'
  ]
  await $$`cap build android ${buildArgs}`
}
