import {unlink} from 'fs/promises'

export async function removeFile(path) {
  try {
    await unlink(path)
  } catch (error) {
    console.log('removeFile error : ', error.message)
  }
}

export function checkIsInArray(array, value) {
  return array.some(item => item === value)
}