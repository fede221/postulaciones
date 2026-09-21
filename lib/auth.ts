import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "./rateLimit";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.trim().toLowerCase();

        // Brute-force brake: 8 attempts per account every 15 minutes.
        if (!checkRateLimit(`login:${email}`, 8, 15 * 60 * 1000).ok) return null;

        const admin = await prisma.admin.findUnique({ where: { email } });

        if (!admin) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          admin.password
        );

        if (!passwordMatch) return null;

        return { id: admin.id, email: admin.email, name: admin.name };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.email = token.email;
      }
      return session;
    },
  },
};
