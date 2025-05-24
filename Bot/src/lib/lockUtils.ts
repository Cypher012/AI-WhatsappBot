import fs from 'fs'
import path from 'path'

export const clearProfileLock = () => {
  const lockPath = path.join(
    __dirname,
    'session',
    'session-CLIENT_ID-KEY1',
    'SingletonLock'
  )

  console.log("Checking for Puppeteer SingletonLock:", lockPath)

  if (fs.existsSync(lockPath)) {
    try {
      fs.unlinkSync(lockPath)
      console.log("✅ SingletonLock cleared.")
    } catch (err) {
      console.error("❌ Failed to clear SingletonLock:", err)
    }
  } else {
    console.log("No SingletonLock file found.")
  }
}

export const clearChromiumLocks = () => {
  const profileDir = path.join(__dirname, 'session', 'session-CLIENT_ID-KEY1')
  const lockFiles = ['SingletonLock', 'SingletonSocket', 'DevToolsActivePort']

  lockFiles.forEach(file => {
    const fullPath = path.join(profileDir, file)
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
      console.log(`Removed ${file}`)
    }
  })
}
