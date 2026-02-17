"use client"

import { useActionState, useEffect } from "react"
import { login } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DiamondsFour, Lock } from "@phosphor-icons/react"

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null)

  useEffect(() => {
    if (state?.success) {
      window.location.href = "/admin"
    }
  }, [state])

  return (
    <Card className="border-border">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary">
          <DiamondsFour className="h-6 w-6 text-primary-foreground" weight="fill" />
        </div>
        <CardTitle className="text-xl">Datum Gems Hub</CardTitle>
        <CardDescription>Enter the admin password to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter admin password"
                  className="pl-9"
                  required
                  autoFocus
                />
              </div>
            </div>
            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Authenticating..." : "Sign in"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
