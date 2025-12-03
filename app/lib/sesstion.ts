import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const secret = process.env.NEXTAUTH_SECRET;
const encocdKey = new TextEncoder().encode(secret);

type SesstionPayload = {
  userId: string;
  expiresAt: Date;
};
export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, expiresAt });

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: true,
    expires:expiresAt,
  });
  
}

export async function destroySession() {
    (await cookies()).delete("session");
}

export async function encrypt(payload: SesstionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encocdKey);
}

export async function decrypt(session: string | undefined = ""){
    try{
        const { payload } = await jwtVerify(session, encocdKey, {
            algorithms: ["HS256"],
        });
        return payload
    }catch(error){
        console.log("Failed to decrypt session: "+error);
    }
}
