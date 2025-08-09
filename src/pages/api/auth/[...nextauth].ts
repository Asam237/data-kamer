import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth"

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {},
            async authorize(credentials, req) {
                const res = await fetch("http://127.0.0.1:3010/auth/login", {
                    method: 'POST',
                    body: JSON.stringify(credentials),
                    headers: { "Content-Type": "application/json" }
                })
                const user = await res.json()
                if (res.ok && user) {
                    return user
                }
                return null
            }
        })
    ],
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
        error: '/auth/error',
        verifyRequest: '/auth/verify-request',
        newUser: '/auth/new-user',
    },
    callbacks: {
        async jwt({ user }: any) {
            return user;
        },
        async session({ session }: any) {
            return session;
        }
    }
}


export default NextAuth(authOptions)