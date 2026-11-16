import bcrypt from 'bcryptjs'

/**
 * Gera o hash bcrypt de uma senha (ex.: DEV_PASSWORD_HASH da aba "Banco").
 *   npm run hash-password -- 'minha senha'
 */
const plain = process.argv[2]
if (!plain) {
  console.error("uso: npm run hash-password -- 'minha senha'")
  process.exit(1)
}
console.log(await bcrypt.hash(plain, 10))
