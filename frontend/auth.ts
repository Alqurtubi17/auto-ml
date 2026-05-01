import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma) as any,
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) {
      throw new Error("Invalid credentials");
    }

    // Defensive retry for cold starts
    let user = null;
    for (let i = 0; i < 3; i++) {
      try {
        user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        break;
      } catch (err) {
        if (i === 2) throw err;
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    if (!user || !user.password) {
      throw new Error("Invalid credentials");
    }

    const isCorrectPassword = await bcrypt.compare(
      credentials.password as string,
      user.password
    );

    if (!isCorrectPassword) {
      throw new Error("Invalid credentials");
    }

    return user;
  },
}),
],
callbacks: {
async session({ token, session }) {
  if (token.sub && session.user) {
    session.user.id = token.sub;
  }
  if (token.role && session.user) {
    session.user.role = token.role as string;
  }
  return session;
},
async jwt({ token, user }) {
  if (!token.sub) return token;

  // Defensive retry for cold starts
  let existingUser = null;
  for (let i = 0; i < 3; i++) {
    try {
      existingUser = await prisma.user.findUnique({
        where: { id: token.sub },
      });
      break;
    } catch (err) {
      if (i === 2) {
        console.error("JWT Database Error:", err);
        return token;
      }
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  if (!existingUser) return token;
  token.role = existingUser.role;
  return token;
},
},
});