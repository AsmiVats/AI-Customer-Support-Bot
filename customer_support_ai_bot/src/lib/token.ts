import { jwtDecode } from "jwt-decode";

export const extractUserId = (token?: string): string | undefined => {
  const raw = token ?? localStorage.getItem("token")
  if (!raw) return undefined
  try {
  const decoded: any = jwtDecode(raw)
    console.log("Decoded Token Payload:", decoded);

    // prefer direct string fields
    if (typeof decoded?.userId === 'string' && decoded.userId) return decoded.userId
    if (typeof decoded?.sub === 'string' && decoded.sub) return decoded.sub
    if (typeof decoded?.id === 'string' && decoded.id) return decoded.id

    // if userId is an object, try common fields
    const maybeObj = decoded?.userId || decoded?.user
    if (maybeObj && typeof maybeObj === 'object') {
      const idFromObj = maybeObj._id || maybeObj.id || maybeObj.userId
      if (idFromObj) {
        console.log('User id extracted from object:', idFromObj)
        return String(idFromObj)
      }
    }

    console.log("No usable user id found in token payload")
    return undefined
  } catch (error) {
    console.error("Invalid token:", error);
    return undefined
  }
}