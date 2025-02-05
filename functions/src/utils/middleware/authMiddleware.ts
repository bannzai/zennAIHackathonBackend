import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";
import { auth } from "../firebase/firebase";

interface AuthRequest extends Request {
  userID?: string;
  idToken?: admin.auth.DecodedIdToken;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (process.env.APP_ENV === "local") {
    next();
    return;
  }

  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "認証されていません" });
    return;
  }

  const idToken = authorizationHeader.split("Bearer ")[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const userID = decodedToken.uid;

    if (req.body.userRequest?.userID) {
      if (req.body.userRequest.userID !== userID) {
        res.status(403).json({ message: "権限がありません" });
        return;
      }
    }

    req.userID = userID;
    req.idToken = decodedToken;
    next();
  } catch (error) {
    next(error);
  }
};
